const CACHE_NAME = 'polyglot-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/main.js', // Webpack output
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  // Network-first for data, Cache-first for assets
  if (e.request.url.includes('firebase') || e.request.url.includes('api')) {
    e.respondWith(fetch(e.request));
  } else {
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request))
    );
  }
});
