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
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/main.js',
    '/data/restaurants.json',
    '/js/restaurant_info.js',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg',
    'restaurant.html?id=1', 'restaurant.html?id=2', 'restaurant.html?id=3', 'restaurant.html?id=4', 'restaurant.html?id=5', 'restaurant.html?id=6', 'restaurant.html?id=7', 'restaurant.html?id=8', 'restaurant.html?id=9', 'restaurant.html?id=10'
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

//  if(url.startsWith('localhost:') && (url.includes('tiles.mapbox.com') || url.includes('api.mapbox.com'))) {
//     event.respondWith(
//       caches.match(event.request).then(function(resp) {
//         return resp || fetch(event.request).then(function(response) {
//           var cacheResponse = response.clone();
//           caches.open('mapbox').then(function(cache) {
//             cache.put(event.request, cacheResponse);
//           });
//           return response;
//         });
//       })
//     );
//   }