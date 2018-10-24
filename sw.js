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
    'app/js/idb.js',
    'app/data/restaurants.json',
    'app/js/restaurant_info.js',
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


// self.addEventListener('fetch', function(event) {
//   console.log(event.request.url);
 
//   event.respondWith(
//     caches.match(event.request).then(function(response) {
//       return response || fetch(event.request).then(fetchResponse => {
//         return caches.open(CACHE_NAME).then(cache => {
//           //filter out browser-sync resources to prevent error
//           if (!fetchResponse.url.includes('broser-sync')) {
//             cache.put(event.request, fetchResponse.clone());
//           } 
//             return fetchResponse;
//         });
//       });
//     }).catch(error => new Response(error));
//   );
//  });


//  handler to test if the request is for port1337 and to check if it directs to the right function
 self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (requestUrl.port === '1337') {
    event.respondWith(dbResponse(request));
  }
  else {
    event.respondWith(cacheResponse(request));
  }
});

function cacheResponse(request) {
  // match request...
  return caches.match(request)
    .then(response => {
    // return matched response OR if no match then
    // fetch, open cache, cache.put response.clone, return response
      return 
        response || 
        fetch(request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // filter out browser-sync resources otherwise it will err
            if (!fetchResponse.url.includes('browser-sync')) { // prevent err
              cache.put(request, fetchResponse.clone()); // put clone in cache
            }
            return fetchResponse; // send original back to browser
          });
      });
  }).catch(error => new Response(error));
}


//create cache function
// function cacheResponse(request) {
  // match request...
  // return caches.match(request)
    // .then(response => {
    // return matched response OR if no match then
    // fetch, open cache, cache.put response.clone, return response
//       return 
//         response || 
//         fetch(request).then(fetchResponse => {
//           return caches.open(CACHE_NAME).then(cache => {
//             // filter out browser-sync resources otherwise it will err
//             if (!fetchResponse.url.includes('browser-sync')) { // prevent err
//               cache.put(request, fetchResponse.clone()); // put clone in cache
//             }
//             return fetchResponse; // send original back to browser
//           });
//       });
//   }).catch(error => new Response(error));
// }
