/**
 * createFrameSequence(canvas, { total, path, concurrency, lookahead, onReady })
 * -> { draw(f), prefetch(f), destroy() }
 *
 * Strategy:
 *  1. ALL frames are downloaded up-front as small compressed Blobs, nearest-to-scroll first.
 *  2. Only a sliding window around the current frame is decoded to GPU-friendly ImageBitmaps
 *     (decoded off the main thread), so memory stays low and drawing is instant.
 *  3. Fractional frames are cross-blended, and a missing frame falls back to the nearest
 *     decoded one, so the canvas never flashes blank.
 */
export function createFrameSequence(
  canvas,
  { total, path, concurrency = 6, lookahead = 10, onReady } = {},
) {
  const ctx = canvas.getContext('2d', { alpha: false })
  const canBitmap = typeof createImageBitmap === 'function'

  const KEEP_BEHIND = 6
  const KEEP_AHEAD = Math.max(lookahead * 2, 12)

  const blobs = new Array(total).fill(null)
  const bitmaps = new Array(total).fill(null)
  const state = new Uint8Array(total) // 0 idle · 1 loading · 2 done · 3 failed
  const decoding = new Set()
  const abort = new AbortController()

  let cursor = 0 // where the downloader should work next
  let targetF = 0 // frame the scroll wants
  let lastF = 0 // frame currently on screen
  let active = 0
  let cw = 0
  let ch = 0
  let ready = false
  let destroyed = false

  const clamp = (v) => Math.max(0, Math.min(total - 1, v))

  /* ---------- download (priority: forward from cursor, then behind) ---------- */

  const nextIndex = () => {
    let best = -1
    let bestScore = Infinity
    for (let i = 0; i < total; i++) {
      if (state[i] !== 0) continue
      const d = i - cursor
      const score = d >= 0 ? d : -d + total
      if (score < bestScore) {
        best = i
        bestScore = score
      }
    }
    return best
  }

  const load = async (i) => {
    state[i] = 1
    for (let attempt = 0; attempt < 3 && !destroyed; attempt++) {
      try {
        const res = await fetch(path(i), { signal: abort.signal })
        if (!res.ok) throw new Error(String(res.status))
        blobs[i] = await res.blob()
        state[i] = 2
        return
      } catch {
        if (destroyed) return
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
      }
    }
    state[i] = 3
  }

  const pump = () => {
    while (!destroyed && active < concurrency) {
      const i = nextIndex()
      if (i < 0) return
      active++
      load(i).finally(() => {
        active--
        if (destroyed) return
        if (inWindow(i)) decode(i)
        pump()
      })
    }
  }

  /* ---------- decode (sliding window only) ---------- */

  const winLo = () => Math.floor(Math.min(targetF, lastF)) - KEEP_BEHIND
  const winHi = () => Math.ceil(Math.max(targetF, lastF)) + KEEP_AHEAD
  const inWindow = (i) => i >= winLo() && i <= winHi()

  const decode = async (i) => {
    if (bitmaps[i] || decoding.has(i) || !blobs[i]) return
    decoding.add(i)
    try {
      let img
      if (canBitmap) {
        img = await createImageBitmap(blobs[i])
      } else {
        const url = URL.createObjectURL(blobs[i])
        img = new Image()
        img.src = url
        await img.decode()
        URL.revokeObjectURL(url)
      }
      if (destroyed || !inWindow(i)) {
        img.close?.()
      } else {
        bitmaps[i] = img
        if (i === 0 && !ready) markReady()
        else if (i === Math.floor(lastF) || i === Math.ceil(lastF)) render()
      }
    } catch {
      /* ignore a bad frame, the nearest one is used instead */
    }
    decoding.delete(i)
  }

  /* ---------- drawing ---------- */

  const nearest = (i) => {
    if (bitmaps[i]) return bitmaps[i]
    for (let d = 1; d < total; d++) {
      if (bitmaps[i - d]) return bitmaps[i - d]
      if (bitmaps[i + d]) return bitmaps[i + d]
    }
    return null
  }

  const paint = (img, alpha) => {
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    const s = Math.max(cw / iw, ch / ih) // object-fit: cover
    const w = iw * s
    const h = ih * s
    ctx.globalAlpha = alpha
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }

  const render = () => {
    if (!cw || !ch || destroyed) return
    const a = Math.floor(lastF)
    const b = Math.min(a + 1, total - 1)
    const t = lastF - a
    const A = nearest(a)
    if (!A) return
    paint(A, 1)
    if (t > 0.01 && b !== a && bitmaps[b]) paint(bitmaps[b], t)
    ctx.globalAlpha = 1
  }

  const markReady = () => {
    ready = true
    render()
    onReady?.()
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(canvas.clientWidth * dpr)
    const h = Math.round(canvas.clientHeight * dpr)
    if (!w || !h || (w === cw && h === ch)) return
    cw = canvas.width = w
    ch = canvas.height = h
    render()
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  /* ---------- public API ---------- */

  const prefetch = (f) => {
    targetF = clamp(f)
    cursor = Math.round(targetF)

    const lo = winLo()
    const hi = winHi()
    for (let i = 0; i < total; i++) {
      if (i < lo || i > hi) {
        if (bitmaps[i]) {
          bitmaps[i].close?.()
          bitmaps[i] = null
        }
      } else if (!bitmaps[i] && blobs[i]) {
        decode(i)
      }
    }
    pump()
  }

  const draw = (f) => {
    lastF = clamp(f)
    render()
  }

  prefetch(0)

  return {
    draw,
    prefetch,
    destroy() {
      destroyed = true
      abort.abort()
      ro.disconnect()
      for (let i = 0; i < total; i++) {
        bitmaps[i]?.close?.()
        bitmaps[i] = null
        blobs[i] = null
      }
    },
  }
}
