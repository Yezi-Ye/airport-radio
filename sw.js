'use strict';
const VERSION = 'b1e2125899b62654';
const PREFIX = 'airport-radio:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const INDEX = new URL('index.html', self.registration.scope).href;
const ASSETS = ['index.html', 'web.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'];
const ASSET_URLS = ASSETS.map(path => new URL(path, self.registration.scope).href);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      for (const url of ASSET_URLS) {
        const response = await fetch(url, {cache: 'reload', credentials: 'same-origin'});
        if (!response.ok || response.type === 'opaque') throw new Error('Unable to cache application asset');
        if (url === INDEX) {
          const content = await response.clone().text();
          if (!content.includes('name="airport-web-version" content="' + VERSION + '"')) throw new Error('Incomplete or mixed deployment');
        }
        await cache.put(url, response);
      }
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
    // Updates wait for the user's explicit confirmation; first installation activates normally.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'ACTIVATE_UPDATE') {
    event.waitUntil(self.skipWaiting());
  }
  if (event.data && event.data.type === 'CACHE_STATUS' && event.ports[0]) {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const responses = await Promise.all(ASSET_URLS.map(url => cache.match(url)));
      event.ports[0].postMessage({ready: responses.every(Boolean), version: VERSION});
    })());
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin) return;
  const isHome = url.pathname === scope.pathname || url.pathname === new URL(INDEX).pathname;
  const canonical = request.mode === 'navigate' && isHome ? INDEX : url.origin + url.pathname;
  if (!ASSET_URLS.includes(canonical)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(canonical);
    if (cached) return cached;
    return fetch(request);
  })());
});
