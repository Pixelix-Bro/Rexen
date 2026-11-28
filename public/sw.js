const CACHE_PREFIX = 'rexen-assets'
const CACHE_VERSION = 'rexen-v2'
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cachesList = await caches.keys()
      await Promise.all(
        cachesList
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match('/')
        if (cached) return cached

        const response = await fetch(request)
        if (response.ok) await cache.put('/', response.clone())
        return response
      })()
    )
    return
  }

  if (url.pathname.startsWith('/api/')) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match(request)
        if (cached) return cached

        const response = await fetch(request)
        if (response.ok) await cache.put(request, response.clone())
        return response
      })()
    )
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(request)
      if (cached) return cached

      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    })()
  )
})
