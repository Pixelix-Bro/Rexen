import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const YEAR = 60 * 60 * 24 * 365
const MONTH = 60 * 60 * 24 * 30
const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  turbopack: {
    root: ROOT,
  },

  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '*.local'],

  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: YEAR,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'motion', 'gsap'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },

      {
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${MONTH}, stale-while-revalidate=86400`,
          },
        ],
      },

      {
        source: '/media/:folder(frames|frames-sm)/:file(f_\\d+\\.webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${YEAR}, immutable`,
          },
        ],
      },

      {
        source: '/media/:folder(frames|frames-sm)/meta.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default nextConfig
