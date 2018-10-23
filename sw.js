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

// self.addEventListener('fetch', function(event) {
//   console.log(event.request.url);
 
//   event.respondWith(
//     caches.match(event.request).then(function(response) {
//       return response || fetch(event.request);
//     })
//   );
//  });

self.addEventListener('fetch', event => {
  event.respondWith(
    // Add cache.put to cache images on each fetch
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(staticCacheName).then(cache => {
          // filter out browser-sync resources otherwise it will err
          if (!fetchResponse.url.includes('browser-sync')) { // prevent err
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(error => new Response(error));
  );
});


//Setting up of a constant called dbPromise which is asssigned the results of idb.open operation.
 const dbPromise = idb.open('restaurant', 1, upgradeDB => {
   switch (upgradeDB.oldVersion) {
     case 0: 
      upgradeDB.createObjectStore('restaurants');
   }
 })

//  const dbPromise = idb.open('currency', 1, function (upgradeDb) {
//   let keyValStore = upgradeDb.createObjectStore('keyval', {
//     keyPath: 'id'
//   });
// });

//indexed db  object with get and set methods
const idbKeyVal = {
  get(key) {
    return dbPromise.then(db => {
      return db
        .transaction('restaurants')
        .objectStore('restaurants')
        .get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx =db.transaction('restaurants', 'readwrite');
      tx.objectStore('restaurants').put(val, key);
      return tx.complete;
    });
  }
};


self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (requestUrl.port === '1337') {
    event.respondWith(idbResponse(request));
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
          return caches.open(staticCacheName).then(cache => {
            // filter out browser-sync resources otherwise it will err
            if (!fetchResponse.url.includes('browser-sync')) { // prevent err
              cache.put(request, fetchResponse.clone()); // put clone in cache
            }
            return fetchResponse; // send original back to browser
          });
      });
  }).catch(error => new Response(error));
}


function idbResponse(request) {
  return idbKeyVal.get('restaurants')
    .then(restaurants => {
      return (
        restaurants ||
        fetch(request)
          .then(response => response.json())
          .then(json => {
            idbKeyVal.set('restaurants', json);
            return json;
          })
      );
    })
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => {
      return new Response(error, {
        status: 404,
        statusText: 'my bad request'
      });
    });
}
