'use client'

import Image from 'next/image';
import { useEffect, useState } from 'react';
import GlassSurface from '../ui/GlassSurface';

/* =========================================
   LOGO CONFIGURATION
========================================= */

// OQ SECTION UCHUN QORA LOGO
const LOGO_LIGHT = '/logo-black.png'

// QORA SECTION UCHUN OQ LOGO
const LOGO_DARK = '/logo-white.png'

const MENU = [
  { name: 'Home', link: '#home' },
  { name: 'About', link: '#about' },
  { name: 'Projects', link: '#projects' },
  { name: 'FAQ', link: '#faq' },
  { name: 'Contact', link: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('#home')
  const [lightTheme, setLightTheme] = useState(false)

  /* =========================================
     SCROLL & THEME DETECTION
  ========================================= */

  useEffect(() => {
    let ticking = false

    const updateNavbar = () => {
      if (ticking) return

      ticking = true

      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const isScrolled = scrollY > 80

        setScrolled(isScrolled)

        // Navbar ostidagi sectionni aniqlash
        const probeY = isScrolled ? 120 : 135

        const sections = document.querySelectorAll('[data-nav-theme]')

        let currentTheme = 'dark'

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect()

          if (rect.top <= probeY && rect.bottom > probeY) {
            currentTheme = section.getAttribute('data-nav-theme') || 'dark'
          }
        })

        setLightTheme(currentTheme === 'light')

        // ACTIVE NAVIGATION
        let current = '#home'

        MENU.forEach((item) => {
          const section = document.querySelector(item.link)

          if (section && section.getBoundingClientRect().top <= 220) {
            current = item.link
          }
        })

        setActiveLink(current)

        ticking = false
      })
    }

    updateNavbar()

    window.addEventListener('scroll', updateNavbar, {
      passive: true,
    })

    window.addEventListener('resize', updateNavbar)

    return () => {
      window.removeEventListener('scroll', updateNavbar)
      window.removeEventListener('resize', updateNavbar)
    }
  }, [])

  /* =========================================
     MOBILE MENU CONTROLS
  ========================================= */

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = menuOpen ? 'hidden' : ''

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* =========================================
          MAIN NAVBAR
      ========================================= */}

      <header
        className={`
    fixed left-0 top-0 z-[120] w-full
    transition-all duration-200 ease-in-out
    ease-[cubic-bezier(0.22,1,0.36,1)]
    ${scrolled ? 'px-4 pt-4 sm:px-7 lg:px-10' : 'px-0 pt-0'}
  `}
      >
        <div
          className={`
      mx-auto w-full
      transition-all duration-200
      ease-[cubic-bezier(0.22,1,0.36,1)]
      ${scrolled ? 'max-w-[1560px]' : 'max-w-none'}
    `}
        >
          {scrolled ? (
            <GlassSurface
              width="100%"
              height={94}
              borderRadius={60}
              distortionScale={-150}
              displace={1.5}
              backgroundOpacity={lightTheme ? 0.12 : 0.08}
              className='transition-all duration-200'
            >
              <div className="flex h-[94px] w-full items-center">
                <Navigation
                  activeLink={activeLink}
                  lightTheme={lightTheme}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  closeMenu={closeMenu}
                />
              </div>
            </GlassSurface>
          ) : (
            <div className="flex min-h-[125px] w-full items-center">
              <Navigation
                activeLink={activeLink}
                lightTheme={lightTheme}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                closeMenu={closeMenu}
              />
            </div>
          )}
        </div>
      </header>

      {/* =========================================
          MOBILE FULLSCREEN MENU
      ========================================= */}

      <div
        className={`
          fixed inset-0 z-[110] xl:hidden
          bg-[#080808]/[0.98]
          backdrop-blur-2xl
          transition-all duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${menuOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}
        `}
        aria-hidden={!menuOpen}
      >
        <nav className="flex h-full flex-col justify-center px-8 sm:px-16">
          <div className="mb-12">
            <span
              className="text-[11px] tracking-[0.4em] text-white/35"
              style={{ fontFamily: 'Manrope' }}
            >
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
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  style={{
                    fontFamily: 'Bebas',
                    transitionDelay: menuOpen ? `${index * 90}ms` : '0ms',
                  }}
                  className={`
                    group flex items-center
                    border-b border-white/10
                    py-5 sm:py-6
                    text-[43px] sm:text-[54px]
                    tracking-[0.025em]
                    transition-all duration-500
                    ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                    ${active ? 'text-white' : 'text-white/45 hover:text-white'}
                  `}
                >
                  <span
                    className="mr-7 text-[13px] tracking-wider text-white/30"
                    style={{ fontFamily: 'Manrope' }}
                  >
                    0{index + 1}
                  </span>

                  {item.name}

                  <span className="ml-auto text-2xl text-white/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white">
                    ↗
                  </span>
                </a>
              )
            })}
          </div>

          <a
            href="#contact"
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
            className="mt-12 text-[12px] tracking-[0.3em] text-white/50 transition-colors hover:text-white"
            style={{ fontFamily: 'Manrope' }}
          >
            LET'S CREATE SOMETHING ↗
          </a>

          <span
            className="absolute bottom-9 left-8 text-[10px] tracking-[0.3em] text-white/20 sm:left-16"
            style={{ fontFamily: 'Manrope' }}
          >
            REXEN® — CREATIVE TECHNOLOGY
          </span>
        </nav>
      </div>
    </>
  )
}

