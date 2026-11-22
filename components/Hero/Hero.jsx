'use client'



import { Children, useEffect, useRef, useState } from 'react'

import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

import DotGrid from '../ui/DotGrid'

import TechText from '../ui/TechText'



gsap.registerPlugin(ScrollTrigger)



// Fontlar globals.css orqali @font-face bilan ulanadi.
const DISPLAY = {
  fontFamily: "'Bebas', Impact, sans-serif",
  fontWeight: 400,
  fontSynthesis: 'none',
}

const BODY = {
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 400,
}

/* ------------------------------------------------------------------ */

/*  SOZLAMALAR: odatda faqat shu qismni o'zgartirasiz                   */

/* ------------------------------------------------------------------ */



const SHOW_DOT_GRID = false // true qilsangiz fonda DotGrid ham chiqadi

const COLOR_THEME = 'ice' // REXEN premium monochrome theme

const OVERLAY = 'bg-black/35' // fonni qoraytirish (matn o'qilishi uchun). Qoraroq: bg-black/60

const LOAD_TIMEOUT = 20000 // internet juda sekin bo'lsa, shuncha millisekunddan keyin baribir ochiladi

const REQUIRED_LOADED = 1 // 1 = hamma kadr yuklangach ochiladi. 0.6 = 60% yuklangach ochiladi, qolgani fonda



// Sahifa ochilgach o'zi pastga skroll bo'lib boradi (foydalanuvchi aralashsa to'xtaydi)

const AUTO_SCROLL = true

const AUTO_SCROLL_SECONDS_PER_SECTION = 12 // har bir bo'lim uchun soniya



// Ranglar to'plami: sahifadagi barcha rangli joylar shu yerdan olinadi

const THEMES = {
  ice: {
    accent: 'from-white via-zinc-200 to-zinc-400',
    dot: 'bg-white',
    dotPing: 'bg-white/60',
    num: 'text-white/75',
    bar: 'from-white via-zinc-300 to-zinc-500',
    glow: 'hover:shadow-[0_0_42px_-12px_rgba(255,255,255,0.45)]',
  },
  ember: {
    accent: 'from-white via-zinc-200 to-zinc-400',
    dot: 'bg-white',
    dotPing: 'bg-white/60',
    num: 'text-white/75',
    bar: 'from-white via-zinc-300 to-zinc-500',
    glow: 'hover:shadow-[0_0_42px_-12px_rgba(255,255,255,0.45)]',
  },
  violet: {
    accent: 'from-white via-zinc-200 to-zinc-400',
    dot: 'bg-white',
    dotPing: 'bg-white/60',
    num: 'text-white/75',
    bar: 'from-white via-zinc-300 to-zinc-500',
    glow: 'hover:shadow-[0_0_42px_-12px_rgba(255,255,255,0.45)]',
  },
}
const THEME = THEMES[COLOR_THEME] ?? THEMES.ice



// Har bir obyekt = bitta to'liq ekranli bo'lim. Qo'shsangiz yoki o'chirsangiz,

// sahifa balandligi va video tezligi avtomatik moslashadi.

// Maydonlar: align (left | center | right), eyebrow, title, accent (rangli qism), text, services, ctas, micro, tech

const SECTIONS = [
  {
    align: 'left',
    eyebrow: 'REXEN — DIGITAL ENGINEERING COMPANY',
    title: 'WE BUILD THE',
    accent: 'DIGITAL FUTURE.',
    text: 'We design, engineer and deliver powerful digital products. From high-performance websites and intelligent CRM systems to enterprise software, SaaS platforms and AI-powered solutions — we turn ambitious ideas into technology that moves businesses forward.',
    ctas: [
      { label: 'Explore Our Work', href: '#work', variant: 'primary' },
      { label: 'Start a Project', href: '#contact', variant: 'secondary' },
    ],
    micro: 'IDEAS INTO INTELLIGENT SYSTEMS.',
  },
  {
    align: 'center',
    eyebrow: 'OUR EXPERTISE',
    title: 'ONE VISION.',
    accent: 'EVERY DIGITAL LAYER.',
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
    align: 'center',
    eyebrow: 'THE REXEN STANDARD',
    title: 'ENGINEERED',
    accent: 'BEYOND LIMITS.',
    ctas: [
      { label: 'Start a Project', href: '#contact', variant: 'primary' },
      { label: 'Explore Our Work', href: '#work', variant: 'secondary' },
    ],
    micro: 'BUILT WITH PURPOSE. DESIGNED TO SCALE.',
  },
]



