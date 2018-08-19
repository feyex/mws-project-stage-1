/*declare the cache name*/
const CACHE_NAME = "V1"

/**
 * The install event is fired when the registration succeeds.
 * After the install step, the browser tries to activate the service worker.
 * Generally, we cache static resources that allow the website to run offline
 */
this.addEventListener('install', async () => {
  const cache = await caches.open(CACHE_NAME);
  cache.addAll([
    '/',
    '/css/styles.css',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/main.js',
    '/data/restaurants.json',
    '/js/restaurant_info.js',
    '/img'
  ]).then(() => {
    console.log('WORKER: install completed');
  })
});

self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
 
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
 });