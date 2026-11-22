'use client'

import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1]

// Sahna almashganda keyingisiga o'tishdan oldin kamida shuncha ms kutiladi.
// Tez scroll qilinsa ham sahnalar ketma-ket ko'rinadi, hech biri o'tkazib yuborilmaydi.
const STEP_MS = 1100

/* =========================================
   DATA
========================================= */

const STATS = [
  {
    to: 5,
    suffix: '+',
    label: 'Years of experience',
    note: 'Building websites, software and SaaS products for growing businesses.',
  },
  {
    to: 100,
    suffix: '%',
    label: 'Custom-built',
    note: 'No templates and no page builders. Every product is engineered for its owner.',
  },
  {
    to: 1,
    suffix: '',
    label: 'Team, start to finish',
    note: 'Design, engineering and support under one roof.',
  },
  {
    to: 8,
    suffix: '',
    label: 'Disciplines in-house',
    note: 'Web, software, CRM and ERP, SaaS, AI, UI/UX, mobile and transformation.',
  },
]

const REASONS = [
  {
    topic: 'Team',
    usual: 'Design, code and hosting split between three different vendors.',
    rexen: 'One engineering team carries your product from first sketch to production.',
  },
  {
    topic: 'Code',
    usual: 'Templates and plugins stacked on top of each other until something breaks.',
    rexen: 'Custom architecture, written for your business and built to scale with it.',
  },
  {
    topic: 'Speed',
    usual: 'Looks good on launch day, then slows down with every new feature.',
    rexen: 'Performance budgets are set before the first line of code and enforced after.',
  },
  {
    topic: 'Communication',
    usual: 'Updates arrive when you chase them.',
    rexen: 'A direct line to the engineers and designers building your product.',
  },
  {
    topic: 'Ownership',
    usual: 'You rent the system and the source code stays with the agency.',
    rexen: 'You own the code, the data and the documentation. Always.',
  },
  {
    topic: 'After launch',
    usual: 'A handover email, then silence.',
    rexen: 'Monitoring, support and a roadmap that keeps moving after release.',
  },
]

const STEPS = [
  {
    title: 'Discovery',
    text: 'We map your goals, users and constraints before anything is designed.',
  },
  {
    title: 'Design',
    text: 'Flows, interface and system design, prototyped and agreed before engineering starts.',
  },
  {
    title: 'Engineering',
    text: 'Clean, tested code built in short cycles that you can see and review.',
  },
  {
    title: 'Launch',
    text: 'Performance, security and SEO verified, then shipped without guesswork.',
  },
  {
    title: 'Growth',
    text: 'Monitoring, support and new features as your business evolves.',
  },
]

const STACK = [
  'Next.js',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'Figma',
  'Tailwind CSS',
  'AI / LLMs',
]

const LABELS = ['Overview', 'Comparison', 'Process', 'Stack']

/* =========================================
   MOTION VARIANTS (sahna ichidagi elementlar)
========================================= */

const group = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
}

const listGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
  exit: {},
}

const rise = {
  hidden: { y: '105%' },
  show: { y: 0, transition: { duration: 1, ease: EASE } },
  exit: { y: '-105%', transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } },
}

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const wipe = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  show: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 1, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const growX = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.6, ease: EASE, delay: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const growY = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 1.6, ease: EASE, delay: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

/* =========================================
   SAHNALAR ORASIDAGI O'TISH (har biri turli tomondan)
   in  = oldinga scrollda sahna kirib kelayotgan holat
   out = oldinga scrollda sahna chiqib ketayotgan holat
   Orqaga scrollda ular teskari ishlaydi.
========================================= */

const blur = (n) => `blur(${n}px)`

const FX = [
  // 1) Intro: kameraga qarab uchib o'tadi (yaqinlashib, xiralashib yo'qoladi)
  {
    in: { opacity: 0, scale: 0.94, filter: blur(14) },
    out: { opacity: 0, scale: 1.2, filter: blur(22) },
  },
  // 2) Taqqoslash: o'ngdan kirib, chapga ketadi
  {
    in: { opacity: 0, x: '14vw', scale: 0.98, filter: blur(14) },
    out: { opacity: 0, x: '-14vw', scale: 0.98, filter: blur(14) },
  },
  // 3) Jarayon: pastdan ko'tarilib, tepaga ketadi
  {
    in: { opacity: 0, y: '16vh', scale: 0.95, filter: blur(14) },
    out: { opacity: 0, y: '-14vh', scale: 0.95, filter: blur(14) },
  },
  // 4) Texnologiyalar: yaqindan (kattadan) kelib joyiga tushadi
  {
    in: { opacity: 0, scale: 1.18, filter: blur(18) },
    out: { opacity: 0, scale: 0.86, filter: blur(18) },
  },
]

