'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import GlassSurface from '../ui/GlassSurface'

const LOGO_LIGHT = '/logo-black.png'
const LOGO_DARK = '/logo-white.png'

const MENU = [
  { name: 'Home', link: '#home' },
  { name: 'About', link: '#about' },
  { name: ' Why us', link: '#why' },
  { name: 'FAQ', link: '#faq' },
  { name: 'Contact', link: '#contact' },
]

const BEBAS = { fontFamily: 'Bebas' }
const MANROPE = { fontFamily: 'Manrope' }
const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'

const getLenis = () => {
  const raw = window.lenis
  const instance = raw?.scrollTo ? raw : raw?.lenis ?? raw?.current?.lenis ?? null
  return typeof instance?.scrollTo === 'function' ? instance : null
}

const THEME = {
  light: {
    link: 'text-black/55 hover:text-black',
    linkActive: 'text-black',
    bar: 'bg-black',
    ring: 'border-black/30 hover:border-black',
    cta: 'border-black/30 text-black hover:border-black hover:bg-black hover:text-white',
    focus: 'focus-visible:outline-black',
  },
  dark: {
    link: 'text-white/65 hover:text-white',
    linkActive: 'text-white',
    bar: 'bg-white',
    ring: 'border-white/30 hover:border-white',
    cta: 'border-white/35 text-white hover:border-white hover:bg-white hover:text-black',
    focus: 'focus-visible:outline-white',
  },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState(MENU[0].link)
  const [lightTheme, setLightTheme] = useState(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      const isScrolled = y > 80
      setScrolled(isScrolled)

      const probeY = isScrolled ? 120 : 135
      let theme = 'dark'
      document.querySelectorAll('[data-nav-theme]').forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= probeY && rect.bottom > probeY) {
          theme = section.getAttribute('data-nav-theme') || 'dark'
        }
      })
      setLightTheme(theme === 'light')

      let current = MENU[0].link
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 4
      if (atBottom) {
        current = MENU[MENU.length - 1].link
      } else {
        for (const item of MENU) {
          const el = document.querySelector(item.link)
          if (el && el.getBoundingClientRect().top <= 220) current = item.link
        }
      }
      setActiveLink(current)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('load', onScroll)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('load', onScroll)
    }
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    if (menuOpen) lenis?.stop()

    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const mq = window.matchMedia('(min-width: 1280px)')
    const onBreakpoint = (event) => {
      if (event.matches) setMenuOpen(false)
    }

    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onBreakpoint)

    return () => {
      document.body.style.overflow = ''
      lenis?.start()
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onBreakpoint)
    }
  }, [menuOpen])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const navigate = useCallback((event, link) => {
    const target = document.querySelector(link)
    setMenuOpen(false)
    if (!target) return
    event.preventDefault()
    setActiveLink(link)

    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.4, force: true })
    } else {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
    }
    history.replaceState(null, '', link)
  }, [])

  const showGlass = scrolled && !menuOpen

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] transition-[padding] duration-500 ${EASE} motion-reduce:transition-none ${
          scrolled
            ? 'px-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-7 lg:px-10'
            : 'px-0 pt-[env(safe-area-inset-top)]'
        }`}
      >
        <div
          className={`relative mx-auto w-full transition-[max-width,height] duration-500 ${EASE} motion-reduce:transition-none ${
            scrolled
              ? 'h-[94px] max-w-[1560px]'
              : 'h-[110px] max-w-[2400px] sm:h-[125px]'
          }`}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 transition-[opacity,visibility] duration-500 motion-reduce:transition-none ${
              showGlass ? 'visible opacity-100' : 'invisible opacity-0'
            }`}
          >
            <GlassSurface
              width="100%"
              height={94}
              borderRadius={60}
              distortionScale={-150}
              displace={1.5}
              backgroundOpacity={lightTheme ? 0.12 : 0.08}
            />
          </div>

          <Navigation
            activeLink={activeLink}
            light={lightTheme && !menuOpen}
            menuOpen={menuOpen}
            onToggle={() => setMenuOpen((open) => !open)}
            onNavigate={navigate}
          />
        </div>
      </header>

      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`fixed inset-0 z-[110] bg-[#080808]/[0.98] backdrop-blur-2xl transition-[opacity,visibility] duration-700 ${EASE} motion-reduce:transition-none xl:hidden ${
          menuOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <nav
          aria-label="Mobile navigation"
          className="flex h-full flex-col justify-center overflow-y-auto px-8 py-28 sm:px-16"
        >
          <div className="mb-10">
            <span className="text-[11px] tracking-[0.4em] text-white/35" style={MANROPE}>
              REXEN® / EXPLORE
            </span>
          </div>

          <div className="flex flex-col">
            {MENU.map((item, index) => {
              const active = activeLink === item.link
              return (
                <a
                  key={item.link}
                  href={item.link}
                  onClick={(event) => navigate(event, item.link)}
                  aria-current={active ? 'location' : undefined}
                  style={{
                    ...BEBAS,
                    transitionDelay: menuOpen ? `${index * 80}ms` : '0ms',
                  }}
                  className={`group flex items-center border-b border-white/10 py-4 text-[40px] tracking-[0.025em] transition-[transform,opacity,color] duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none sm:py-6 sm:text-[54px] ${
                    menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  } ${active ? 'text-white' : 'text-white/45 hover:text-white'}`}
                >
                  <span className="mr-7 text-[13px] tracking-wider text-white/30" style={MANROPE}>
                    0{index + 1}
                  </span>
                  {item.name}
                  <span className="ml-auto text-2xl text-white/30 transition-[transform,color] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white">
                    ↗
                  </span>
                </a>
              )
            })}
          </div>

          <a
            href="#contact"
            onClick={(event) => navigate(event, '#contact')}
            className="mt-10 w-fit text-[12px] tracking-[0.3em] text-white/50 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            style={MANROPE}
          >
            LET’S CREATE SOMETHING ↗
          </a>

          <span
            className="mt-14 text-[10px] tracking-[0.3em] text-white/20"
            style={MANROPE}
          >
            REXEN® — CREATIVE TECHNOLOGY
          </span>
        </nav>
      </div>
    </>
  )
}

function Navigation({ activeLink, light, menuOpen, onToggle, onNavigate }) {
  const t = light ? THEME.light : THEME.dark

  return (
    <div className="relative flex h-full w-full items-center justify-between px-6 sm:px-10 lg:px-14">
      <a
        href="#home"
        onClick={(event) => onNavigate(event, '#home')}
        aria-label="REXEN Home"
        className={`relative z-[130] block aspect-[3/1] w-[150px] shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:w-[175px] ${t.focus}`}
      >
        <Image
          src={LOGO_DARK}
          alt="REXEN"
          fill
          priority
          sizes="175px"
          className={`object-contain object-left transition-opacity duration-500 motion-reduce:transition-none ${
            light ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <Image
          src={LOGO_LIGHT}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="175px"
          className={`object-contain object-left transition-opacity duration-500 motion-reduce:transition-none ${
            light ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </a>

      <nav aria-label="Main navigation" className="hidden items-center gap-9 xl:flex 2xl:gap-12">
        {MENU.map((item) => {
          const active = activeLink === item.link
          return (
            <a
              key={item.link}
              href={item.link}
              onClick={(event) => onNavigate(event, item.link)}
              aria-current={active ? 'location' : undefined}
              style={BEBAS}
              className={`group relative flex items-center py-5 text-[21px] font-normal uppercase tracking-[0.045em] transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none 2xl:text-[23px] ${t.focus} ${
                active ? t.linkActive : t.link
              }`}
            >
              {item.name}
              <span
                aria-hidden="true"
                className={`absolute bottom-2 left-0 h-[2px] rounded-full transition-[width,background-color] duration-500 ${EASE} motion-reduce:transition-none ${t.bar} ${
                  active ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </a>
          )
        })}
      </nav>

      <div className="hidden items-center xl:flex">
        <a
          href="#contact"
          onClick={(event) => onNavigate(event, '#contact')}
          style={{ ...MANROPE, fontSize: '14px', fontWeight: 600 }}
          className={`group flex items-center gap-5 rounded-full border px-8 py-[17px] transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none 2xl:px-9 ${t.cta} ${t.focus}`}
        >
          <span>Let’s talk</span>
          <span className="text-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">
            ↗
          </span>
        </a>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        className={`relative z-[130] flex h-[54px] w-[54px] flex-col items-center justify-center gap-[7px] rounded-full border transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none xl:hidden ${t.ring} ${t.focus}`}
      >
        <span
          className={`h-[1.5px] w-[21px] transition-[transform,background-color] duration-300 ${t.bar} ${
            menuOpen ? 'translate-y-[4.25px] rotate-45' : ''
          }`}
        />
        <span
          className={`h-[1.5px] w-[21px] transition-[transform,background-color] duration-300 ${t.bar} ${
            menuOpen ? '-translate-y-[4.25px] -rotate-45' : ''
          }`}
        />
      </button>
    </div>
  )
}
