'use client'

import { useId, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1]

/* =========================================
   DATA: 3 ta kategoriya, har birida 3 tadan savol
========================================= */

const CATEGORIES = [
  {
    label: 'General',
    items: [
      {
        q: 'What does Rexen build?',
        a: 'We design and engineer websites, CRM and ERP systems, SaaS platforms, mobile applications, AI and automation tools, and the UI/UX behind them. If it is a digital product that has to work for your business every day, we can build it.',
      },
      {
        q: 'Do you use templates or page builders?',
        a: 'No. Every product is custom-built for its owner. We write the architecture around your business instead of bending your business around a template, so the result stays fast, secure and easy to extend.',
      },
      {
        q: 'Can you improve or rebuild an existing product?',
        a: 'Yes. We start with an audit of your current website or system, then decide together whether to refactor it, extend it or rebuild it. We can also connect new products to the tools you already use.',
      },
    ],
  },
  {
    label: 'Process',
    items: [
      {
        q: 'What does the process look like?',
        a: 'Five stages: discovery, design, engineering, launch and growth. We work in short cycles with one team in charge, and you can see and review progress throughout, not only at the end.',
      },
      {
        q: 'How long does a project take?',
        a: 'It depends on scope. A focused website usually takes weeks, while a CRM, ERP or SaaS platform is planned in phases over several months. After the discovery stage we give you a clear plan with milestones, so you know what ships and when.',
      },
      {
        q: 'How do we get started?',
        a: 'Send us a short message through the contact form and tell us what you are building. We reply with questions and a first plan, then book a discovery call to map the project together.',
      },
    ],
  },
  {
    label: 'Cost & support',
    items: [
      {
        q: 'How much does it cost?',
        a: 'The price follows the scope, not a fixed package. After a short discovery call we define what needs to be built and give you a clear estimate. You always know what you are paying for before development starts.',
      },
      {
        q: 'Who owns the code and the data?',
        a: 'You do. The source code, the data and the documentation belong to you. You are never locked into renting a system that only we can maintain.',
      },
      {
        q: 'Do you support the product after launch?',
        a: 'Yes. Launch is the start, not the finish. We offer monitoring, support and a roadmap of improvements, so the product keeps growing together with your business.',
      },
    ],
  },
]

/* =========================================
   MOTION
   Har element o'zi ko'rinishga kirganda ishga tushadi
   (ota-elementga bog'liq emas, qotib qolmaydi)
========================================= */

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.8, ease: EASE, delay },
})

// faqat kategoriya almashganda ishlatiladi
const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
}

const row = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
}

const Line = ({ children, className = '', delay = 0 }) => (
  <span className="block overflow-hidden py-[0.03em]">
    <motion.span
      initial={{ y: '105%' }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      className={`block ${className}`}
    >
      {children}
    </motion.span>
  </span>
)

/* =========================================
   ITEM
========================================= */

function Item({ item, open, onToggle }) {
  const id = useId()
  const buttonId = `${id}-question`
  const panelId = `${id}-answer`

  return (
    <motion.li variants={row} className="border-t border-black/10 last:border-b">
      {/* h3 uchun global Bebas/uppercase stilini bekor qilamiz */}
      <h3 className="font-['Manrope'] text-base font-normal normal-case leading-normal tracking-normal">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left font-['Manrope'] normal-case tracking-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black md:gap-10 md:py-[clamp(1rem,2.6vh,1.75rem)]"
        >
          <span
            className={`text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] transition-[color,transform] duration-500 md:text-[clamp(1.1rem,min(1.45vw,2.7vh),1.4rem)] ${
              open
                ? 'text-black'
                : 'text-black/75 group-hover:translate-x-1.5 group-hover:text-black'
            }`}
          >
            {item.q}
          </span>

          <span
            aria-hidden="true"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${
              open
                ? 'border-black bg-black text-white'
                : 'border-black/20 text-black group-hover:border-black group-hover:bg-black group-hover:text-white'
            }`}
          >
            <svg
              viewBox="0 0 12 12"
              className={`h-3 w-3 transition-transform duration-500 ${open ? 'rotate-45' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M6 1v10M1 6h10" />
            </svg>
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.6, ease: EASE },
                opacity: { duration: 0.45, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.2 } },
            }}
            className="overflow-hidden"
          >
            <p className="max-w-[640px] pb-6 pr-14 font-['Manrope'] text-[15px] leading-[1.75] text-black/65 md:pb-[clamp(1.25rem,3vh,2rem)] md:pr-20 md:text-[16px]">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

/* =========================================
   FAQ
========================================= */