function SceneFx({ index, children }) {
  const fx = FX[index]

  const variants = {
    enter: (dir) => (dir >= 0 ? fx.in : fx.out),
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: blur(0),
      transition: { duration: 0.85, ease: EASE },
    },
    leave: (dir) => ({
      ...(dir >= 0 ? fx.out : fx.in),
      transition: { duration: 0.5, ease: [0.7, 0, 0.84, 0] },
    }),
  }

  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="leave"
      className="w-full will-change-[transform,filter,opacity]"
    >
      {children}
    </motion.div>
  )
}

/* =========================================
   SHARED PIECES
========================================= */

const Line = ({ children, className = '' }) => (
  <span className="block overflow-hidden py-[0.03em]">
    <motion.span variants={rise} className={`block ${className}`}>
      {children}
    </motion.span>
  </span>
)

// Sahnaning ichki animatsiyasi. Pinned rejimda kirish/chiqish, oddiy rejimda ko'rinishga kirganda.
function Scene({ pinned, children }) {
  const props = pinned
    ? { initial: 'hidden', animate: 'show', exit: 'exit' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.25 } }

  return (
    <motion.div variants={group} className="w-full" {...props}>
      {children}
    </motion.div>
  )
}

function SubHead({ title, accent, text, compact = false }) {
  const size = compact
    ? 'text-[clamp(2.2rem,min(4.6vw,6.8vh),4.8rem)]'
    : 'text-[clamp(2.6rem,min(5.5vw,8.5vh),5.8rem)]'
  const gap = compact ? 'mb-[clamp(1rem,3vh,2rem)]' : 'mb-[clamp(1.75rem,5vh,3.5rem)]'

  return (
    <div
      className={`${gap} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16`}
    >
      <h3 className={`font-['Bebas'] ${size} leading-[0.88]`}>
        <Line>{title}</Line>
        <Line className="text-white/30">{accent}</Line>
      </h3>
      <motion.p
        variants={fade}
        className="max-w-[380px] shrink-0 text-[14px] leading-[1.7] text-white/60 md:text-[15px]"
      >
        {text}
      </motion.p>
    </div>
  )
}

function Count({ to, suffix }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [value, setValue] = useState(reduce ? to : 0)

  useEffect(() => {
    if (reduce) return
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduce, to])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}

/* =========================================
   SCENE 1: INTRO + STATS
========================================= */

function IntroScene() {
  return (
    <>
      <div className="mb-[clamp(2rem,7vh,5rem)] flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between xl:gap-16">
        <h2 className="font-['Bebas'] text-[clamp(2.8rem,min(7vw,10vh),8rem)] leading-[0.84]">
          <Line>WHY BUSINESSES</Line>
          <Line className="text-white/30">BUILD WITH REXEN.</Line>
        </h2>

        <motion.p
          variants={fade}
          className="max-w-[400px] shrink-0 text-[14px] leading-[1.75] text-white/60 md:text-[15px] xl:pb-2"
        >
          Five years of building digital products has taught us one thing: the engineering behind a
          product decides how long it lasts. That is where we put our focus.
        </motion.p>
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-x-10">
        {STATS.map((stat) => (
          <motion.li
            key={stat.label}
            variants={fade}
            className="border-t border-white/15 pt-[clamp(1rem,2.5vh,1.5rem)]"
          >
            <div className="font-['Bebas'] text-[clamp(3.5rem,min(8vw,12vh),8rem)] leading-[0.85] text-white">
              <Count to={stat.to} suffix={stat.suffix} />
            </div>
            <p className="mt-4 text-[15px] font-semibold text-white">{stat.label}</p>
            <p className="mt-2 max-w-[260px] text-[13px] leading-[1.65] text-white/50">
              {stat.note}
            </p>
          </motion.li>
        ))}
      </ul>
    </>
  )
}

/* =========================================
   SCENE 2: COMPARISON (ixcham, ekranga sig'adi)
========================================= */

const CELL_Y = 'lg:py-[clamp(0.4rem,1.25vh,1rem)]'
const COLS = 'lg:grid-cols-[1fr_1.1fr_1.45fr]'

