// Sprachblitz service worker
// Bump CACHE_VERSION on every deploy, or users keep the old app.
const CACHE_VERSION = 'sprachblitz-v24';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './bears/bear-stand.png',
  './bears/bear-sit.png',
  './bears/bear-wave.png',
  './bears/bear-think.png',
  './bears/bear-sleep.png',
  './bears/bear-dance.png',
  './bears/bear-jump.png',
  './bears/bear-hug.png',
  './bears/bear-walk.png',
  './bears/bear-run.png'
];

// Install: cache the shell. addAll fails entirely if one file 404s,
// so each file is fetched individually and misses are tolerated.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(APP_SHELL.map(url =>
      cache.add(url).catch(() => console.warn('[sw] skipped', url))
    ));
    self.skipWaiting();
  })());
});

// Activate: throw away caches from older versions.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Never cache authentication or database traffic — a stale login token
  // or a cached progress read would be worse than being offline.
  const url = new URL(req.url);
  if (/googleapis\.com$|firebaseio\.com$|firebaseapp\.com$/.test(url.hostname)
      && !/^fonts\./.test(url.hostname)) return;

  // Navigations: network first, so a fresh deploy is picked up when online,
  // but the cached page still opens on a train with no signal.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_VERSION);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Our own code and config must never go stale, or a deploy silently fails
  // to reach installed users. Network first, cache only as an offline fallback.
  const ownCode = url.origin === self.location.origin
    && /\.(js|json)$/.test(url.pathname);

  // Pre-rendered audio never changes once written, so cache it hard. This is
  // what lets the recorded German voice work offline.
  if (url.origin === self.location.origin && /^\/.*\/audio\/.*\.(mp3|wav)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) (await caches.open(CACHE_VERSION)).put(req, res.clone());
        return res;
      } catch (e) { return Response.error(); }
    })());
    return;
  }

  if (ownCode) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        const cache = await caches.open(CACHE_VERSION);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const hit = await caches.match(req);
        return hit || Response.error();
      }
    })());
    return;
  }

  // Everything else (images, fonts, the Tailwind CDN): cache first, then
  // network. These rarely change and are what make offline work.
  event.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      return hit || Response.error();
    }
  })());
});
