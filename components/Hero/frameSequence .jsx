/**
 * Canvas frame-sequence player.
 *  - draw(value): value is a float frame number; two neighbouring frames are
 *    cross-blended (e.g. 41.4 = 60% of #41 + 40% of #42), so motion stays soft
 *    even with only 200 frames.
 *  - prefetch(frame): loads frames around the target in the scroll direction,
 *    cancels downloads that are no longer needed.
 */

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

export function createFrameSequence(
  canvas,
  { total, path, onReady, maxCache = 60, ahead = 28, behind = 10, maxLoads = 6 }
) {
  const ctx = canvas.getContext('2d', { alpha: false })
  const cache = new Map() // index -> ImageBitmap
  const inflight = new Map() // index -> AbortController
  const fails = new Map() // index -> failed attempts

  let queue = []
  let w = 0
  let h = 0
  let current = 0
  let target = 0
  let dir = 1
  let lastKey = ''
  let lastCenter = -1
  let ready = false
  let dead = false

  const nearest = (i) => {
    if (cache.has(i)) return i

    let best = null
    let gap = Infinity

    for (const k of cache.keys()) {
      const d = Math.abs(k - i)
      if (d < gap) {
        gap = d
        best = k
      }
    }

    return best
  }

  const paint = (bitmap, alpha) => {
    const s = Math.max(w / bitmap.width, h / bitmap.height) // object-fit: cover

    ctx.globalAlpha = alpha
    ctx.drawImage(
      bitmap,
      (w - bitmap.width * s) / 2,
      (h - bitmap.height * s) / 2,
      bitmap.width * s,
      bitmap.height * s
    )
  }

  const draw = (value = current, force = false) => {
    current = clamp(value, 0, total - 1)

    if (!w || !h) return

    const i = Math.floor(current)
    const t = current - i
    const a = nearest(i)

    if (a === null) return

    const b = t > 0.01 && cache.has(i + 1) ? i + 1 : null
    const key = `${a}|${b}|${b === null ? 0 : t.toFixed(3)}`

    if (key === lastKey && !force) return
    lastKey = key

    paint(cache.get(a), 1)
    if (b !== null && b !== a) paint(cache.get(b), t)
    ctx.globalAlpha = 1

    if (!ready) {
      ready = true
      onReady?.()
    }
  }

  const evict = () => {
    while (cache.size > maxCache) {
      let far = -1
      let gap = -1

      for (const k of cache.keys()) {
        const d = Math.abs(k - target)
        if (k !== 0 && d > gap) {
          gap = d
          far = k
        }
      }

      if (far < 0) break

      cache.get(far).close()
      cache.delete(far)
    }
  }

  const load = async (i) => {
    const ac = new AbortController()
    inflight.set(i, ac)

    try {
      const res = await fetch(path(i), { signal: ac.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const bitmap = await createImageBitmap(await res.blob())

      if (dead || ac.signal.aborted) {
        bitmap.close()
        return
      }

      cache.set(i, bitmap)
      fails.delete(i)
      evict()
      draw(current)
    } catch (error) {
      if (error.name !== 'AbortError') fails.set(i, (fails.get(i) || 0) + 1)
    } finally {
      inflight.delete(i)
      pump()
    }
  }

  const pump = () => {
    while (!dead && inflight.size < maxLoads && queue.length) {
      const i = queue.shift()
      if (!cache.has(i) && !inflight.has(i)) load(i)
    }
  }

  const prefetch = (frame) => {
    if (frame !== target) dir = frame > target ? 1 : -1
    target = frame

    const c = Math.round(clamp(frame, 0, total - 1))

    if (c === lastCenter) return
    lastCenter = c

    const fwd = dir > 0 ? ahead : behind
    const back = dir > 0 ? behind : ahead
    const wanted = [c]

    for (let d = 1; d <= Math.max(fwd, back); d++) {
      if (d <= fwd && c + d < total) wanted.push(c + d)
      if (d <= back && c - d >= 0) wanted.push(c - d)
    }

    const set = new Set(wanted)
    inflight.forEach((ac, i) => set.has(i) || ac.abort())

    queue = wanted.filter((i) => !cache.has(i) && !inflight.has(i) && (fails.get(i) || 0) < 3)

    pump()
  }

  const resize = () => {
    w = canvas.clientWidth
    h = canvas.clientHeight

    if (!w || !h) return

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.5)

    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    draw(current, true)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)

  resize()
  prefetch(0)

  return {
    draw,
    prefetch,
    destroy() {
      dead = true
      queue = []
      observer.disconnect()
      inflight.forEach((ac) => ac.abort())
      cache.forEach((bitmap) => bitmap.close())
      cache.clear()
    },
  }
}
