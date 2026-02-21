const CACHE_NAME = 'mazdoori-cache-v1';

// Install Event: Skip waiting to immediately take control
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-First strategy (falls back to cache if offline)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If we get a valid response from the network, clone it and cache it
        return caches.open(CACHE_NAME).then((cache) => {
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // If the network fails (offline), serve from the cache
        return caches.match(event.request);
      })
  );
});
