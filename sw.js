/*
 * Service worker of the process-step version (index_process_steps.html), 17 Nov 2026.
 *
 * Purpose: the app starts without network (hospital without WLAN, flight mode).
 * It only caches the app's own files. It never sees or sends observation data:
 * the data stay in the browser's localStorage on the device.
 *
 * Updates: change VERSION whenever a file in ASSETS changes. The app then shows
 * "New version of the app available – Update now"; nothing is replaced during an observation
 * without that tap.
 */
const VERSION = '2026-11-17-1';
const CACHE = 'observation-tool-pst-' + VERSION;   // own prefix: separate from other apps on the same origin
const ASSETS = [
  './index_process_steps.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  // cache: 'reload' bypasses the HTTP cache, so a new VERSION always stores the current files
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('observation-tool-pst-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => { if (event.data === 'skipWaiting') self.skipWaiting(); });

// Cache first for the app files (works offline); everything else goes to the network unchanged.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE)
      .then(c => c.match(req, { ignoreSearch: true }))
      .then(hit => hit || fetch(req))
  );
});