/* =========================================
   NAVIGATION COMPONENT
========================================= */

function Navigation({ activeLink, lightTheme, menuOpen, setMenuOpen, closeMenu }) {
  // Mobile menu qora fonda ochiladi.
  // Shu sababli menyu ochilganda oq logo ishlatiladi.
  const isLight = lightTheme && !menuOpen

  const currentLogo = isLight ? LOGO_LIGHT : LOGO_DARK

  const textColor = isLight ? 'text-black' : 'text-white'

  const mutedColor = isLight ? 'text-black/55' : 'text-white/65'

  return (
    <div className="flex w-full items-center justify-between px-6 sm:px-10 lg:px-14">
      {/* =========================================
          DYNAMIC LOGO
      ========================================= */}

      <a
        href="#home"
        onClick={closeMenu}
        aria-label="REXEN Home"
        className="relative z-[130] flex shrink-0 items-center"
      >
        <Image
          src={currentLogo}
          alt="REXEN"
          width={240}
          height={80}
          className="h-auto w-[175px] object-contain"
        />
      </a>

      {/* =========================================
          DESKTOP NAVIGATION
      ========================================= */}

      <nav
        aria-label="Main navigation"
        className="hidden xl:flex items-center gap-9 2xl:gap-12"
      >
        {MENU.map((item) => {
          const active = activeLink === item.link

          return (
            <a
              key={item.link}
              href={item.link}
              style={{ fontFamily: 'Bebas' }}
              className={`
                group relative flex items-center
                py-5
                text-[21px] 2xl:text-[23px]
                font-normal uppercase
                tracking-[0.045em]
                transition-colors duration-500
                ${active ? textColor : `${mutedColor} hover:${textColor}`}
              `}
            >
              {item.name}

              {/* ACTIVE UNDERLINE */}

              <span
                className={`
                  absolute bottom-2 left-0
                  h-[2px] rounded-full
                  transition-all duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  ${isLight ? 'bg-black' : 'bg-white'}
                  ${active ? 'w-full' : 'w-0 group-hover:w-full'}
                `}
              />
            </a>
          )
        })}
      </nav>

      {/* =========================================
          CTA BUTTON
      ========================================= */}

      <div className="hidden xl:flex items-center">
        <a
          href="#contact"
          style={{
            fontFamily: 'Manrope',
            fontSize: '14px',
            fontWeight: 600,
          }}
          className={`
            group flex items-center gap-5
            rounded-full
            border
            px-8 2xl:px-9
            py-[17px]
            transition-all duration-500
            ${
              isLight
                ? 'border-black/30 text-black hover:border-black hover:bg-black hover:text-white'
                : 'border-white/35 text-white hover:border-white hover:bg-white hover:text-black'
            }
          `}
        >
          <span>Let's talk</span>

          <span className="text-lg transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </a>
      </div>

      {/* =========================================
          MOBILE TOGGLE
      ========================================= */}

      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        className={`
          relative z-[130]
          flex xl:hidden
          h-[54px] w-[54px]
          flex-col items-center justify-center
          gap-[7px]
          rounded-full border
          transition-all duration-500
          ${isLight ? 'border-black/30 hover:border-black' : 'border-white/30 hover:border-white'}
        `}
      >
        <span
          className={`
            h-[1.5px] w-[21px]
            transition-all duration-300
            ${isLight ? 'bg-black' : 'bg-white'}
            ${menuOpen ? 'translate-y-[4.25px] rotate-45' : ''}
          `}
        />

        <span
          className={`
            h-[1.5px] w-[21px]
            transition-all duration-300
            ${isLight ? 'bg-black' : 'bg-white'}
            ${menuOpen ? '-translate-y-[4.25px] -rotate-45' : ''}
          `}
        />
      </button>
    </div>
  )
}
