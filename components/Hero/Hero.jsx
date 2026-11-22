'use client'

import { createFrameSequence } from '@/components/Hero/frameSequence '
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import GlassSurface from '../ui/GlassSurface'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

/* =========================================
   CONFIG
========================================= */

const TOTAL_FRAMES = 120 // f_001.webp … f_120.webp in /public/media/frames
const framePath = (i, compact = false) =>
  `/media/${compact ? 'frames-sm' : 'frames'}/f_${String(i + 1).padStart(3, '0')}.webp`

// Kadr silliqlash tezligi: yuqori = kadrlar scrollga tezroq yetib boradi (6–10 oralig'ida sinang)
const SMOOTH = 7
const DIM = 0.2 // dark filter over the frames: 0 = none, 0.4 = strong

// Last part of the scroll: the hero melts into the white section below it.
const NEXT_BG = '255,255,255' // r,g,b of the section under the hero
const FRAMES_END = 0.88 // frames + text end here, the rest of the scroll is the white fade
const FADE = `linear-gradient(to bottom, ${[0, 0.04, 0.16, 0.36, 0.6, 0.82, 0.95, 1]
  .map((alpha, i) => `rgba(${NEXT_BG},${alpha}) ${Math.round((i / 7) * 100)}%`)
  .join(', ')})`

const SHADE = {
  background: `linear-gradient(to bottom, rgba(0,0,0,.4), transparent 22%, transparent 45%, rgba(0,0,0,.7)),
    radial-gradient(ellipse at center, rgba(0,0,0,${DIM}) 0%, rgba(0,0,0,${DIM + 0.15}) 60%, rgba(0,0,0,.6) 100%)`,
}

const SECTIONS = [
  {
    eyebrow: 'REXEN — DIGITAL ENGINEERING COMPANY',
    title: 'WE BUILD THE',
    accent: 'DIGITAL FUTURE.',
    description:
      'We design and engineer websites, CRM systems, SaaS platforms and intelligent digital products that move businesses forward.',
    cta: { label: 'Explore Our Work', href: '#about' },
  },
  {
    eyebrow: 'WHAT WE DO',
    title: 'ONE VISION.',
    accent: 'EVERY DIGITAL LAYER.',
    description:
      'From the first idea to a fully engineered digital ecosystem, we bring every part of your business together.',
    services: [
      'Web Development',
      'Software Engineering',
      'CRM & ERP Systems',
      'SaaS Platforms',
      'AI & Automation',
      'UI/UX Design',
      'Mobile Applications',
      'Digital Transformation',
    ],
  },
  {
    eyebrow: 'THE REXEN STANDARD',
    title: 'ENGINEERED',
    accent: 'BEYOND LIMITS.',
    description:
      'We combine thoughtful design, modern technology and precise engineering to create digital experiences built to last.',
    cta: { label: 'Let’s Work Together', href: '#contact' },
  },
]

/* =========================================
   MOTION VARIANTS
========================================= */

const EASE = [0.16, 1, 0.3, 1]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
  exit: { transition: { staggerChildren: 0.01, staggerDirection: -1 } },
}

const rows = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.01 } },
}

// text slides up from behind a mask
const rise = {
  hidden: { y: '105%' },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
  exit: { y: '-105%', transition: { duration: 0.28, ease: [0.7, 0, 0.84, 0] } },
}

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// hairlines draw from left to right
const grow = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
  exit: { scaleX: 0, transition: { duration: 0.2 } },
}

/* =========================================
   PIECES
========================================= */

const Line = ({ children, className = '' }) => (
  <span className="block overflow-hidden py-[0.03em]">
    <motion.span variants={rise} className={`block ${className}`}>
      {children}
    </motion.span>
  </span>
)

function GlassButton({ href, label }) {
  return (
    <motion.a
      href={href}
      variants={fade}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group mt-8 block w-fit rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      <GlassSurface
        width={label.length * 9 + 84}
        height={52}
        borderRadius={999}
        blur={10}
        brightness={60}
        backgroundOpacity={0.08}
      >
        <span className="flex items-center gap-3 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          {label}
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            ↗
          </span>
        </span>
      </GlassSurface>
    </motion.a>
  )
}

function Panel({ section, index }) {
  const { eyebrow, title, accent, description, services, cta } = section

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between xl:gap-16"
    >
      {/* LEFT: label + headline */}
      <div>
        <motion.p
          variants={fade}
          className="mb-6 flex gap-4 text-[11px] font-medium tracking-[0.22em] text-white/50"
        >
          <span className="text-white">{`0${index + 1}`}</span>
          {eyebrow}
        </motion.p>

        <h2 className="font-['Bebas'] text-[clamp(3rem,8.5vw,9.5rem)] leading-[0.84]">
          <Line>{title}</Line>
          <Line className="text-white/40">{accent}</Line>
        </h2>
      </div>

      {/* RIGHT: description + list or button */}
      <div className="w-full max-w-[360px] shrink-0 xl:pb-2">
        <motion.p
          variants={fade}
          className="text-[13px] leading-[1.8] text-white/60 md:text-[14px]"
        >
          {description}
        </motion.p>

        {services && (
          <motion.ul variants={rows} className="mt-8 grid grid-cols-2 gap-x-6">
            {services.map((service) => (
              <li key={service}>
                <motion.span variants={grow} className="block h-px origin-left bg-white/20" />
                <span className="block overflow-hidden">
                  <motion.span
                    variants={rise}
                    className="block py-3 text-[11px] uppercase tracking-[0.14em] text-white/80"
                  >
                    {service}
                  </motion.span>
                </span>
              </li>
            ))}
          </motion.ul>
        )}

        {cta && <GlassButton href={cta.href} label={cta.label} />}
      </div>
    </motion.div>
  )
}