/* ------------------------------------------------------------------ */

/*  KADRLAR (odatda tegmaysiz)                                          */

/* ------------------------------------------------------------------ */



// extract-frames.mjs skripti shu papkalarga kadrlarni va meta.json ni yozadi

const FRAMES_BIG = { dir: '/media/frames', width: 3840 }

const FRAMES_SMALL = { dir: '/media/frames-sm', width: 1600 }



// Kadrlarni qayta ajratganingizda shuni oshiring ('1' -> '2'), eski kesh ishlatilmasin

const FRAMES_VERSION = '1'



const DOWNLOAD_CONCURRENCY = 6 // parallel yuklashlar

const DECODE_CONCURRENCY = 2 // parallel dekodlash

const KEEP_DECODED = 17 // xotirada dekodlangan holda turadigan kadrlar (joriy kadr atrofida)

const MAX_DPR = 2

const MAX_CANVAS_PIXELS = 5_200_000 // canvas hajmi chegarasi (xotira va tezlik uchun)



// Kadrlar bir marta to'liq yuklangach, sahifalar orasida qaytganda yuklash ekrani qayta chiqmaydi

let allLoaded = false

// Avtomatik skroll sessiyada faqat bir marta ishlaydi

let autoScrolled = false



const frameSrc = (dir, i) => `${dir}/f_${String(i + 1).padStart(3, '0')}.webp?v=${FRAMES_VERSION}`

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))



/* Ko'rinishga kirganda ichidagi elementlar birin-ketin paydo bo'ladi, chiqib ketganda yashirinadi.

   active=false bo'lsa (yuklash ekrani ochiq paytida) kutib turadi. */

const Reveal = ({ children, className = '', active = true }) => {

const ref = useRef(null)

const [inView, setInView] = useState(false)



  useEffect(() => {

const el = ref.current

const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {

      threshold: 0.4,

    })

    io.observe(el)

return () => io.disconnect()

  }, [])



const show = inView && active



