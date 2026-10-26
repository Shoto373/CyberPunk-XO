/**
 * SW.JS - Service Worker for Offline Cyber XO PWA
 */

const CACHE_NAME = 'cyber-xo-v3.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  './css/variables.css',
  './css/style.css',
  './css/components.css',
  './css/animations.css',
  './js/app.js',
  './js/state.js',
  './js/ai.js',
  './js/audio.js',
  './js/particles.js',
  './js/ui.js',
  './js/p2p.js',
  './js/peerjs.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache external fonts or scripts dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        const accept = event.request.headers.get('accept');
        if (accept && accept.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
