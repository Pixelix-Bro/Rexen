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
      // Security headers
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },

      // AVIF frames - 1 yil cache
      {
        source: '/media/:path*.avif',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${YEAR}, immutable`,
          },
        ],
      },

      // WebP frames - 1 yil cache
      {
        source: '/media/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${YEAR}, immutable`,
          },
        ],
      },

      // JPG / JPEG frames - 1 yil cache
      {
        source: '/media/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${YEAR}, immutable`,
          },
        ],
      },
      {
        source: '/media/:path*.jpeg',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${YEAR}, immutable`,
          },
        ],
      },

      // PNG frames - 1 yil cache
      {
        source: '/media/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${YEAR}, immutable`,
          },
        ],
      },

      // Metadata - doim tekshirish
      {
        source: '/media/:path*/meta.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },

      // Other media files
      {
        source: '/media/:path*',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ]
  },
}

export default nextConfig