return (

    <div ref={ref} className={className}>

      {Children.toArray(children).map((child, i) => (

        <div

key={i}

style={{ transitionDelay: show ? `${i * 110}ms` : '0ms' }}

className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${

            show ? 'translate-y-0 opacity-100 blur-none' : 'translate-y-8 opacity-0 blur-sm'

          }`}

        >

          {child}

        </div>

      ))}

    </div>

  )

}



const JUSTIFY = {

  left: 'justify-start',

  center: 'justify-center',

  right: 'justify-end',

}



const ALIGN = {

  left: 'items-start text-left mr-auto',

  center: 'items-center text-center mx-auto',

  right: 'items-end text-right ml-auto',

}



/* Bitta to'liq ekranli bo'lim */

const Panel = ({ align = 'center', active, children }) => (

  <div className="flex min-h-[100svh] items-center px-5 pt-24 pb-16 sm:px-8 md:px-14 md:pt-24 lg:px-20 xl:px-28">

    <Reveal

active={active}

className={`flex w-full max-w-7xl flex-col gap-5 sm:gap-6 md:gap-7 [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] ${ALIGN[align]}`}

    >

      {children}

    </Reveal>

  </div>

)



const ArrowIcon = () => (

  <svg

viewBox="0 0 24 24"

fill="none"

stroke="currentColor"

strokeWidth="2"

strokeLinecap="round"

strokeLinejoin="round"

className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"

aria-hidden="true"

  >

    <path d="M5 12h14M13 6l6 6-6 6" />

  </svg>

)



const Hero = () => {

const sectionRef = useRef(null)

const canvasRef = useRef(null)

const hintRef = useRef(null)

const progressRef = useRef(null)

const loaderRef = useRef(null)

const [ready, setReady] = useState(allLoaded)



  useEffect(() => {

const section = sectionRef.current

const canvas = canvasRef.current

const ctx = canvas.getContext('2d', { alpha: false })

const root = document.documentElement

const abort = new AbortController()



let cancelled = false

let finished = allLoaded

let timer

let trigger

let resizeTimer



// ---------- kadrlar holati ----------

let count = 0

let srcW = 3840

let srcH = 2160

let current = 0 // hozir ko'rsatilishi kerak bo'lgan kadr

let shown = -1 // canvas'da hozir chizilgan kadr

let generation = 0 // canvas o'lchami o'zgarganda oshadi

let size = { cw: 0, ch: 0 }

let lastWidth = 0



const blobs = [] // siqilgan kadrlar (jami ~40 MB, xotirada arzon)

const bitmaps = new Map() // faqat joriy kadr atrofidagi dekodlanganlari

const decoding = new Set()

const failedDecode = new Set()



// Yuklash tugaguncha scroll qilib bo'lmaydi

const lock = () => {

      root.style.overflow = 'hidden'

    }

const unlock = () => {

      root.style.overflow = ''

    }



// ============================================

// CANVAS O'LCHAMI

// ============================================



const measure = () => {

const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)



let w = canvas.clientWidth * dpr

let h = canvas.clientHeight * dpr



const pixels = w * h

if (pixels > MAX_CANVAS_PIXELS) {

const k = Math.sqrt(MAX_CANVAS_PIXELS / pixels)

        w *= k

        h *= k

      }



return { cw: Math.max(1, Math.round(w)), ch: Math.max(1, Math.round(h)) }

    }



// ============================================

// DEKODLASH

// Har kadr faqat ko'rinadigan qismi (cover) va aynan canvas o'lchamida

// dekodlanadi: 1:1 piksel (maksimal o'tkirlik) va kam xotira.

// ============================================



const decodeBitmap = async (index) => {

const blob = blobs[index]

const { cw, ch } = size



const scale = Math.max(cw / srcW, ch / srcH)

const visibleW = Math.min(srcW, Math.round(cw / scale))

const visibleH = Math.min(srcH, Math.round(ch / scale))

const sx = Math.max(0, Math.round((srcW - visibleW) / 2))

const sy = Math.max(0, Math.round((srcH - visibleH) / 2))



const outW = Math.max(1, Math.min(cw, visibleW))

const outH = Math.max(1, Math.min(ch, visibleH))



try {

const bmp = await createImageBitmap(blob, sx, sy, visibleW, visibleH, {

          resizeWidth: outW,

          resizeHeight: outH,

          resizeQuality: 'high',

        })

return { bmp, cropped: true }

      } catch {

// Eski brauzerlar: to'liq kadr, chizishda cover hisoblanadi

const bmp = await createImageBitmap(blob)

return { bmp, cropped: false }

      }

    }



const startDecode = (index) => {

      decoding.add(index)

const gen = generation



      decodeBitmap(index)

        .then((entry) => {

          decoding.delete(index)



if (cancelled || gen !== generation) {

            entry.bmp.close?.()

          } else {

            bitmaps.set(index, entry)

            paint()

          }



          pump()

        })

        .catch(() => {

          decoding.delete(index)

          failedDecode.add(index)

          pump()

        })

    }



// Joriy kadrga eng yaqin yuklangan kadrlarni dekodlaydi, uzoqlarini xotiradan bo'shatadi

const pump = () => {

if (cancelled || !count || !size.cw) return



const have = []

for (let i = 0; i < count; i++) if (blobs[i]) have.push(i)



      have.sort((a, b) => Math.abs(a - current) - Math.abs(b - current))



const want = new Set(have.slice(0, KEEP_DECODED))



for (const [index, entry] of bitmaps) {

if (!want.has(index)) {

          entry.bmp.close?.()

          bitmaps.delete(index)

        }

      }



for (const index of want) {

if (decoding.size >= DECODE_CONCURRENCY) break

if (bitmaps.has(index) || decoding.has(index) || failedDecode.has(index)) continue

        startDecode(index)

      }

    }



// ============================================

// CHIZISH

// ============================================



const paint = () => {

if (!count || !size.cw) return



// Dekodlanganlar ichidan joriy kadrga eng yaqinini topadi

let best = -1

let bestDistance = Infinity



for (const index of bitmaps.keys()) {

const distance = Math.abs(index - current)

if (distance < bestDistance) {

          bestDistance = distance

          best = index

        }

      }



if (best < 0 || best === shown) return



const { bmp, cropped } = bitmaps.get(best)

const { cw, ch } = size



if (cropped) {

        ctx.drawImage(bmp, 0, 0, cw, ch)

      } else {

const scale = Math.max(cw / bmp.width, ch / bmp.height)

const w = bmp.width * scale

const h = bmp.height * scale

        ctx.drawImage(bmp, (cw - w) / 2, (ch - h) / 2, w, h)

      }



      shown = best

    }



const setCurrent = (index) => {

if (index === current) return

      current = index

      pump()

      paint()

    }



// "Scroll" yozuvi scroll boshlanishi bilan yo'qoladi, pastdagi chiziq progressni ko'rsatadi

const updateHint = (progress) => {

if (hintRef.current) hintRef.current.style.opacity = progress > 0.02 ? '0' : '1'

if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`

    }



// ============================================

// RESIZE

// Telefonda manzil paneli siljisa qayta chizmaslik uchun faqat kenglikni kuzatadi

// ============================================



const applyLayout = () => {

if (window.innerWidth === lastWidth && size.cw) return

      lastWidth = window.innerWidth



const next = measure()

if (next.cw === size.cw && next.ch === size.ch) return



      size = next

      canvas.width = size.cw

      canvas.height = size.ch



      ctx.imageSmoothingEnabled = true

      ctx.imageSmoothingQuality = 'high'



      generation++

      shown = -1



for (const entry of bitmaps.values()) entry.bmp.close?.()

      bitmaps.clear()

      decoding.clear()



      pump()

    }



const onResize = () => {

      clearTimeout(resizeTimer)

      resizeTimer = setTimeout(applyLayout, 120)

    }



// ============================================

// AVTOMATIK SKROLL

// Yuklash tugagach o'zi pastga skroll bo'lib boradi, orqaga qaytmaydi.

// Foydalanuvchi aralashsa (g'ildirak, barmoq, klaviatura, scrollbar) to'xtaydi.

// ============================================



const interactionEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown']

let autoActive = false

let autoY = 0



const stopAutoScroll = () => {

if (!autoActive) return



      autoActive = false

      gsap.ticker.remove(autoScrollTick)

      interactionEvents.forEach((name) => window.removeEventListener(name, stopAutoScroll))

    }



const autoScrollTick = (_time, deltaTime) => {

// Foydalanuvchi scrollbar'ni tortgan yoki boshqa yo'l bilan siljitgan bo'lsa

if (Math.abs(window.scrollY - autoY) > 4) {

        stopAutoScroll()

return

      }



// Birinchi kadr chizilmaguncha va oldindagi kadrlar yetib kelmaguncha kutadi

if (shown < 0) return

const ahead = Math.min(count - 1, current + 6)

for (let i = current; i <= ahead; i++) if (!blobs[i]) return



const distance = section.offsetHeight - window.innerHeight

const duration = AUTO_SCROLL_SECONDS_PER_SECTION * Math.max(1, SECTIONS.length - 1)



      autoY += (Math.min(deltaTime, 100) / 1000) * (distance / duration)



if (autoY >= distance) {

        window.scrollTo({ top: distance, behavior: 'instant' })

        stopAutoScroll()

return

      }



      window.scrollTo({ top: autoY, behavior: 'instant' })

    }



const startAutoScroll = () => {

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches



if (!AUTO_SCROLL || autoScrolled || reduceMotion || window.scrollY > 10) return



      autoScrolled = true

      autoActive = true

      autoY = window.scrollY



      interactionEvents.forEach((name) =>

        window.addEventListener(name, stopAutoScroll, { passive: true })

      )

      gsap.ticker.add(autoScrollTick)

    }



// ============================================

// YAKUNLASH

// ============================================



const finish = () => {

if (finished || cancelled) return

      finished = true

      allLoaded = true

      clearTimeout(timer)

      unlock()

      setReady(true)

      startAutoScroll()

    }



// ============================================

// YUKLASH

// ============================================



const fetchMeta = async (source) => {

const response = await fetch(`${source.dir}/meta.json`, { signal: abort.signal })



if (!response.ok) throw new Error(`${source.dir}/meta.json topilmadi`)



const meta = await response.json()



if (!meta?.count) throw new Error(`${source.dir} bo'sh`)



return meta

    }



const init = async () => {

// Ekranga qancha piksel kerakligiga qarab to'plam tanlanadi:

// kichik to'plam shu ekranda kattalashsa xira bo'ladi.

const aspect = 16 / 9

const coverWidth = Math.max(size.cw, size.ch * aspect)



const connection = navigator.connection

const slowNetwork = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')



const preferBig = coverWidth / FRAMES_SMALL.width > 1.15 && !slowNetwork

const sources = preferBig ? [FRAMES_BIG, FRAMES_SMALL] : [FRAMES_SMALL, FRAMES_BIG]



let meta = null

let source = null



for (const candidate of sources) {

try {

          meta = await fetchMeta(candidate)

          source = candidate

break

        } catch {

if (cancelled) return

        }

      }



if (cancelled) return



if (!meta || !source) {

        console.warn(

          'Hero: meta.json topilmadi. Loyiha ildizidan "node scripts/extract-frames.mjs" ni ishga tushiring.'

        )

        finish() // yuklash ekrani qotib qolmasin

return

      }



      count = meta.count

      srcW = meta.width ?? source.width

      srcH = meta.height ?? Math.round(srcW / aspect)



// Sekin internetda ham tez-tez kadr ko'rinishi uchun: avval siyrak kadrlar, keyin qolganlari

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



      timer = setTimeout(finish, LOAD_TIMEOUT)



// Scroll holatini kadr raqamiga aylantiradi (silliqlashni Lenis qiladi)

      trigger = ScrollTrigger.create({

        trigger: section,

        start: 'top top',

        end: 'bottom bottom',

        onUpdate: (self) => {

          setCurrent(Math.round(self.progress * (count - 1)))

          updateHint(self.progress)

        },

      })

      current = Math.round(trigger.progress * (count - 1))

      updateHint(trigger.progress)



let cursor = 0

let settled = 0

let loaded = 0



const worker = async () => {

while (!cancelled) {

const k = cursor++

if (k >= order.length) return



const index = order[k]



for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {

try {

const response = await fetch(frameSrc(source.dir, index), {

                signal: abort.signal,

              })



if (!response.ok) throw new Error(`Frame ${index} not found`)



              blobs[index] = await response.blob()

              loaded++

break

            } catch {

if (cancelled) return

await wait(300 * (attempt + 1))

            }

          }



          settled++



if (loaderRef.current) {

            loaderRef.current.textContent = `${Math.round((settled / count) * 100)}%`

          }



          pump()

          paint()



if (settled / count >= REQUIRED_LOADED) finish()

        }

      }



await Promise.all(

        Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, count) }, () => worker())

      )



if (!cancelled && loaded === 0) {

        console.warn('Hero: kadrlar yuklanmadi.')

        finish()

      }

    }



