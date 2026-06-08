// public/sw.js — Service Worker для CryptoLock PWA
const CACHE = 'cryptolock-v2'
const OFFLINE = '/offline'

// При активації — одразу видаляємо старий кеш
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([OFFLINE])).then(() => self.skipWaiting())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // HTML сторінки — завжди Network First (свіжий контент)
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
          return res
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match(OFFLINE)))
    )
    return
  }

  // Статика Next.js — Cache First (незмінна, має hash в URL)
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()))
        return res
      }))
    )
    return
  }

  // Решта — Network First
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  )
})