export default function FAQ() {
  const [cat, setCat] = useState(0)
  const [open, setOpen] = useState(0) // bitta savol ochiq: balandlik sakramaydi
  const tabRefs = useRef([])

  const select = (next) => {
    if (next === cat) return
    setCat(next)
    setOpen(0)
  }

  const onTabKey = (e, i) => {
    const move = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    let next = null
    if (move) next = (i + move + CATEGORIES.length) % CATEGORIES.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = CATEGORIES.length - 1
    if (next === null) return
    e.preventDefault()
    select(next)
    tabRefs.current[next]?.focus()
  }

  const toggle = (index) => setOpen((o) => (o === index ? null : index))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CATEGORIES.flatMap((c) => c.items).map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  const current = CATEGORIES[cat]

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="faq"
        data-nav-theme="light"
        className="relative flex min-h-[100svh] flex-col bg-white font-['Manrope'] text-[#070707]"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />

        {/* yuqori padding navbar uchun, pastki padding ekran balandligiga qarab */}
        <div className="mx-auto flex w-full max-w-[1560px] flex-1 flex-col px-6 pb-16 pt-28 md:px-12 md:pb-[clamp(2rem,6vh,4rem)] md:pt-[clamp(7.5rem,18vh,10.5rem)]">
          {/* TOP */}
          <div className="mb-10 flex flex-col gap-6 md:mb-[clamp(1.5rem,5vh,3.5rem)] xl:flex-row xl:items-end xl:justify-between xl:gap-16">
            <h2 className="font-['Bebas'] text-[clamp(3rem,min(7vw,11vh),8rem)] leading-[0.86]">
              <Line>GOT QUESTIONS?</Line>
              <Line delay={0.08} className="text-black/30">
                WE HAVE ANSWERS.
              </Line>
            </h2>

            <motion.p
              {...reveal(0.3)}
              className="max-w-[380px] shrink-0 text-[14px] leading-[1.75] text-black/65 xl:pb-2"
            >
              The things businesses ask us most before starting a project. If yours is not here,
              write to us and we will answer it directly.
            </motion.p>
          </div>

          {/* BODY */}
          <div className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.6fr)] lg:gap-x-20 xl:gap-x-28">
            {/* LEFT: tablar tepada, CTA pastda */}
            <div className="flex flex-col justify-between gap-10">
              <div
                role="tablist"
                aria-label="Question categories"
                className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:-mx-12 md:px-12 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {CATEGORIES.map((c, i) => {
                  const active = i === cat
                  return (
                    <motion.button
                      key={c.label}
                      {...reveal(0.2 + i * 0.07)}
                      ref={(el) => (tabRefs.current[i] = el)}
                      type="button"
                      role="tab"
                      id={`faq-tab-${i}`}
                      aria-selected={active}
                      aria-controls="faq-panel"
                      tabIndex={active ? 0 : -1}
                      onClick={() => select(i)}
                      onKeyDown={(e) => onTabKey(e, i)}
                      className={`relative isolate shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-5 py-2.5 text-left font-['Manrope'] text-[14px] font-semibold transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:rounded-none lg:border-0 lg:bg-transparent lg:py-[clamp(0.4rem,1.2vh,0.8rem)] lg:pl-7 lg:pr-0 lg:font-['Bebas'] lg:text-[clamp(2rem,min(3.4vw,6vh),3.6rem)] lg:font-normal lg:leading-none ${
                        active
                          ? 'border-black text-white lg:text-black'
                          : 'border-black/20 text-black/65 hover:border-black/50 hover:text-black lg:text-black/40 lg:hover:text-black/75'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="faq-tab-indicator"
                          transition={{ duration: 0.6, ease: EASE }}
                          aria-hidden="true"
                          className="absolute inset-0 -z-10 rounded-full bg-black lg:inset-y-[0.2em] lg:left-0 lg:right-auto lg:w-[3px] lg:rounded-none"
                        />
                      )}
                      <span className="relative">{c.label}</span>
                    </motion.button>
                  )
                })}
              </div>

              {/* CTA: ixcham karta */}
              <motion.div
                initial={{ clipPath: 'inset(0 0 100% 0)' }}
                whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.4 }}
                className="max-w-[440px] rounded-[24px] bg-[#070707] p-7 text-white md:p-[clamp(1.5rem,3.4vh,2.25rem)]"
              >
                <p className="font-['Bebas'] text-[clamp(1.9rem,min(2.4vw,4.4vh),2.7rem)] leading-[0.95]">
                  Still have a question?
                </p>
                <p className="mt-3 text-[14px] leading-[1.65] text-white/65">
                  Tell us what you are building and we will show you how we would engineer it.
                </p>
                <a
                  href="#contact"
                  className="group mt-6 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black transition-colors duration-500 hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:mt-[clamp(1.25rem,3vh,2rem)]"
                >
                  <span>Talk to our team</span>
                  <span
                    aria-hidden="true"
                    className="text-lg transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  >
                    ↗
                  </span>
                </a>
              </motion.div>
            </div>

            {/* RIGHT: savollar */}
            <motion.div
              {...reveal(0.35)}
              role="tabpanel"
              id="faq-panel"
              aria-labelledby={`faq-tab-${cat}`}
              className="lg:min-h-[28rem]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul key={cat} variants={list} initial="hidden" animate="show" exit="exit">
                  {current.items.map((item, index) => (
                    <Item
                      key={`${cat}-${index}`}
                      item={item}
                      open={open === index}
                      onToggle={() => toggle(index)}
                    />
                  ))}
                </motion.ul>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
