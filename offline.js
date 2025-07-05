self.addEventListener('install', e =>
  e.waitUntil(
    caches.open('offline').then(c => c.addAll(['/', '/favicon.ico']))
  )
);

self.addEventListener('fetch', e => e.respondWith(
  fetch(e.request).then(r => {
    caches.open('offline').then(c => c.put(e.request, r.clone()));
    return r;
  }).catch(() =>
    caches.match(e.request).then(r => r || Response.error())
  )
));