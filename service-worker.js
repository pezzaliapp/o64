self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('o64').then(function(cache) {
      return cache.addAll([
        './schedaordine.html',
        './style.css',
        './manifest.json',
        './icon/o64-192.png',
        './icon/o64-512.png'
      ]);
    })
  );
});
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
