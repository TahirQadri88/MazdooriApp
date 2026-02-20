// sw.js (Service Worker for PWA)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('khyber-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
                // Add other assets
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});