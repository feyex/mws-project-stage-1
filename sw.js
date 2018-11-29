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
    '/app/css/styles.css',
    '/app/js/main.js',
    'app/js/dbhelper.js',
    'app/js/indexdb.js',
    'app/data/restaurants.json',
    'app/js/restaurant_info.js',
    '/manifest.json',
    'app/src/offline1.gif',
    'app/img/1.jpg',
    'app/img/2.jpg',
    'app/img/3.jpg',
    'app/img/4.jpg',
    'app/img/5.jpg',
    'app/img/6.jpg',
    'app/img/7.jpg',
    'app/img/8.jpg',
    'app/img/9.jpg',
    'app/img/10.jpg',
    'app/img/favorite6.png',
    'restaurant.html?id=1', 'restaurant.html?id=2', 'restaurant.html?id=3', 'restaurant.html?id=4', 'restaurant.html?id=5', 'restaurant.html?id=6', 'restaurant.html?id=7', 'restaurant.html?id=8', 'restaurant.html?id=9', 'restaurant.html?id=10',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://leafletjs.com/reference-1.3.0.html#marker'

  ]).then(() => {
    console.log('WORKER: install completed');
  })
});


self.addEventListener("fetch", event => {
  let getUrl = new URL(event.request.url);

   if (getUrl.origin === location.origin) {
 
       if (getUrl.pathname === "/" || getUrl.pathname ===  "/index.html") {
           event.respondWith(caches.match("/"));
           if(getUrl.pathname.includes('.jpg')){
               event.respondWith(caches.match("src/offline1.gif"));
           }
       }
       else {  
           event.respondWith(caches.match(event.request));
       }
       return;
   }

   event.respondWith(
       caches.match(event.request).then(response => {
           if (response) {
               return response;
           } else {
               console.log(
                   event.request.url + " not found in cache fetching from network."
               );
               return fetch(event.request);
           }
       })
   );
});

// if (request.url.includes('reviews')) {
//     const qObj = JSON.parse(requestUrl.searchParams.get('q'));
//     const id = qObj._parent_id;
//     event.respondWith(idbReviewResponse(request, id));
// }else {
//     event.respondWith(idbRestaurantResponse(request));
// }