function Row({ item }) {
  return (
    <motion.li
      variants={fade}
      className={`grid grid-cols-1 border-t border-white/10 py-6 ${COLS} lg:border-t-0 lg:py-0`}
    >
      <h4
        className={`font-['Bebas'] text-[clamp(1.7rem,3.2vh+0.4rem,2.6rem)] leading-none text-white lg:flex lg:items-center lg:border-t lg:border-white/10 lg:pr-10 ${CELL_Y}`}
      >
        {item.topic}
      </h4>

      <p
        className={`mt-3 text-[14px] leading-[1.55] text-white/50 lg:mt-0 lg:flex lg:items-center lg:border-t lg:border-white/10 lg:pr-12 lg:text-[clamp(13px,1.8vh,15px)] ${CELL_Y}`}
      >
        <span>
          <span className="mb-2 block text-xs font-semibold text-white/35 lg:sr-only">
            The usual agency
          </span>
          {item.usual}
        </span>
      </p>

      <motion.div
        variants={wipe}
        className={`mt-4 rounded-2xl bg-white px-6 py-5 text-black lg:mt-0 lg:flex lg:items-center lg:rounded-none lg:border-t lg:border-black/10 lg:px-12 ${CELL_Y}`}
      >
        <div>
          <span className="mb-2 block text-xs font-semibold text-black/45 lg:sr-only">Rexen</span>
          <p className="text-[16px] font-medium leading-[1.45] lg:text-[clamp(13px,1.9vh,17px)]">
            {item.rexen}
          </p>
        </div>
      </motion.div>
    </motion.li>
  )
}

function CompareScene() {
  return (
    <>
      <SubHead
        compact
        title="THE USUAL WAY,"
        accent="AND THE REXEN WAY."
        text="We are engineers first, and that changes how a product is planned, built and kept alive."
      />

      <div>
        <div aria-hidden="true" className={`hidden ${COLS} lg:grid`}>
          <span />
          <motion.span
            variants={fade}
            className="flex items-end pb-3 pr-12 text-sm font-semibold text-white/35"
          >
            The usual agency
          </motion.span>
          <motion.div
            variants={wipe}
            className="rounded-t-[24px] bg-white px-12 py-[clamp(0.6rem,1.6vh,1rem)] font-['Bebas'] text-[clamp(1.6rem,3vh+0.4rem,2.2rem)] leading-none text-black"
          >
            Rexen
          </motion.div>
        </div>

        <ul>
          {REASONS.map((item) => (
            <Row key={item.topic} item={item} />
          ))}
        </ul>

        <div className={`mt-6 grid grid-cols-1 ${COLS} lg:mt-0`}>
          <motion.p
            variants={fade}
            className="hidden max-w-[360px] self-center text-[14px] leading-[1.7] text-white/50 lg:col-span-2 lg:block"
          >
            Tell us what you are building and we will show you how we would engineer it.
          </motion.p>

          <motion.div
            variants={wipe}
            className="flex flex-col items-start gap-5 rounded-2xl bg-white px-6 py-6 text-black lg:col-start-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:rounded-b-[24px] lg:rounded-t-none lg:border-t lg:border-black/10 lg:px-12 lg:py-[clamp(0.7rem,2vh,1.2rem)]"
          >
            <span className="font-['Bebas'] text-[2.2rem] leading-none lg:whitespace-nowrap lg:text-[clamp(1.5rem,2.8vh+0.3rem,2rem)]">
              Have a product in mind?
            </span>
            <a
              href="#contact"
              className="group flex shrink-0 items-center gap-3 rounded-full bg-[#070707] px-7 py-3 text-[14px] font-semibold text-white transition-colors duration-500 hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              <span>Let’s work together</span>
              <span className="text-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">
                ↗
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </>
  )
}

/* =========================================
   SCENE 3: PROCESS
========================================= */

function ProcessScene() {
  return (
    <>
      <SubHead
        title="FROM FIRST CALL"
        accent="TO LIVE PRODUCT."
        text="A clear process with one team in charge, so you always know what happens next."
      />

      <div className="relative">
        {/* mobil: vertikal chiziq */}
        <motion.div
          variants={fade}
          aria-hidden="true"
          className="absolute bottom-0 left-[5px] top-3 w-px bg-white/15 lg:hidden"
        />
        <motion.div
          variants={growY}
          aria-hidden="true"
          className="absolute bottom-0 left-[5px] top-3 w-px origin-top bg-white lg:hidden"
        />
        {/* desktop: gorizontal chiziq */}
        <motion.div
          variants={fade}
          aria-hidden="true"
          className="absolute left-0 right-0 top-[5px] hidden h-px bg-white/15 lg:block"
        />
        <motion.div
          variants={growX}
          aria-hidden="true"
          className="absolute left-0 right-0 top-[5px] hidden h-px origin-left bg-white lg:block"
        />

        <ol className="grid gap-10 lg:grid-cols-5 lg:gap-8">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              variants={fade}
              className="relative pl-8 lg:pl-0 lg:pt-[clamp(2rem,6vh,3rem)]"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-3 h-[11px] w-[11px] rounded-full bg-white lg:top-0"
              />
              <span className="text-[13px] font-semibold text-white/35">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h4 className="mt-2 font-['Bebas'] text-[clamp(2.2rem,4.2vh+0.6rem,3rem)] leading-none text-white">
                {step.title}
              </h4>
              <p className="mt-3 max-w-[280px] text-[14px] leading-[1.7] text-white/55">
                {step.text}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </>
  )
}

