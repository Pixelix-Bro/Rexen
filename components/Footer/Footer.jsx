'use client'

import {
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useRef, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1]

const CONTACT = {
  email: 'hello@rexen.uz',
  phone: '+998 90 000 00 00',
  telegram: '@rexen',
  telegramUrl: 'https://t.me/rexen',
  location: 'Tashkent, Uzbekistan',
}

const MENU = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Why us', href: '#why' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

const REACH = [
  { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: CONTACT.telegram, href: CONTACT.telegramUrl, external: true },
  { label: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const linkClass =
  'group inline-flex w-fit items-center gap-1.5 text-[15px] text-black/60 transition-colors duration-300 hover:text-black focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'

/* =========================================
   Tezkor email formasi
   /api/contact ga yuboriladi (route.js o'zgarmaydi)
========================================= */

function QuickForm() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // spam tuzoq
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email')
      setStatus('error')
      return
    }

    setError('')
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Footer request',
          email: email.trim(),
          phone: '',
          message: 'Left an email in the footer and asked us to get in touch.',
          services: [],
          website,
        }),
      })
      if (res.status === 429) {
        setError('Too many attempts. Try again in a few minutes.')
        setStatus('error')
        return
      }
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p role="status" className="flex items-center gap-3 text-[15px] font-semibold">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        Thank you. We will write to you soon.
      </p>
    )
  }

  const invalid = status === 'error' && error === 'Enter a valid email'

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="footer-email" className="sr-only">
        Your email
      </label>

      <div
        className={`flex items-center gap-3 border-b transition-colors duration-300 focus-within:border-black ${
          invalid ? 'border-[#d94848]' : 'border-black/20'
        }`}
      >
        <input
          id="footer-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          aria-invalid={invalid}
          aria-describedby={status === 'error' ? 'footer-email-msg' : undefined}
          placeholder="Your email"
          className="min-w-0 flex-1 bg-transparent py-3 font-['Manrope'] text-[16px] text-black outline-none placeholder:text-black/35"
        />

        {/* spam tuzoq: odam ko'rmaydi */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <button
          type="submit"
          disabled={status === 'sending'}
          aria-label={status === 'sending' ? 'Sending' : 'Send email'}
          className="group mb-1 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[#070707] text-white transition-colors duration-500 hover:bg-black/75 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          <span
            aria-hidden="true"
            className="text-base transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </button>
      </div>

      {/* bir qator joy ajratilgan: xato chiqqanda footer sakramaydi */}
      <p
        id="footer-email-msg"
        role={status === 'error' ? 'alert' : undefined}
        className="mt-2 min-h-[1.25rem] text-[12px] leading-[1.6] text-[#d94848]"
      >
        {status === 'error' ? error : ''}
      </p>
    </form>
  )
}

/* =========================================
   FOOTER (~50vh)
========================================= */

export default function Footer() {
  const year = new Date().getFullYear()

  /* --- fon REXEN: kursor atrofida yumshoq kulrang yorug'lik --- */
  const markRef = useRef(null)
  const reduce = useReducedMotion()
  const spring = { stiffness: 140, damping: 24, mass: 0.6 }
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, spring)
  const y = useSpring(rawY, spring)
  const power = useSpring(0, { stiffness: 110, damping: 22 })
  const alpha = useTransform(power, (p) => 0.05 + p * 0.2)
  const spotlight = useMotionTemplate`radial-gradient(circle 300px at ${x}px ${y}px, rgba(0,0,0,${alpha}) 0%, rgba(0,0,0,0.05) 100%)`

  const onMove = (e) => {
    if (reduce || !markRef.current) return
    const r = markRef.current.getBoundingClientRect()
    const nx = e.clientX - r.left
    const ny = e.clientY - r.top
    // birinchi kirishda dog' burchakdan uchib kelmasin
    if (power.get() < 0.05) {
      if (typeof x.jump === 'function') {
        x.jump(nx)
        y.jump(ny)
      } else {
        x.set(nx)
        y.set(ny)
      }
    }
    rawX.set(nx)
    rawY.set(ny)
    power.set(1)
  }
  const onLeave = () => power.set(0)

  return (
    <MotionConfig reducedMotion="user">
      <footer
        data-nav-theme="light"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative flex min-h-[50svh] flex-col overflow-hidden border-t border-black/10 bg-white font-['Manrope'] text-[#070707]"
      >
        {/* FON: katta REXEN. Kursor turgan joy kulrang bo'lib yoritiladi */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex translate-y-[10%] select-none justify-center"
        >
          <motion.p
            ref={markRef}
            style={{ backgroundImage: spotlight }}
            className="bg-clip-text font-['Bebas'] text-[clamp(8rem,30vw,32rem)] leading-[0.95] tracking-[0.02em] text-transparent"
          >
            REXEN
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative z-10 mx-auto flex w-full max-w-[1560px] flex-1 flex-col px-6 md:px-12"
        >
          {/* TOP */}
          <div className="grid flex-1 gap-12 py-12 md:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:gap-x-20 xl:gap-x-28">
            {/* chap: brend + forma */}
            <div className="flex flex-col justify-between gap-8">
              <div>
                <a
                  href="#home"
                  aria-label="Rexen, back to top"
                  className="inline-block font-['Bebas'] text-[2.4rem] leading-none tracking-[0.02em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  REXEN
                </a>
                <p className="mt-4 max-w-[360px] text-[15px] leading-[1.75] text-black/60">
                  Have a project in mind? Leave your email and we will get back to you.
                </p>
              </div>

              <div className="max-w-[420px]">
                <QuickForm />
              </div>
            </div>

            {/* o'ng: menyu + aloqa */}
            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:max-w-[560px]">
              <div>
                <h2 className="mb-5 font-['Manrope'] text-[13px] font-medium normal-case tracking-normal text-black/40">
                  Menu
                </h2>
                <ul className="flex flex-col gap-3">
                  {MENU.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className={linkClass}>
                        <span className="transition-transform duration-500 group-hover:translate-x-1">
                          {item.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-5 font-['Manrope'] text-[13px] font-medium normal-case tracking-normal text-black/40">
                  Contact
                </h2>
                <ul className="flex flex-col gap-3">
                  {REACH.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className={linkClass}
                      >
                        <span className="transition-transform duration-500 group-hover:translate-x-1">
                          {item.label}
                        </span>
                        {item.external && (
                          <span
                            aria-hidden="true"
                            className="text-black/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:text-black"
                          >
                            ↗
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                  <li className="text-[15px] leading-[1.6] text-black/60">{CONTACT.location}</li>
                </ul>
              </div>
            </nav>
          </div>

          {/* BOTTOM */}
          <div className="flex items-center justify-between gap-6 border-t border-black/10 py-5 text-[13px] text-black/45">
            <p>© {year} Rexen. All rights reserved.</p>

            <a
              href="#home"
              aria-label="Back to top"
              className="group grid h-10 w-10 place-items-center rounded-full border border-black/15 text-black transition-colors duration-500 hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              <svg
                viewBox="0 0 12 12"
                className="h-3 w-3 transition-transform duration-500 group-hover:-translate-y-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 11V1M1.5 5.5L6 1l4.5 4.5" />
              </svg>
            </a>
          </div>
        </motion.div>
      </footer>
    </MotionConfig>
  )
}
