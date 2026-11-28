import { readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const publicDir = path.join(process.cwd(), 'public')
const outputFile = path.join(publicDir, 'cache-manifest.json')

const ignoredFiles = new Set(['cache-manifest.json', 'sw.js'])
const assetExtensions = new Set(['.avif', '.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico'])

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)))
      continue
    }

    if (!entry.isFile()) continue

    const fileStat = await stat(absolutePath)
    if (fileStat.size === 0) continue

    const relativePath = path.relative(publicDir, absolutePath).split(path.sep).join('/')
    if (ignoredFiles.has(relativePath)) continue

    if (assetExtensions.has(path.extname(relativePath).toLowerCase())) {
      files.push(`/${relativePath}`)
    }
  }

  return files
}

const assets = [...new Set(await walk(publicDir))].sort()
const desktopFrames = assets.filter((asset) => asset.startsWith('/media/frames/f_'))
const mobileFrames = assets.filter((asset) => asset.startsWith('/media/frames-sm/f_'))

await writeFile(
  outputFile,
  `${JSON.stringify(
    {
      version: 'rexen-v2',
      assets,
      desktopFrames,
      mobileFrames,
    },
    null,
    2
  )}\n`
)

console.log(`Generated cache manifest with ${assets.length} assets`)
