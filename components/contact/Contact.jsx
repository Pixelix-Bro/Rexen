'use client'

import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useState } from 'react'

const EASE = [0.16, 1, 0.3, 1]

const CONTACT = {
  email: 'hello@rexen.uz',
  phone: '+998 90 000 00 00',
  telegram: '@rexen',
  telegramUrl: 'https://t.me/rexen',
  location: 'Tashkent, Uzbekistan',
}

// route.js dagi ALLOWED_SERVICES bilan bir xil bo'lishi kerak
const SERVICES = [
  'Website',
  'CRM & ERP',
  'SaaS platform',
  'AI & Automation',
  'Mobile app',
  'UI/UX design',
  'Something else',
]

const INFO = [
  { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: 'Telegram', value: CONTACT.telegram, href: CONTACT.telegramUrl, external: true },
  { label: 'Phone', value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
  { label: 'Location', value: CONTACT.location },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EMPTY = { name: '', email: '', phone: '', message: '', website: '' }
const GENERIC_ERROR = `Something went wrong. Please try again, or write to us at ${CONTACT.email}.`

function validate(v) {
  const errors = {}
  if (v.name.trim().length < 2) errors.name = 'Enter your name'
  if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Enter a valid email'
  if (v.message.trim().length < 10) errors.message = 'A little more detail, please'
  return errors
}

/* =========================================
   MOTION
   Har element o'zi ko'rinishga kirganda ishga tushadi
========================================= */

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.8, ease: EASE, delay },
})

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
   PIECES
========================================= */

const inputBase =
  "w-full border-0 border-b bg-transparent py-[clamp(0.5rem,1.3vh,0.75rem)] font-['Manrope'] text-[16px] text-white outline-none transition-colors duration-300 placeholder:text-white/25 focus:border-white"

