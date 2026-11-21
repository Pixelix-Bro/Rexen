'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DotGrid from '../ui/DotGrid'
import TechText from '../ui/TechText'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  SOZLAMALAR: odatda faqat shu qismni o'zgartirasiz                   */
/* ------------------------------------------------------------------ */

const SHOW_DOT_GRID = false // true qilsangiz fonda DotGrid ham chiqadi
const OVERLAY = 'bg-black/40' // fonni qoraytirish (matn o'qilishi uchun). Qoraroq: bg-black/60
const LOAD_TIMEOUT = 20000 // internet juda sekin bo'lsa, shuncha millisekunddan keyin baribir ochiladi

// Har bir obyekt = bitta to'liq ekranli bo'lim. Qo'shsangiz yoki o'chirsangiz,
// sahifa balandligi va video tezligi avtomatik moslashadi.
const SECTIONS = [
  {
    align: 'center', // left | center | right
    title: 'Sarlavha shu yerda',
    text: 'Qisqa tavsif yoki shior.',
    tech: true, // true bo'lsa shu bo'limda <TechText /> chiqadi
  },
  {
    align: 'left',
    title: "Birinchi ma'lumot",
    text: "Bu yerga xizmatingiz, loyihangiz yoki o'zingiz haqingizda matn yozing.",
  },
  {
    align: 'right',
    title: "Ikkinchi ma'lumot",
    text: 'Yana bir muhim fikr yoki raqamlar.',
  },
  {
    align: 'center',
    title: 'Yakuniy chaqiriq',
    text: "Bog'lanish yoki keyingi qadam haqida.",
    cta: { label: "Bog'lanish", href: '#contact' },
  },
]

/* ------------------------------------------------------------------ */

// extract-frames.mjs skripti shu papkalarga kadrlarni va meta.json ni yozadi
const FRAMES_DIR = '/media/frames'
const FRAMES_DIR_SM = '/media/frames-sm'
const MOBILE_BREAKPOINT = 768

// Kadrlar bir marta to'liq yuklangach, sahifalar orasida qaytganda yuklash ekrani qayta chiqmaydi
let allLoaded = false

const frameSrc = (dir, i) => `${dir}/f_${String(i + 1).padStart(3, '0')}.webp`
const isReady = (img) => !!img && img.complete && img.naturalWidth > 0

/* Ko'rinishga kirganda paydo bo'ladi, chiqib ketganda yashirinadi.
   active=false bo'lsa (yuklash ekrani ochiq paytida) kutib turadi. */
