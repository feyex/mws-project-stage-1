

//create the indexeddb name to be accessible in user browser
const dbPromise = idb.open('restaurant-db', 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants');
  }
});

self.dbPromise = dbPromise;

// create object=>table in db
const KeyVal = {
  get(key) {
    return dbPromise.then(db => {
      return db
        .transaction('restaurants')
        .objectStore('restaurants')
        .get(key);
    });
  },
  set(key, val){
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      tx.objectStore('restaurants').put(val, key);
      return tx.complete;
    });
  }
};

function dbResponse(request) {
  return KeyVal.get('restaurants')
    .then(restaurants => {
      return (
        restaurants ||
        fetch(request)
          .then(response => response.json())
          .then(json => {
            KeyVal.set('restaurants', json);
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
