'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    number: '01',
    name: 'LUBRIX',
    category: 'CRM PLATFORM',
    year: '2026',
    description: 'A modern digital ecosystem for automotive businesses.',
    image: '/images/1.webp',
    href: 'https://lubrix.uz',
  },
  {
    number: '02',
    name: 'LUBRIX CRM',
    category: 'SAAS PLATFORM',
    year: '2026',
    description: 'A powerful management platform for automotive services.',
    image: '/images/2.webp',
    href: 'https://app.lubrix.uz',
  },
  {
    number: '03',
    name: 'USTABOR',
    category: 'WEB PLATFORM',
    year: '2026',
    description: 'A digital platform connecting people and services.',
    image: '/projects/ustabor.webp',
    href: '#',
  },
]

export default function Projects() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return

    const ctx = gsap.context(() => {
      // HEADER REVEAL
      gsap.fromTo(
        titleRef.current,
        {
          yPercent: 100,
          opacity: 0,
          clipPath: 'inset(0 0 100% 0)',
        },
        {
          yPercent: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.35,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 88%',
            once: true,
          },
        }
      )

      // SECTION LABEL
      gsap.fromTo(
        '.projects-label',
        {
          opacity: 0,
          x: -25,
        },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )

      // PROJECT ANIMATIONS
      gsap.utils.toArray('.project-card').forEach((card) => {
        const image = card.querySelector('.project-image')
        const img = card.querySelector('.project-image img')
        const content = card.querySelector('.project-content')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 82%',
            once: true,
          },
        })

        // IMAGE REVEAL
        tl.fromTo(
          image,
          {
            clipPath: 'inset(0 0 100% 0)',
          },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.4,
            ease: 'power4.inOut',
          }
        )

        // IMAGE SCALE
        tl.fromTo(
          img,
          {
            scale: 1.18,
          },
          {
            scale: 1,
            duration: 1.5,
            ease: 'power3.out',
          },
          '-=1.1'
        )

        // CONTENT REVEAL
        tl.fromTo(
          content,
          {
            y: 35,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
          },
          '-=0.65'
        )

        // IMAGE PARALLAX
        gsap.fromTo(
          img,
          {
            yPercent: -3,
          },
          {
            yPercent: 3,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [shouldReduceMotion])

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full overflow-hidden bg-[#050505] text-white py-28 md:py-40"
    >
      <div className="max-w-[1500px] mx-auto px-5 md:px-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-28">
          <div>
            <p className="projects-label font-manrope text-[10px] tracking-[0.35em] text-white/40 mb-8">
              SELECTED WORKS / 2024 — 2026
            </p>

            <div className="overflow-hidden">
              <h2
                ref={titleRef}
                className="font-bebas text-[clamp(85px,14vw,190px)] leading-[0.78] tracking-tight"
              >
                PROJECTS<span className="text-white/25">.</span>
              </h2>
            </div>
          </div>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-manrope text-white/45 text-sm leading-7 max-w-[290px]"
          >
            A collection of digital experiences, products and creative solutions built with purpose.
          </motion.p>
        </div>

        {/* PROJECT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-20">
          {projects.map((project, index) => (
            <motion.article
              key={project.number}
              initial="rest"
              whileHover="hover"
              className={`project-card group min-w-0 ${index === 0 ? 'md:col-span-2' : ''}`}
            >
              {/* IMAGE */}
              <Link
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.name} project`}
                className="block relative overflow-hidden bg-[#111] aspect-[16/9]"
              >
                <div className="project-image absolute inset-0 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={`${project.name} project preview`}
                    fill
                    priority={index === 0}
                    sizes={index === 0 ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                    className="object-cover will-change-transform"
                  />
                </div>

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />

                {/* PROJECT NUMBER */}
                <span className="absolute top-6 left-6 font-manrope text-[10px] tracking-[0.2em] text-white/80 pointer-events-none">
                  {project.number} / {String(projects.length).padStart(2, '0')}
                </span>

                {/* ARROW */}
                <motion.div
                  variants={{
                    rest: {
                      rotate: 0,
                      scale: 1,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    },
                    hover: {
                      rotate: 45,
                      scale: 1.08,
                      backgroundColor: '#ffffff',
                    },
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute top-5 right-5 w-12 h-12 rounded-full border border-white/40 backdrop-blur-sm flex items-center justify-center text-white group-hover:text-black pointer-events-none"
                >
                  <ArrowUpRight size={21} strokeWidth={1.4} />
                </motion.div>

                {/* CATEGORY */}
                <span className="absolute bottom-6 left-6 font-manrope text-[9px] tracking-[0.25em] text-white/80 pointer-events-none">
                  {project.category}
                </span>
              </Link>

              {/* PROJECT CONTENT */}
              <div className="project-content pt-6 border-b border-white/15 pb-7">
                <div className="flex justify-between items-start gap-5">
                  <div className="min-w-0">
                    <motion.h3
                      variants={{
                        rest: { x: 0 },
                        hover: { x: 8 },
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="font-bebas text-5xl md:text-6xl tracking-wide"
                    >
                      {project.name}
                    </motion.h3>

                    <p className="font-manrope text-xs text-white/40 mt-3 max-w-[350px] leading-6">
                      {project.description}
                    </p>
                  </div>

                  <span className="font-manrope text-[10px] text-white/35 pt-2 shrink-0">
                    {project.year}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