/* =========================================
   HERO
========================================= */

export default function Hero() {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const contentRef = useRef(null)
  const curtainRef = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const content = contentRef.current
    const curtain = curtainRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const connection = navigator.connection
    const compactFrames =
      window.matchMedia('(max-width: 1024px)').matches ||
      connection?.saveData ||
      ['slow-2g', '2g', '3g'].includes(connection?.effectiveType)

    const gc = gsap.context(() => {}, root) // avval e'lon qilinadi

    const frame = { value: 0 } // ekrandagi (silliqlangan) kadr
    const target = { value: 0 } // scroll ko'rsatayotgan kadr
    let drawn = -1

    const seq = createFrameSequence(canvas, {
      total: TOTAL_FRAMES,
      path: (i) => framePath(i, compactFrames),
      concurrency: compactFrames ? 4 : 6,
      lookahead: compactFrames ? 6 : 10,
      onReady: () =>
        gc.add(() => gsap.to(canvas, { opacity: 1, duration: 0.8, ease: 'power2.out' })),
    })

    // Vaqtga asoslangan silliqlash: scroll tez bo'lsa ham, sekin bo'lsa ham bir xil his beradi
    const tick = (_time, deltaTime) => {
      const dt = Math.min(deltaTime, 50) / 1000
      const k = reduce ? 1 : 1 - Math.exp(-SMOOTH * dt)

      frame.value += (target.value - frame.value) * k
      if (Math.abs(target.value - frame.value) < 0.005) frame.value = target.value

      // kasr kadr uzatiladi: ikki qo'shni kadr bir-biriga aralashib o'tadi
      if (frame.value !== drawn) {
        drawn = frame.value
        seq.draw(frame.value)
      }
    }
    gsap.ticker.add(tick)

    gc.add(() => {
      gsap.from(stageRef.current, { scale: 1.08, duration: 2.4, ease: 'expo.out' })

      // white curtain starts hidden below the stage (opacity 0 in JSX avoids a flash before JS)
      gsap.set(curtain, { yPercent: 100, opacity: 1 })

      const clamp01 = gsap.utils.clamp(0, 1)
      const setCurtain = gsap.quickSetter(curtain, 'yPercent')
      const setContent = gsap.quickSetter(content, 'opacity')

      const update = ({ progress }) => {
        const p = Math.min(progress / FRAMES_END, 1) // frames + text
        const out = clamp01((progress - FRAMES_END) / (1 - FRAMES_END)) // white fade
        const f = p * (TOTAL_FRAMES - 1)

        target.value = f
        seq.prefetch(f)
        setActive(Math.min(Math.floor(p * SECTIONS.length), SECTIONS.length - 1))

        setCurtain(100 * (1 - out * out * (3 - 2 * out)))
        setContent(1 - clamp01(out * 2))
        content.style.pointerEvents = out > 0.5 ? 'none' : ''
      }

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: update,
        onRefresh: update,
      })
    })

    return () => {
      gsap.ticker.remove(tick)
      gc.revert()
      seq.destroy()
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="home"
        ref={rootRef}
        className="relative h-[450svh] bg-[#070707] font-['Manrope'] text-white"
      >
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          {/* FRAMES: poster shows instantly, canvas fades in over it */}
          <div ref={stageRef} className="absolute inset-0">
            {}
            <picture>
              <source media="(max-width: 1024px)" srcSet={framePath(0, true)} />
              <img
                src={framePath(0)}
                alt=""
                aria-hidden="true"
                draggable={false}
                fetchPriority="high"
                decoding="sync"
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </picture>
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full opacity-0 will-change-opacity"
            />
          </div>

          {/* DARK FILTER */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={SHADE} />

          <h1 className="sr-only">REXEN — Digital Engineering Company</h1>

          {/* CONTENT: anchored bottom-left so the frames stay clear */}
          <div
            ref={contentRef}
            className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 md:px-12 md:pb-14"
          >
            <AnimatePresence mode="wait">
              <Panel key={active} index={active} section={SECTIONS[active]} />
            </AnimatePresence>
          </div>

          {/* WHITE FADE: rises from the bottom at the end of the scroll */}
          <div
            ref={curtainRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-[56svh]"
            style={{ background: FADE, opacity: 0 }}
          />
        </div>
      </section>
    </MotionConfig>
  )
}
