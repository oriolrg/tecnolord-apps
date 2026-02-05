const CACHE_NAME = 'orientatrack-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './js/main.js',
    './css/styles.css', // Si en tens un de separat
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js'
];

// Instal·lació: Guardem el core de l'app
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Intercepció de peticions (Estratègia: Cache First per als mapes)
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Si la petició és una imatge del mapa (ICGC)
    if (url.includes('geoserveis.icgc.cat')) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((fetchResponse) => {
                    return caches.open('map-tiles').then((cache) => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
        );
    } else {
        // Per a la resta, intentem xarxa i si falla, cache
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});