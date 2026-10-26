/**
 * SW.JS - Service Worker for Offline Cyber XO PWA
 */

const CACHE_NAME = 'cyber-xo-v3.3.0';
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

  const url = new URL(event.request.url);

  // Network-First strategy for HTML, JS and CSS to ensure updates take effect immediately
  const isCodeAsset = url.pathname.endsWith('.html') || 
                      url.pathname.endsWith('.js') || 
                      url.pathname.endsWith('.css') || 
                      url.pathname === '/' || 
                      url.pathname.endsWith('/');

  if (isCodeAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline or network unavailable, fall back to cache
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            const accept = event.request.headers.get('accept');
            if (accept && accept.includes('text/html')) {
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  // Cache-First with Network fallback for static images, icons, and sounds
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
