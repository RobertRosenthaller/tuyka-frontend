const CACHE_NAME = 'tuyka-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API запросы — всегда через сеть
  if (url.hostname.includes('railway.app')) {
    event.respondWith(fetch(event.request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Статика — сначала кэш, потом сеть
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
