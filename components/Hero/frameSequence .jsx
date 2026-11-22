/**
 * Canvas frame sequence with cross-fade between neighbouring frames.
 *
 * draw(5.37) -> draws frame 5 fully, then frame 6 on top at 37% opacity.
 * Frame o'tishlari shu tufayli umuman bilinmaydi.
 */
export function createFrameSequence(
  canvas,
  { total, path, onReady, concurrency = 6, lookahead = 24 }
) {
  const ctx = canvas.getContext('2d', { alpha: false })
  const images = new Array(total).fill(null) // loaded Image objects
  const state = new Array(total).fill(0) // 0 = idle, 1 = loading, 2 = loaded, 3 = failed
  let queue = []
  let active = 0
  let destroyed = false
  let ready = false
  let lastValue = 0
  let width = 0
  let height = 0

  /* ---------- sizing ---------- */

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (w === width && h === height) return
    width = canvas.width = w
    height = canvas.height = h
    render(lastValue)
  }

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
  ro?.observe(canvas)

  /* ---------- drawing ---------- */

  // nearest loaded frame to index i (so we never draw a blank canvas)
  const nearest = (i) => {
    if (images[i]) return images[i]
    for (let d = 1; d < total; d++) {
      if (i - d >= 0 && images[i - d]) return images[i - d]
      if (i + d < total && images[i + d]) return images[i + d]
    }
    return null
  }

  const cover = (img, alpha) => {
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    if (!iw || !ih) return
    const s = Math.max(width / iw, height / ih)
    const dw = iw * s
    const dh = ih * s
    ctx.globalAlpha = alpha
    ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh)
  }

  function render(value) {
    if (!width || !height) return
    const v = Math.min(Math.max(value, 0), total - 1)
    const a = Math.floor(v)
    const b = Math.min(a + 1, total - 1)
    const t = v - a

    const imgA = nearest(a)
    if (!imgA) return
    const imgB = t > 0.001 ? nearest(b) : null

    cover(imgA, 1)
    if (imgB && imgB !== imgA) cover(imgB, t)
    ctx.globalAlpha = 1
  }

  /* ---------- loading ---------- */

  const pump = () => {
    while (!destroyed && active < concurrency && queue.length) {
      const i = queue.shift()
      if (state[i] !== 0) continue
      state[i] = 1
      active++

      const img = new Image()
      img.decoding = 'async'
      img.fetchPriority = i === 0 || Math.abs(i - lastValue) < 2 ? 'high' : 'low'
      img.src = path(i)

      const done = (ok) => {
        active--
        if (destroyed) return
        if (ok) {
          images[i] = img
          state[i] = 2
          if (!ready && i === 0) {
            ready = true
            resize()
            render(lastValue)
            onReady?.()
          } else if (Math.abs(i - lastValue) < 2) {
            render(lastValue)
          }
        } else {
          state[i] = 3
        }
        pump()
      }

      const decode = img.decode ? img.decode() : Promise.resolve()
      decode.then(() => done(true)).catch(() => done(img.complete && img.naturalWidth > 0))
    }
  }

  // Load the poster first; scrolling requests only the nearby frame window.
  queue = [0]
  pump()

  /* ---------- public API ---------- */

  return {
    draw(value) {
      lastValue = value
      render(value)
    },

    // scroll joyiga yaqin kadrlarni birinchi yuklaydi
    prefetch(value) {
      const c = Math.round(value)
      const urgent = new Set()
      for (let d = 0; d <= lookahead; d++) {
        for (const i of [c + d, c - d]) {
          if (i >= 0 && i < total && state[i] === 0) urgent.add(i)
        }
      }
      if (urgent.size) {
        queue = [...urgent]
        pump()
      }
    },

    destroy() {
      destroyed = true
      ro?.disconnect()
      queue = []
      images.fill(null)
    },
  }
}
