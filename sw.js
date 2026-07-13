// JV Training Service Worker v2.1.0
const CACHE_NAME = 'jvtraining-v2.1.0';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (e) => {
  // Remove old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isExternal = !url.origin.includes(self.location.origin);
  const isAPI = url.hostname.includes('railway.app') ||
                url.hostname.includes('googleapis') ||
                url.hostname.includes('youtube') ||
                url.hostname.includes('pexels');

  // Never cache external API calls
  if (isExternal || isAPI) return;

  // Network first for same-origin
  if (e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
