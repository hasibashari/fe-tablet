const CACHE_NAME = 'medicore-pwa-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some resources fail to precache
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate for static assets, network-first for page navigations & APIs
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Avoid caching dynamic server API requests or extensions
  if (url.pathname.startsWith('/api/') || url.origin !== self.origin) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request)
        if (cachedResponse) {
          return cachedResponse
        }
        // Fallback or let it fail gracefully
        return new Response('Offline - MediCore', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      })
  )
})
