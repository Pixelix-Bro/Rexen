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

const frameSrc = (dir, i) => `${dir}/f_${String(i + 1).padStart(3, '0')}.webp`
const isReady = (img) => !!img && img.complete && img.naturalWidth > 0

/* Ko'rinishga kirganda paydo bo'ladi, chiqib ketganda yashirinadi */
const Reveal = ({ children, className = '' }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.4,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
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
const Panel = ({ align = 'center', children }) => (
  <div className="flex h-screen items-center px-6 md:px-16">
    <Reveal className={`flex w-full max-w-2xl flex-col gap-4 ${ALIGN[align]}`}>{children}</Reveal>
  </div>
)

const Hero = () => {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const hintRef = useRef(null)
  const barRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    const dir = window.innerWidth < MOBILE_BREAKPOINT ? FRAMES_DIR_SM : FRAMES_DIR

    let cancelled = false
    let frames = []
    let count = 0
    let current = 0 // hozir ko'rsatilishi kerak bo'lgan kadr
    let shown = -1 // canvas'da hozir chizilgan kadr
    let lastWidth = 0
    let trigger

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

    // Progress chizig'i va "Scroll" ko'rsatkichi: React'ni qayta chizdirmasdan, to'g'ridan-to'g'ri DOM
    const updateUi = (progress) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`
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
        return
      }
      if (cancelled || !meta?.count) return

      count = meta.count
      frames = new Array(count)

      // Avval siyrak kadrlar (har 16-, 8-, 4-, 2-chi), keyin qolganlari:
      // yuklanish tugamasdan scroll qilinsa ham taxminiy kadr ko'rinadi
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

      for (const i of order) {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          if (cancelled) return
          draw(current)
          setReady(true)
        }
        img.src = frameSrc(dir, i)
        frames[i] = img
      }

      // Scroll holatini kadr raqamiga aylantiradi (silliqlashni Lenis qiladi)
      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          current = Math.round(self.progress * (count - 1))
          draw(current)
          updateUi(self.progress)
        },
      })
      current = Math.round(trigger.progress * (count - 1))
      draw(current)
      updateUi(trigger.progress)
    }

    resize()
    init()
    window.addEventListener('resize', resize)

    return () => {
      cancelled = true
      trigger?.kill()
      window.removeEventListener('resize', resize)
      frames.forEach((img) => {
        if (img) img.onload = null
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-black text-white">
      {/* 1-qatlam: scroll paytida qotib turadigan fon */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className={`absolute inset-0 ${OVERLAY}`} />

        {SHOW_DOT_GRID && (
          <div className="absolute inset-0 z-10">
            <DotGrid />
          </div>
        )}

        {/* "Scroll" ko'rsatkichi: scroll boshlanishi bilan yo'qoladi */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-widest text-white/70 transition-opacity duration-500"
        >
          <span>Scroll</span>
          <span className="h-10 w-px animate-pulse bg-white/60" />
        </div>

        {/* Progress chizig'i */}
        <div className="absolute bottom-0 left-0 z-20 h-0.5 w-full bg-white/10">
          <div
            ref={barRef}
            className="h-full origin-left bg-white/80"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      {/* 2-qatlam: fon ustidan scroll bilan o'tadigan ma'lumotlar.
          -mt-[100vh] shu qatlamni fon ustiga ko'taradi. */}
      <div className="pointer-events-none relative z-20 -mt-[100vh]">
        {SECTIONS.map((s, i) => {
          const Title = i === 0 ? 'h1' : 'h2'
          return (
            <Panel key={s.title} align={s.align}>
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