// ============================================

// ISHGA TUSHIRISH

// ============================================



if (!allLoaded) lock()



    applyLayout()

    init().catch((error) => {

if (!cancelled) console.error('Hero:', error)

      finish()

    })

    window.addEventListener('resize', onResize)



return () => {

      cancelled = true

      abort.abort()



      clearTimeout(timer)

      clearTimeout(resizeTimer)

      stopAutoScroll()

      unlock()

      trigger?.kill()

      window.removeEventListener('resize', onResize)



for (const entry of bitmaps.values()) entry.bmp.close?.()

      bitmaps.clear()

      blobs.length = 0

    }

  }, [])



return (

    <section

ref={sectionRef}

className="relative bg-black text-white antialiased"

style={BODY}

    >

      <style>{`

        @keyframes rexen-scroll {

          0% { transform: translateY(-100%); }

          100% { transform: translateY(200%); }

        }

        .rexen-scroll-line { animation: rexen-scroll 1.9s cubic-bezier(0.65, 0, 0.35, 1) infinite; }

        @media (prefers-reduced-motion: reduce) { .rexen-scroll-line { animation: none; } }

      `}</style>

      {/* Yuklash ekrani: kadrlar tayyor bo'lgach silliq yo'qoladi */}

      <div

aria-hidden={ready}

className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#050505] text-white transition-opacity duration-700 ${

          ready ? 'pointer-events-none opacity-0' : 'opacity-100'

        }`}

      >

        <span ref={loaderRef} style={DISPLAY} className="text-7xl leading-none tracking-tight tabular-nums sm:text-8xl md:text-9xl">

          0%

        </span>

        <span className="text-[10px] font-semibold tracking-[0.32em] text-white/55 uppercase sm:text-[11px]">

          Yuklanmoqda

        </span>

      </div>



      {/* 1-qatlam: scroll paytida qotib turadigan fon */}

      <div className="sticky top-0 h-screen w-full overflow-hidden">

        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        <div className={`absolute inset-0 ${OVERLAY}`} />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />



        {SHOW_DOT_GRID && (

          <div className="absolute inset-0 z-10">

            <DotGrid />

          </div>

        )}



        {/* "Scroll" yozuvi */}

        <div

ref={hintRef}

className="pointer-events-none absolute bottom-6 left-1/2 sm:bottom-8 z-20 flex -translate-x-1/2 flex-col items-center gap-4 transition-opacity duration-500"

        >

          <span className="text-[9px] font-semibold tracking-[0.32em] text-white/70 uppercase sm:text-[10px] sm:tracking-[0.4em]">

            SCROLL TO EXPLORE

          </span>

          <div className="h-9 w-px overflow-hidden bg-white/20 sm:h-11">

            <div className="rexen-scroll-line h-1/2 w-full bg-white" />

          </div>

        </div>



        {/* Pastki progress chizig'i */}

        <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-px w-full bg-white/10">

          <div

ref={progressRef}

className={`h-full w-full origin-left scale-x-0 bg-gradient-to-r ${THEME.bar}`}

          />

        </div>

      </div>



      {/* 2-qatlam: fon ustidan scroll bilan o'tadigan ma'lumotlar.

          -mt-[100vh] shu qatlamni fon ustiga ko'taradi. */}

      <div className="pointer-events-none relative z-20 -mt-[100vh]">

        {SECTIONS.map((s, i) => {

const Title = i === 0 ? 'h1' : 'h2'

return (

            <Panel key={s.title} align={s.align} active={ready}>

              {s.eyebrow && (

                <span className="flex items-center gap-3 text-[9px] font-bold tracking-[0.22em] text-white/75 uppercase sm:text-[10px] sm:tracking-[0.28em] md:text-[11px]">

                  <span className="relative flex h-1.5 w-1.5">

                    <span

className={`absolute inline-flex h-full w-full animate-ping rounded-full ${THEME.dotPing}`}

                    />

                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${THEME.dot}`} />

                  </span>

                  {s.eyebrow}

                </span>

              )}



              <Title

