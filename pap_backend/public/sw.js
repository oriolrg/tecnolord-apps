const CACHE_NAME = 'pap-sant-llorenc-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './icon-512.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instal·lació i cache d'estàtics
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Gestió de peticions
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // SI LA PETICIÓ ÉS PER A L'ESTAT (API), ANEM SEMPRE A LA XARXA
  if (url.pathname.includes('/estat')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // PER A LA RESTA, PRIMER CACHE
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
