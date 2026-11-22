import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { performance } from 'node:perf_hooks'

const CONFIG = {
  folders: [
    {
      input: 'public/media/frames',
      output: 'public/media/frames-avif',
    },
    {
      input: 'public/media/frames-sm',
      output: 'public/media/frames-sm-avif',
    },
  ],

  quality: 60,
  effort: 2,

  concurrency: Math.max(2, Math.min(os.cpus().length, 8)),

  extensions: ['.jpg', '.jpeg', '.png', '.webp'],
}

// CPU uchun optimallashtirish
sharp.concurrency(1)

async function getImages(folder) {
  const files = await fs.readdir(folder, {
    withFileTypes: true,
  })

  const result = await Promise.all(
    files.map(async (file) => {
      const full = path.join(folder, file.name)

      if (file.isDirectory()) {
        return getImages(full)
      }

      if (CONFIG.extensions.includes(path.extname(file.name).toLowerCase())) {
        return [full]
      }

      return []
    })
  )

  return result.flat().sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

async function convertFolder({ input, output }) {
  console.log(`\n📂 ${input}`)

  const images = await getImages(input)

  if (!images.length) return

  await fs.mkdir(output, { recursive: true })

  let nextIndex = 0
  let completed = 0
  let originalSize = 0
  let convertedSize = 0

  const start = performance.now()

  async function worker() {
    while (true) {
      const index = nextIndex++

      if (index >= images.length) return

      const source = images[index]
      const relative = path.relative(input, source)

      const destination = path.join(output, relative.replace(/\.[^.]+$/, '.avif'))

      await fs.mkdir(path.dirname(destination), {
        recursive: true,
      })

      const [sourceStat] = await Promise.all([fs.stat(source)])

      await sharp(source, {
        sequentialRead: true,
        limitInputPixels: false,
      })
        .avif({
          quality: CONFIG.quality,
          effort: CONFIG.effort,
          chromaSubsampling: '4:2:0',
        })
        .toFile(destination)

      const outputStat = await fs.stat(destination)

      originalSize += sourceStat.size
      convertedSize += outputStat.size

      completed++

      console.log(`⚡ ${completed}/${images.length} | ${relative}`)
    }
  }

  await Promise.all(Array.from({ length: CONFIG.concurrency }, () => worker()))

  const seconds = ((performance.now() - start) / 1000).toFixed(1)

  const saved = ((1 - convertedSize / originalSize) * 100).toFixed(1)

  console.log('\n✅ FINISHED')
  console.log(`Frames: ${completed}`)
  console.log(`Original: ${(originalSize / 1048576).toFixed(2)} MB`)
  console.log(`AVIF: ${(convertedSize / 1048576).toFixed(2)} MB`)
  console.log(`Saved: ${saved}%`)
  console.log(`Time: ${seconds}s`)
}

async function main() {
  for (const folder of CONFIG.folders) {
    try {
      await convertFolder(folder)
    } catch (error) {
      console.error(`❌ ${folder.input}:`, error.message)
    }
  }
}

main().catch(console.error)
