// JV Training Service Worker - minimal, pass-through only
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Pass ALL requests through without intercepting
// This prevents blocking YouTube API calls
self.addEventListener('fetch', (e) => {
  // Only cache same-origin GET requests for the app shell
  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isGet = e.request.method === 'GET';
  const isExternal = url.hostname.includes('railway.app') || 
                     url.hostname.includes('youtube') || 
                     url.hostname.includes('googleapis') ||
                     url.hostname.includes('pexels');

  // Let external requests pass through directly
  if (isExternal || !isSameOrigin) return;

  // For same-origin, try network first, fallback to cache
  if (isGet) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open('jvtraining-v2').then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
