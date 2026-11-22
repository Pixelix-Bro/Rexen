// Ishlatish:
//   node scripts/extract-frames.mjs
//   node scripts/extract-frames.mjs public/media/back.mp4 --frames 140 --quality 92
//   node scripts/extract-frames.mjs --width 3840 --sm-width 1600 --sharpen 0.6
//
// Parametrlar:
//   --frames     kadrlar soni (standart 120, maks 999)
//   --quality    katta kadrlar sifati 0-100 (standart 92)
//   --width      katta kadr kengligi (standart 3840 = 4K)
//   --sm-width   kichik kadr kengligi (standart 1600)
//   --sharpen    kichraytirgandan keyingi o'tkirlik 0-1.5 (standart 0.5, 0 = o'chiq)
//
// Kerak: ffmpeg (libwebp bilan) va ffprobe PATH'da bo'lishi kerak.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)

const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const input = resolve(
  args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) ??
    'public/media/back.mp4'
)

const targetFrames = Math.min(Math.max(Number(flag('frames', 120)), 1), 999)
const quality = Math.min(Math.max(Number(flag('quality', 92)), 1), 100)
const bigWidth = Number(flag('width', 3840))
const smWidth = Number(flag('sm-width', 1600))
const sharpen = Math.min(Math.max(Number(flag('sharpen', 0.5)), 0), 1.5)

const outputs = [
  { dir: resolve('public/media/frames'), width: bigWidth, quality },
  {
    dir: resolve('public/media/frames-sm'),
    width: smWidth,
    quality: Math.max(quality - 4, 30),
  },
]

const run = (cmd, cmdArgs) =>
  execFileSync(cmd, cmdArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024 * 64,
  })

// --- Asboblarni tekshirish ---
try {
  run('ffmpeg', ['-version'])
  run('ffprobe', ['-version'])
} catch {
  console.error("ffmpeg yoki ffprobe topilmadi. Avval o'rnating: https://ffmpeg.org/download.html")
  process.exit(1)
}

if (!run('ffmpeg', ['-hide_banner', '-encoders']).includes('libwebp')) {
  console.error("Sizning ffmpeg'ingiz libwebp'siz yig'ilgan. libwebp qo'llab-quvvatlaydigan versiyani o'rnating.")
  process.exit(1)
}

if (!existsSync(input)) {
  console.error(`Video topilmadi: ${input}`)
  process.exit(1)
}

// --- Video haqida ma'lumot ---
const probe = JSON.parse(
  run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,color_transfer,pix_fmt:format=duration',
    '-of', 'json',
    input,
  ])
)

const stream = probe.streams?.[0] ?? {}
const srcWidth = Number(stream.width)
const srcHeight = Number(stream.height)
const duration = parseFloat(probe.format?.duration)

if (!Number.isFinite(duration) || duration <= 0) {
  console.error("Video uzunligini aniqlab bo'lmadi.")
  process.exit(1)
}

// HDR bo'lsa, ranglar o'chib qolmasligi uchun tone-mapping kerak
const isHDR = ['smpte2084', 'arib-std-b67'].includes(stream.color_transfer)
let hdrFilter = ''
if (isHDR) {
  const hasZscale = run('ffmpeg', ['-hide_banner', '-filters']).includes('zscale')
  if (hasZscale) {
    hdrFilter =
      'zscale=t=linear:npl=100,format=gbrpf32le,tonemap=hable:desat=0,' +
      'zscale=p=bt709:t=bt709:m=bt709:r=tv,'
    console.log('HDR video aniqlandi: tone-mapping yoqildi.')
  } else {
    console.warn("HDR video aniqlandi, lekin ffmpeg'da zscale yo'q: ranglar xira chiqishi mumkin.")
  }
}

// Eski FPS algoritmi saqlangan
const fps = Math.min(30, targetFrames / duration)

console.log(
  `Video: ${srcWidth}x${srcHeight}, ${duration.toFixed(2)} s, ` +
    `${fps.toFixed(3)} fps, taxminan ${Math.round(duration * fps)} kadr`
)

// --- Kadrlarni ajratish ---
for (const { dir, width, quality: q } of outputs) {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })

  // Manbadan katta qilib "upscale" qilmaymiz: foydasiz va faqat hajmni oshiradi
  const outWidth = Number.isFinite(srcWidth) ? Math.min(width, srcWidth) : width
  const evenWidth = outWidth - (outWidth % 2)

  const filters = [
    `${hdrFilter}fps=${fps.toFixed(4)}`,
    `scale=${evenWidth}:-2:flags=lanczos+accurate_rnd+full_chroma_int`,
    sharpen > 0 ? `unsharp=5:5:${sharpen.toFixed(2)}:5:5:0` : null,
    'format=yuv420p',
  ]
    .filter(Boolean)
    .join(',')

  run('ffmpeg', [
    '-y',
    '-v', 'error',
    '-i', input,
    '-an',
    '-vf', filters,
    '-c:v', 'libwebp',
    '-preset', 'picture',
    '-quality', String(q),
    '-compression_level', '6',
    join(dir, 'f_%03d.webp'),
  ])

  const files = readdirSync(dir).filter((f) => f.endsWith('.webp'))
  const bytes = files.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0)
  const height = Number.isFinite(srcWidth) ? Math.round((evenWidth * srcHeight) / srcWidth) : null

  writeFileSync(
    join(dir, 'meta.json'),
    JSON.stringify({
      count: files.length,
      width: evenWidth,
      height,
      fps: Number(fps.toFixed(3)),
    })
  )

  console.log(
    `${dir}\n  ${files.length} kadr, ${evenWidth}px, sifat ${q}, ${(bytes / 1024 / 1024).toFixed(2)} MB`
  )
}

console.log("Tayyor. Hero komponenti kadrlar sonini meta.json dan o'zi oladi.")
