'use client'

import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const VALUES = [
  {
    id: '01',
    title: 'Digital Products',
    description:
      'We design and develop powerful digital products, websites and platforms that transform ambitious ideas into meaningful experiences.',
    category: 'DESIGN & DEVELOPMENT',
    symbol: '↗',
  },
  {
    id: '02',
    title: 'Smart Systems',
    description:
      'From intelligent CRM platforms to custom software, we create technology that simplifies operations and accelerates businesses.',
    category: 'SOFTWARE & SYSTEMS',
    symbol: '⌘',
  },
  {
    id: '03',
    title: 'Creative Direction',
    description:
      'We bring strategy, visual identity and thoughtful design together to build distinctive brands and memorable digital experiences.',
    category: 'DESIGN & STRATEGY',
    symbol: '✳',
  },
  {
    id: '04',
    title: 'Future Driven',
    description:
      'We build scalable, high-performance solutions with a forward-thinking mindset, ready to evolve alongside your ambitions.',
    category: 'INNOVATION & GROWTH',
    symbol: '◎',
  },
]

export default function About() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      gsap.from('.ab-label', {
        y: 20,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.ab-philosophy',
          start: 'top 85%',
          once: true,
        },
      })

      gsap.from('.ab-title', {
        y: 55,
        autoAlpha: 0,
        duration: 1.15,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '.ab-philosophy',
          start: 'top 85%',
          once: true,
        },
      })

      gsap.from('.ab-copy', {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        delay: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.ab-philosophy',
          start: 'top 85%',
          once: true,
        },
      })

      mm.add('(min-width: 768px)', () => {
        gsap.from('.ab-card', {
          y: 65,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 1.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.ab-grid',
            start: 'top 82%',
            once: true,
          },
        })
      })

      mm.add('(max-width: 767px)', () => {
        gsap.from('.ab-card', {
          y: 35,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.ab-grid',
            start: 'top 88%',
            once: true,
          },
        })
      })

      return () => mm.revert()
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      data-nav-theme="light"
      className="relative overflow-hidden bg-white text-[#111111]"
    >
      <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
        {/* PHILOSOPHY */}

        <div className="ab-philosophy mb-16 grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end lg:mb-24">
          <div>
            <span className="ab-label mb-7 block font-manrope text-[10px] font-bold tracking-[0.22em] text-black/35">
              OUR PHILOSOPHY
            </span>

            <h2 className="ab-title max-w-[760px] font-bebas text-[clamp(45px,6vw,82px)] leading-[0.88] tracking-[-0.02em]">
              IDEAS DESERVE
              <span className="text-black/25"> MORE THAN JUST CODE.</span>
            </h2>
          </div>

          <p className="ab-copy max-w-[420px] font-manrope text-[13px] leading-[2] text-black/50 md:ml-auto md:text-[14px]">
            Technology is only the beginning. We combine creative thinking, strategic direction and
            engineering to create solutions with purpose, precision and lasting value.
          </p>
        </div>

        {/* VALUES */}

        <div className="ab-grid grid grid-cols-1 border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((item) => (
            <article
              key={item.id}
              className="ab-card group relative flex min-h-[365px] flex-col justify-between overflow-hidden border-b border-r border-black/10 bg-white p-7 transition-colors duration-500 ease-out hover:bg-[#F7F7F5] sm:min-h-[390px] lg:min-h-[420px] lg:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-manrope text-[11px] font-semibold tracking-[0.15em] text-black/30">
                  / {item.id}
                </span>

                <span className="flex h-11 w-11 items-center justify-center border border-black/10 font-manrope text-[21px] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-black group-hover:bg-black group-hover:text-white">
                  {item.symbol}
                </span>
              </div>

              <div className="relative mt-14">
                <h3 className="mb-5 font-bebas text-[39px] leading-[0.95] tracking-[-0.015em] transition-transform duration-500 group-hover:translate-x-1">
                  {item.title}
                </h3>

                <p className="font-manrope text-[12px] leading-[1.95] text-black/50 transition-colors duration-500 group-hover:text-black/75">
                  {item.description}
                </p>
              </div>

              <div className="mt-12 flex items-center justify-between border-t border-black/10 pt-5">
                <span className="font-manrope text-[9px] font-bold tracking-[0.12em] text-black/35">
                  {item.category}
                </span>

                <span className="font-manrope text-lg text-black/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black">
                  ↗
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
