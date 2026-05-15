// 手写 service worker：静态导出友好。
// 策略：
//   - 启动时 precache 首页与离线兜底页（基本可用）
//   - 阅读页 HTML 与 /bible/*.json：stale-while-revalidate（读过就缓存）
//   - search-index.json：cache-first，节省流量
//   - 其它：网络优先，失败回 cache，再失败回离线页

const VERSION = 'cunps-v1'
const CACHE_STATIC = `${VERSION}-static`
const CACHE_RUNTIME = `${VERSION}-runtime`
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '')

const PRECACHE_URLS = [
  `${BASE}/`,
  `${BASE}/offline/`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/bible/books.json`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((c) => c.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  )
})

function isReadPage(url) {
  return url.pathname.startsWith(`${BASE}/read/`)
}
function isBibleJson(url) {
  return url.pathname.startsWith(`${BASE}/bible/`) && url.pathname.endsWith('.json')
}
function isSearchIndex(url) {
  return url.pathname === `${BASE}/search-index.json`
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_RUNTIME)
  const cached = await cache.match(req)
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone())
      return res
    })
    .catch(() => cached)
  return cached || network
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_RUNTIME)
  const cached = await cache.match(req)
  if (cached) return cached
  const res = await fetch(req)
  if (res.ok) cache.put(req, res.clone())
  return res
}

async function networkFirst(req) {
  try {
    const res = await fetch(req)
    return res
  } catch (e) {
    const cached = await caches.match(req)
    if (cached) return cached
    const offline = await caches.match(`${BASE}/offline/`)
    if (offline) return offline
    throw e
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return

  if (isReadPage(url) || isBibleJson(url)) {
    event.respondWith(staleWhileRevalidate(req))
  } else if (isSearchIndex(url)) {
    event.respondWith(cacheFirst(req))
  } else if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req))
  }
})
