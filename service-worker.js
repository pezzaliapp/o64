self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('o64-cache').then(cache => {
      return cache.addAll([
        './',
        './schedaordine.html',
        './manifest.json',
        './C64_Pro_Mono.ttf',
        './o64-192.png',
        './o64-512.png'
      ]);
    })
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});