style={DISPLAY}

className={`leading-[0.92] tracking-[0.01em] text-balance text-white uppercase ${

                  i === 0

                    ? '[font-size:clamp(4rem,11vw,10rem)]'

                    : '[font-size:clamp(3.5rem,8.5vw,7.5rem)]'

                }`}

              >

                {s.title}

                {s.accent && (

                  <span

className={`block bg-gradient-to-r ${THEME.accent} bg-clip-text text-transparent [text-shadow:none] drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]`}

                  >

                    {s.accent}

                  </span>

                )}

              </Title>



              {s.text && (

                <p className="max-w-2xl text-[13px] leading-[1.8] font-medium text-pretty text-white/75 sm:text-sm md:text-base lg:text-[17px]">

                  {s.text}

                </p>

              )}



              {s.services && (

                <ul className={`flex max-w-3xl flex-wrap gap-2 sm:gap-2.5 md:gap-3 ${JUSTIFY[s.align]}`}>

                  {s.services.map((service, n) => (

                    <li

key={service}

className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 py-2 pr-3.5 pl-3 text-[11px] font-semibold tracking-[0.01em] text-white/90 backdrop-blur-xl transition-colors duration-300 hover:border-white/35 hover:bg-white/10 sm:gap-2.5 sm:py-2.5 sm:pr-4 sm:text-xs md:text-sm"

                    >

                      <span className={`text-[10px] font-bold tabular-nums sm:text-[11px] ${THEME.num}`}>

                        {String(n + 1).padStart(2, '0')}

                      </span>

                      {service}

                    </li>

                  ))}

                </ul>

              )}



              {s.tech && <TechText />}



              {s.ctas && (

                <div className={`mt-2 flex flex-wrap gap-2.5 sm:gap-3 ${JUSTIFY[s.align]}`}>

                  {s.ctas.map((cta) => (

                    <a

key={cta.label}

href={cta.href}

style={{ color: cta.variant === 'primary' ? '#000' : '#fff' }}

className={`group pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 text-xs font-bold tracking-wide transition-all duration-300 [text-shadow:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-12 sm:gap-2.5 sm:px-6 sm:py-3.5 sm:text-sm md:text-[15px] ${

                        cta.variant === 'primary'

                          ? `bg-white shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 ${THEME.glow}`

                          : 'border border-white/30 bg-black/25 backdrop-blur-xl hover:border-white/60 hover:bg-white/10'

                      }`}

                    >

                      {cta.label}

                      {cta.variant === 'primary' && <ArrowIcon />}

                    </a>

                  ))}

                </div>

              )}



              {s.micro && (

                <span className="mt-2 flex items-center gap-3 text-[9px] font-semibold tracking-[0.22em] text-white/55 uppercase sm:gap-4 sm:text-[10px] sm:tracking-[0.3em] md:text-[11px]">

                  <span className="h-px w-7 bg-white/35 sm:w-10" />

                  {s.micro}

                </span>

              )}

            </Panel>

          )

        })}

      </div>

    </section>

  )

}



export default Hero
