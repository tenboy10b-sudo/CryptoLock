// public/sw.js — Service Worker для CryptoLock PWA
const CACHE = 'cryptolock-v1'

// Кешуємо основні ресурси при встановленні
const PRECACHE = [
  '/',
  '/offline',
  '/logo.webp',
  '/favicon.svg',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  // Тільки GET запити
  if (e.request.method !== 'GET') return
  // Тільки наш домен
  if (!e.request.url.startsWith(self.location.origin)) return
  // Не кешуємо API і Next.js chunks
  if (e.request.url.includes('/api/') ||
      e.request.url.includes('/_next/') ||
      e.request.url.includes('/sw.js')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(response => {
        // Кешуємо статті (HTML сторінки)
        if (response.ok && e.request.url.includes(self.location.origin)) {
          const clone = response.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return response
      }).catch(() => {
        // Офлайн fallback для HTML
        if (e.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline') || caches.match('/')
        }
      })
    })
  )
})
