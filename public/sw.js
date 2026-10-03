/*
 * DSA App — service worker (Phase 0 skeleton).
 *
 * Deliberately minimal: it installs, activates and claims clients so the app is
 * installable as a PWA. The full offline-first implementation (app-shell
 * precache, runtime caching of problems, and Dexie-backed offline drafts) lands
 * in Phase 6.
 *
 * Cache versioning: bump CACHE_VERSION to invalidate everything.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `dsa-app-${CACHE_VERSION}`;

const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});