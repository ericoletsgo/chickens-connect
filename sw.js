self.addEventListener('install', e => console.log('SW installing'));
self.addEventListener('activate', e => console.log('SW activated'));
self.addEventListener('fetch', e => {
  // passthrough
  e.respondWith(fetch(e.request));
});