const Reveal = ({ children, className = '', active = true }) => {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        inView && active ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

const ALIGN = {
  left: 'items-start text-left mr-auto',
  center: 'items-center text-center mx-auto',
  right: 'items-end text-right ml-auto',
}

/* Bitta to'liq ekranli bo'lim */
const Panel = ({ align = 'center', active, children }) => (
  <div className="flex h-screen items-center px-6 md:px-16">
    <Reveal active={active} className={`flex w-full max-w-2xl flex-col gap-4 ${ALIGN[align]}`}>
      {children}
    </Reveal>
  </div>
)

const Hero = () => {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const hintRef = useRef(null)
  const loaderRef = useRef(null)
  const [ready, setReady] = useState(allLoaded)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    const dir = window.innerWidth < MOBILE_BREAKPOINT ? FRAMES_DIR_SM : FRAMES_DIR
    const root = document.documentElement

    let cancelled = false
    let finished = allLoaded
    let frames = []
    let count = 0
    let current = 0 // hozir ko'rsatilishi kerak bo'lgan kadr
    let shown = -1 // canvas'da hozir chizilgan kadr
    let lastWidth = 0
    let timer
    let trigger

    // Yuklash tugaguncha scroll qilib bo'lmaydi
    const lock = () => {
      root.style.overflow = 'hidden'
    }
    const unlock = () => {
      root.style.overflow = ''
    }

    const finish = () => {
      if (finished || cancelled) return
      finished = true
      allLoaded = true
      clearTimeout(timer)
      unlock()
      setReady(true)
    }

    // Kadr hali yuklanmagan bo'lsa, eng yaqin yuklanganini topadi
    const nearest = (index) => {
      for (let d = 0; d < count; d++) {
        if (isReady(frames[index - d])) return index - d
        if (isReady(frames[index + d])) return index + d
      }
      return -1
    }

    // "cover" usulida chizadi
    const draw = (index, force = false) => {
      const i = nearest(index)
      if (i < 0 || (i === shown && !force)) return
      shown = i

      const img = frames[i]
      const cw = canvas.width
      const ch = canvas.height
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    }

    // "Scroll" yozuvi: scroll boshlanishi bilan yo'qoladi
    const updateHint = (progress) => {
      if (hintRef.current) hintRef.current.style.opacity = progress > 0.02 ? '0' : '1'
    }

    // Telefonda manzil paneli siljisa qayta chizmaslik uchun faqat kenglikni kuzatadi
    const resize = () => {
      if (window.innerWidth === lastWidth && canvas.width) return
      lastWidth = window.innerWidth
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      draw(current, true)
    }

    const init = async () => {
      let meta
      try {
        const res = await fetch(`${dir}/meta.json`)
        meta = await res.json()
      } catch {
        console.warn(
          `Hero: ${dir}/meta.json topilmadi. Loyiha ildizidan "node scripts/extract-frames.mjs" ni ishga tushiring.`
        )
        finish() // yuklash ekrani qotib qolmasin
        return
      }
      if (cancelled || !meta?.count) {
        finish()
        return
      }

      count = meta.count
      frames = new Array(count)

      // Sekin internetda ham tez-tez kadr ko'rinishi uchun: avval siyrak kadrlar, keyin qolganlari
      const order = []
      const seen = new Set()
      for (const stride of [16, 8, 4, 2, 1]) {
        for (let i = 0; i < count; i += stride) {
          if (!seen.has(i)) {
            seen.add(i)
            order.push(i)
          }
        }
      }

      // Hamma kadrni oldindan yuklaydi va dekodlaydi
      let loaded = 0
      timer = setTimeout(finish, LOAD_TIMEOUT)

      for (const i of order) {
        const img = new Image()
        img.decoding = 'async'
        img.src = frameSrc(dir, i)
        frames[i] = img

        img
          .decode()
          .catch(() => {}) // bitta kadr buzuq bo'lsa ham qolganlari to'xtab qolmasin
          .then(() => {
            if (cancelled) return
            loaded++
            if (loaderRef.current) {
              loaderRef.current.textContent = `${Math.round((loaded / count) * 100)}%`
            }
            draw(current)
            if (loaded === count) finish()
          })
      }

      // Scroll holatini kadr raqamiga aylantiradi (silliqlashni Lenis qiladi)
      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          current = Math.round(self.progress * (count - 1))
          draw(current)
          updateHint(self.progress)
        },
      })
      current = Math.round(trigger.progress * (count - 1))
      draw(current)
      updateHint(trigger.progress)
    }

    if (!allLoaded) lock()
    resize()
    init()
    window.addEventListener('resize', resize)

    return () => {
      cancelled = true
      clearTimeout(timer)
      unlock()
      trigger?.kill()
      window.removeEventListener('resize', resize)
      frames.forEach((img) => {
        if (img) img.onload = null
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-black text-white">
      {/* Yuklash ekrani: hamma kadr tayyor bo'lgach silliq yo'qoladi */}
      <div
        aria-hidden={ready}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-black text-white transition-opacity duration-700 ${
          ready ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <span ref={loaderRef} className="text-5xl font-semibold tabular-nums">
          0%
        </span>
        <span className="text-xs uppercase tracking-widest text-white/50">Yuklanmoqda</span>
      </div>

      {/* 1-qatlam: scroll paytida qotib turadigan fon */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <div className={`absolute inset-0 ${OVERLAY}`} />

        {SHOW_DOT_GRID && (
          <div className="absolute inset-0 z-10">
            <DotGrid />
          </div>
        )}

        {/* "Scroll" yozuvi */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-xs uppercase tracking-widest text-white/70 transition-opacity duration-500"
        >
          Scroll
        </div>
      </div>

      {/* 2-qatlam: fon ustidan scroll bilan o'tadigan ma'lumotlar.
          -mt-[100vh] shu qatlamni fon ustiga ko'taradi. */}
      <div className="pointer-events-none relative z-20 -mt-[100vh]">
        {SECTIONS.map((s, i) => {
          const Title = i === 0 ? 'h1' : 'h2'
          return (
            <Panel key={s.title} align={s.align} active={ready}>
              <Title
                className={
                  i === 0 ? 'text-4xl font-bold md:text-6xl' : 'text-3xl font-semibold md:text-5xl'
                }
              >
                {s.title}
              </Title>
              {s.text && <p className="text-lg text-white/80">{s.text}</p>}
              {s.tech && <TechText />}
              {s.cta && (
                <a
                  href={s.cta.href}
                  className="pointer-events-auto mt-2 rounded-full bg-white px-6 py-3 font-medium text-black"
                >
                  {s.cta.label}
                </a>
              )}
            </Panel>
          )
        })}
      </div>
    </section>
  )
}

export default Hero