// Xato matni label qatorida chiqadi: balandlik o'zgarmaydi, 100vh buzilmaydi
function Field({ id, label, optional, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-[13px]">
        <label htmlFor={id} className="font-medium text-white/55">
          {label}
        </label>
        {error ? (
          <span id={`${id}-error`} role="alert" className="text-[12px] text-[#ff8f8f]">
            {error}
          </span>
        ) : optional ? (
          <span className="text-[12px] text-white/30">Optional</span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ item, delay }) {
  const { label, value, href, external } = item
  return (
    <li className="relative">
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.1, ease: EASE, delay }}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-white/15"
      />
      <motion.div
        {...reveal(delay)}
        className="flex items-center justify-between gap-6 py-[clamp(0.75rem,1.9vh,1.15rem)]"
      >
        <span className="text-[13px] text-white/40">{label}</span>
        {href ? (
          <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group flex items-center gap-3 text-[17px] font-semibold tracking-[-0.01em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-[clamp(1.05rem,min(1.5vw,2.6vh),1.4rem)]"
          >
            <span className="transition-transform duration-500 group-hover:-translate-x-1">
              {value}
            </span>
            <span
              aria-hidden="true"
              className="text-base text-white/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
            >
              ↗
            </span>
          </a>
        ) : (
          <span className="text-[17px] font-semibold tracking-[-0.01em] md:text-[clamp(1.05rem,min(1.5vw,2.6vh),1.4rem)]">
            {value}
          </span>
        )}
      </motion.div>
    </li>
  )
}

/* =========================================
   FORM
========================================= */

function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [services, setServices] = useState([])
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState(GENERIC_ERROR)

  const errors = validate(values)
  const showError = (field) => (touched[field] ? errors[field] : undefined)
  const border = (field) => (showError(field) ? 'border-[#ff8f8f]' : 'border-white/20')
  const describe = (field) => (showError(field) ? `contact-${field}-error` : undefined)

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  const toggleService = (name) =>
    setServices((list) => (list.includes(name) ? list.filter((s) => s !== name) : [...list, name]))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const found = Object.keys(errors)
    if (found.length) {
      setTouched({ name: true, email: true, message: true })
      document.getElementById(`contact-${found[0]}`)?.focus()
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, services }),
      })
      if (res.status === 429) {
        setErrorMsg('Too many attempts. Please try again in a few minutes.')
        setStatus('error')
        return
      }
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setErrorMsg(GENERIC_ERROR)
      setStatus('error')
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setServices([])
    setTouched({})
    setStatus('idle')
  }

  return (
    <motion.div
      {...reveal(0.3)}
      className="rounded-[28px] border border-white/10 bg-white/3 p-6 md:p-[clamp(1.5rem,4vh,2.5rem)]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            role="status"
            className="flex min-h-[clamp(20rem,50vh,34rem)] flex-col items-start justify-center gap-6"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-black">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h3 className="font-['Bebas'] text-[clamp(2.6rem,5vw,4rem)] leading-[0.9]">
              Message sent.
            </h3>
            <p className="max-w-95 text-[15px] leading-[1.75] text-white/60">
              Thank you. We will review your message and get back to you at the email you left.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-white/20 px-6 py-3 text-[13px] font-semibold text-white transition-colors duration-500 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="flex flex-col gap-[clamp(1rem,2.6vh,1.75rem)]"
          >
            <div className="grid gap-[clamp(1rem,2.6vh,1.75rem)] md:grid-cols-2 md:gap-x-8">
              <Field id="contact-name" label="Your name" error={showError('name')}>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  aria-invalid={Boolean(showError('name'))}
                  aria-describedby={describe('name')}
                  placeholder="John Smith"
                  className={`${inputBase} ${border('name')}`}
                />
              </Field>

              <Field id="contact-email" label="Email" error={showError('email')}>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={values.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  aria-invalid={Boolean(showError('email'))}
                  aria-describedby={describe('email')}
                  placeholder="you@company.com"
                  className={`${inputBase} ${border('email')}`}
                />
              </Field>
            </div>

            <Field id="contact-phone" label="Phone or Telegram" optional>
              <input
                id="contact-phone"
                name="phone"
                type="text"
                autoComplete="tel"
                value={values.phone}
                onChange={set('phone')}
                placeholder="+998 90 000 00 00"
                className={`${inputBase} border-white/20`}
              />
            </Field>

            <fieldset>
              <legend className="mb-3 flex w-full items-baseline justify-between text-[13px] font-medium text-white/55">
                <span>What do you need?</span>
                <span className="text-[12px] font-normal text-white/30">Optional</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((name) => {
                  const active = services.includes(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleService(name)}
                      className={`cursor-pointer rounded-full border px-4 py-1.75 text-[13px] font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                        active
                          ? 'border-white bg-white text-black'
                          : 'border-white/15 text-white/70 hover:border-white/50 hover:text-white'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <Field id="contact-message" label="About your project" error={showError('message')}>
              <textarea
                id="contact-message"
                name="message"
                rows={3}
                value={values.message}
                onChange={set('message')}
                onBlur={blur('message')}
                aria-invalid={Boolean(showError('message'))}
                aria-describedby={describe('message')}
                placeholder="What are you building, and what should it achieve?"
                className={`${inputBase} resize-none ${border('message')}`}
              />
            </Field>

            {/* spam tuzoq: odam ko'rmaydi */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={set('website')}
                />
              </label>
            </div>

            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="group inline-flex w-fit shrink-0 cursor-pointer items-center gap-3 rounded-full bg-white px-8 py-3.5 text-[14px] font-semibold text-black transition-colors duration-500 hover:bg-white/85 disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <span>{status === 'sending' ? 'Sending…' : 'Send message'}</span>
                <span
                  aria-hidden="true"
                  className="text-lg transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </button>

              <p
                role={status === 'error' ? 'alert' : undefined}
                className={`max-w-75 text-[12px] leading-[1.6] sm:text-right ${
                  status === 'error' ? 'text-[#ff8f8f]' : 'text-white/35'
                }`}
              >
                {status === 'error'
                  ? errorMsg
                  : 'We only use your details to reply to this message.'}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* =========================================
   CONTACT
========================================= */

export default function Contact() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="contact"
        data-nav-theme="dark"
        className="relative flex min-h-svh flex-col bg-[#070707] font-['Manrope'] text-white"
      >
        {/* yuqori padding navbar uchun, balandlik ekranga qarab moslashadi */}
        <div className="mx-auto flex w-full max-w-[1560px] flex-1 flex-col px-6 pb-16 pt-28 md:px-12 md:pb-[clamp(2rem,6vh,4rem)] md:pt-[clamp(7.5rem,16vh,9.5rem)]">
          <div className="grid flex-1 gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:grid-rows-[auto_1fr] lg:gap-x-20 xl:gap-x-28">
            {/* HEADING + matn */}
            <div className="lg:col-start-1 lg:row-start-1">
              <h2 className="font-['Bebas'] text-[clamp(3rem,min(6.4vw,10.5vh),7.5rem)] leading-[0.86]">
                <Line>LET’S BUILD</Line>
                <Line delay={0.08} className="text-white/30">
                  YOUR PRODUCT.
                </Line>
              </h2>

              <motion.p
                {...reveal(0.3)}
                className="mt-[clamp(1rem,3vh,2rem)] max-w-100 text-[14px] leading-[1.75] text-white/60 md:text-[15px]"
              >
                Tell us what you are building. We will come back with questions, a plan and an
                honest view of how we would engineer it.
              </motion.p>
            </div>

            {/* FORMA */}
            <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <ContactForm />
            </div>

            {/* ALOQA MA'LUMOTLARI */}
            <ul className="lg:col-start-1 lg:row-start-2 lg:self-end">
              {INFO.map((item, i) => (
                <InfoRow key={item.label} item={item} delay={0.4 + i * 0.07} />
              ))}
            </ul>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
