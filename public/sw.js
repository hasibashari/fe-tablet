const CACHE_NAME = 'medicore-pwa-v2'
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

// ============================================================
// WEB NOTIFICATIONS & PUSH HANDLERS
// ============================================================

// 1. Notification Click Handler (User taps notification in mobile lockscreen / status bar)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/user/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there is already a window open with this app
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (client.url !== self.location.origin + targetUrl && 'navigate' in client) {
            client.navigate(targetUrl)
          }
          return client.focus()
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// 2. Server Push Event Handler (Web Push payload from server)
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {
    title: 'Pengingat Obat MediCore',
    body: 'Waktunya meminum obat Anda sesuai jadwal.',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    url: '/user/dashboard',
  }

  try {
    const json = event.data.json()
    data = { ...data, ...json }
  } catch {
    data.body = event.data.text()
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.svg',
    badge: data.badge || '/icons/icon-192x192.svg',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'medicore-reminder',
    renotify: true,
    data: {
      url: data.url || '/user/dashboard',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Buka Jadwal' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})