/* =========================================
   SCENE 4: STACK
========================================= */

function StackScene() {
  return (
    <>
      <SubHead
        title="THE STACK WE"
        accent="ENGINEER WITH."
        text="Modern, proven technology chosen for your product, never for fashion."
      />

      <motion.ul
        variants={listGroup}
        className="grid grid-cols-2 border-l border-t border-white/10 sm:grid-cols-3 lg:grid-cols-6"
      >
        {STACK.map((name) => (
          <motion.li
            key={name}
            variants={fade}
            className="border-b border-r border-white/10 px-6 py-[clamp(1.5rem,5vh,3rem)] font-['Bebas'] text-[1.9rem] leading-none text-white/55 transition-colors duration-500 hover:text-white"
          >
            {name}
          </motion.li>
        ))}
      </motion.ul>
    </>
  )
}

const SCENES = [IntroScene, CompareScene, ProcessScene, StackScene]

/* =========================================
   DESKTOP: BITTA 100svh SECTION, SCROLL BILAN ALMASHADI
========================================= */

function Pinned() {
  const ref = useRef(null)
  const lastChange = useRef(0)
  const [target, setTarget] = useState(0) // scroll ko'rsatayotgan sahna
  const [shown, setShown] = useState(0) // ekrandagi sahna
  const [dir, setDir] = useState(1) // 1 = oldinga, -1 = orqaga

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(Math.floor(v * SCENES.length), SCENES.length - 1)
    setTarget(Math.max(i, 0))
  })

  // Sahnalar bittadan almashadi: tez scrollda ham hech biri o'tkazib yuborilmaydi
  useEffect(() => {
    if (shown === target) return
    const wait = Math.max(0, STEP_MS - (performance.now() - lastChange.current))
    const t = setTimeout(() => {
      lastChange.current = performance.now()
      const step = Math.sign(target - shown)
      setDir(step)
      setShown(shown + step)
    }, wait)
    return () => clearTimeout(t)
  }, [shown, target])

  // Nuqtani bosganda shu sahnaning o'rtasiga scroll qiladi
  const goTo = (i) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + ((i + 0.5) / SCENES.length) * range, behavior: 'smooth' })
  }

  const Current = SCENES[shown]

  return (
    <section
      id="why"
      ref={ref}
      data-nav-theme="dark"
      style={{ height: `${SCENES.length * 100}svh` }}
      className="relative bg-[#070707] font-['Manrope'] text-white"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* my-auto: kontent balandroq bo'lsa ham tepasi navbar ostida qolmaydi */}
        <div className="mx-auto my-auto w-full max-w-[1560px] px-12 pb-[clamp(1.5rem,4vh,3rem)] pt-[clamp(5.5rem,13vh,8.5rem)]">
          <AnimatePresence mode="wait" custom={dir}>
            <SceneFx key={shown} index={shown}>
              <Scene pinned>
                <Current />
              </Scene>
            </SceneFx>
          </AnimatePresence>
        </div>

        {/* o'ng tomonda progress: bosiladigan nuqtalar */}
        <div className="absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col items-end gap-1 xl:right-8">
          {SCENES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={LABELS[i]}
              aria-current={i === shown}
              className="group flex items-center gap-3 py-1.5 focus-visible:outline-none"
            >
              <span
                className={`hidden text-[10px] font-semibold uppercase tracking-[0.18em] transition-opacity duration-300 xl:block ${
                  i === shown ? 'text-white/70' : 'text-white/0 group-hover:text-white/50'
                }`}
              >
                {LABELS[i]}
              </span>
              <span
                className={`block w-px transition-all duration-500 ${
                  i === shown ? 'h-8 bg-white' : 'h-3 bg-white/25 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* =========================================
   MOBIL / PLANSHET: ODDIY, ketma-ket bloklar
========================================= */

function Stacked() {
  return (
    <section
      id="about"
      data-nav-theme="dark"
      className="relative bg-[#070707] font-['Manrope'] text-white"
    >
      <div className="mx-auto max-w-[1560px] space-y-28 px-6 py-24 md:px-12 md:py-32">
        {SCENES.map((Current, i) => (
          <Scene key={i} pinned={false}>
            <Current />
          </Scene>
        ))}
      </div>
    </section>
  )
}

/* =========================================
   WHY US
========================================= */

export default function WhyUs() {
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 680px)')
    const update = () => setDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return <MotionConfig reducedMotion="user">{desktop ? <Pinned /> : <Stacked />}</MotionConfig>
}
