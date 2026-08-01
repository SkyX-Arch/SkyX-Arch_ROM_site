// =============================================================================
// sw.js — a small service worker that makes repeat visits (and visits on a
// poor/flaky connection) load instantly by serving same-origin files from a
// cache first, while quietly checking the network for an update in the
// background (a "stale-while-revalidate" strategy).
//
// IMPORTANT: bump CACHE_VERSION whenever you change any file this worker
// caches (index.html, style.css, main.js, images, data.json), or visitors
// may keep seeing an old cached copy. It's just a label — "2", "2026-07-20",
// anything unique works, as long as it changes.
//
// Scope: only same-origin GET requests are handled here. Cross-origin
// requests (Google Fonts, a ROM's remote release JSON/changelog feed) are
// left completely untouched and go straight to the network as normal —
// this worker never caches or serves stale data for those.
// =============================================================================

const CACHE_VERSION = '8';
const CACHE_NAME = `romsite-shell-v${CACHE_VERSION}`;

// The core files needed to render the page at all. Add a path here if you
// add another file that's always needed (e.g. a new default screenshot).
const APP_SHELL = [
  './',
  'index.html',
  'data.json',
  'assets/css/style.css',
  'assets/js/main.js',
  'assets/img/logo.svg',
  'assets/img/favicon.png',
  'assets/img/social-banner.jpg',
  'assets/img/screenshot-placeholder.svg',
  'assets/img/screenshot-placeholder-2.svg',
  'assets/img/screenshot-placeholder-3.svg'
  'assets/img/Crdroid logo.svg',
  'assets/img/AxionOS logo.svg',
  'assets/img/screenshot-Crdroid.svg',
  'assets/img/screenshot-Crdroid-2.svg',
  'assets/img/screenshot-Crdroid-3.svg',
  'assets/img/screenshot-Crdroid-4.svg',
  'assets/img/screenshot-Crdroid-5.svg',
  'assets/img/screenshot-AxionOS.svg',
  'assets/img/screenshot-AxionOS-2.svg',
  'assets/img/screenshot-AxionOS-3.svg',
  'assets/img/screenshot-AxionOS-4.svg',
  'assets/img/screenshot-AxionOS-5.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin requests pass through untouched

  event.respondWith(staleWhileRevalidate(request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null); // offline / request failed — nothing more we can do here

  if (cached) {
    // Serve the cached copy immediately; refresh the cache in the
    // background for next time. Visitors see the update on their next
    // visit/reload, not this one — the standard SWR trade-off.
    networkFetch.catch(() => {});
    return cached;
  }

  // Nothing cached yet (first visit) — wait for the network, and only fall
  // back to a generic offline response if that genuinely fails too.
  const networkResponse = await networkFetch;
  if (networkResponse) return networkResponse;

  return new Response('Offline and nothing cached yet for this file.', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain' }
  });
}
