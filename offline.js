self.addEventListener('install', e =>
  e.waitUntil(
    caches.open('offline').then(c => c.addAll([
      '/', '/favicon.ico', '/circle-pack.html', '/tidy-tree.html', '/cluster-tree.html'
    ]))
  )
);

self.addEventListener('fetch', e => e.respondWith(
  fetch(e.request).then(r => {
    caches.open('offline').then(c => {
      try {
        return c.put(e.request, r.clone())
      } catch(err){}
    });
    return r;
  }).catch(() =>
    caches.match(e.request).then(r => r || Response.error())
  )
));