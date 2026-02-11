const CACHE_NAME = 'orientatrack-v1.3'; // CANVIA AIXÒ PER CADA ACTUALITZACIÓ
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './js/main.js',
    './js/core/GameLogic.js',
    './js/core/GeoEngine.js',
    './js/components/Menu.js',
    './js/components/Compass.js',
    './js/views/GameView.js',
    './js/views/SOSView.js',
    './js/views/RutesView.js',
    './js/views/ProfileView.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instal·lació: Guardem el core de l'app i forcem l'activació
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força al SW nou a activar-se sense esperar
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activació: Netegem les caches antigues per detectar canvis
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME && cache !== 'map-tiles') {
                        console.log('Netejant cache antiga:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Intercepció de peticions
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Estratègia específica per als mapes (ICGC): Cache-First
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
        // Estratègia per a la resta: Network-First o Cache-Match
        // Això ajuda a que si hi ha xarxa, agafi el main.js nou
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});