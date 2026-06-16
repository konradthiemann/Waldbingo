/* Waldbingo Service Worker – einfache Offline-Strategie (Prototyp)
   - App-Shell + Daten: cache-first (funktioniert komplett offline)
   - Wetter-API (open-meteo): network-first mit Fallback
*/
const CACHE = 'waldbingo-v1';
const SHELL = [
  './',
  './index.html',
  './objects.data.js',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Wetter: network-first
  if (url.hostname.includes('open-meteo.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // App-Shell & Rest: cache-first
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
