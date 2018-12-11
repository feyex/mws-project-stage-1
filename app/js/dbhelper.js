/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337// Change this to your server port
    return `http://localhost:${port}/restaurants`;

  }

  static get DB_URL() {
    const port = 1337// Change this to your server port
    return `http://localhost:${port}/reviews`;

  }

  //TO ALLOW TOGGLING OPTIONS
  // http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
static markFavorite(id) {
  fetch(`${DBHelper.DATABASE_URL}/${id}/?is_favorite=true`, {
    method: 'PUT'
  });
}

// http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false
static unMarkFavorite(id) {
  fetch(`${DBHelper.DATABASE_URL}/${id}/?is_favorite=false`, {
    method: 'PUT'
  });
}

//To fetch all reviews by restaurant id
static fetchRestaurantReviewsById(id, callback) {
    fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(data => callback(null, data))
      .catch(err => callback(err, null));
  }

  // http://localhost:1337/reviews/
static createRestaurantReview(id, name, rating, comments, callback) {
  const data = {
    'restaurant_id': id,
    'name': name,
    'rating': rating,
    'comments': comments
  };
  fetch( 'http://localhost:1337/reviews/', {
    headers: { 'Content-Type': 'application/form-data' },
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => callback(null, data))
    .catch(err => callback(err, null));
}


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    const dbPromise = idb.open('restaurant-db', 3, function (upgradeDB) {
      
      // if (!upgradeDB.objectStoreNames.contains('restaurants')) {
      //   upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
      // }

      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurants',
            { keyPath: 'id', unique: true });
        case 1:
          const reviewStore = upgradeDB.createObjectStore('reviews',
            { autoIncrement: true });
          reviewStore.createIndex('restaurant_id', 'restaurant_id');
        case 0:
        upgradeDB.createObjectStore('offline',
          { keyPath: 'id', unique: true });

      }

});

function getDbData() {
  return dbPromise.then(db=>{
     const tx = db.transaction('restaurants')
       .objectStore('restaurants');
       return tx.getAll();
       });
}

function fulfillResult(){
  getDbData().then(restaurants =>{
    return callback(null, restaurants);
  });
}

 function  getAllIdx(store, idx, key) {
    return dbPromise.then(db => {
      return db
        .transaction(store)
        .objectStore(store)
        .index(idx)
        .getAll(key);
    });
  }
 
  function fulResult(){
    getDbData().then(reviews =>{
      return callback(null, reviews);
    });
  }

  //idb for offline data storaage
  function  setReturnId(store, val) {
  return dbPromise.then(db => {
    const tx = db.transaction(store, 'readwrite');
    const pk = tx
      .objectStore(store)
      .put(val);
    tx.complete;
    return pk;
  });
}


 // fetch a restaurant by ID
 const fetchById = id => {
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants');
      const restaurantStore = tx.objectStore('restaurants');

      return restaurantStore.get(parseInt(id));
    })
    .then(restaurant => restaurant)
    .catch(error => console.log('Unable to fetch restaurant', error))
  };
  // save added reviews
 const writeNewReviewToIDB = (data) => {
    return dbPromise
      .then(db => {
        const tx = db.transaction("offline", 'readwrite');
        const store = tx.objectStore("offline");
        store.put(data);
        return tx.complete;
      });return writeNewReviewToIDB;
  }
  // read all added reviews
 const readeAllNewReviews = () => {
    return dbPromise
      .then(db => {
        const tx = db.transaction("offline", "readonly");
        const store = tx.objectStore("offline");

        return store.getAll();
      }); return readeAllNewReviews;
  }
  // delete added reviews
 const deleteNewReview = id => {
    return dbPromise
      .then(db => {
        const tx = db.transaction("offline", "readwrite");
        const store = tx.objectStore("offline");
        store.delete(id);
        return tx.complete;
      })
      .then(() => console.log('defered review deleted'));
  }

 



fetch(DBHelper.DATABASE_URL)
  .then(function (response) {
    const restaurants = response.json();
    return restaurants;
  }).then(restaurants => {
    dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      const restaurantStore = tx.objectStore('restaurants');
      for (const restaurant of restaurants) {
        restaurantStore.put(restaurant);
      }
      return tx.complete;
    }).then(()=>{
      console.log('restaurants added');
    });
    return restaurants;
  }).then(function (restaurants) {
return callback(null, restaurants);
  }).catch(() => {
     return fulfillResult();
  });


  fetch(DBHelper.DB_URL)
  .then(function (response) {
    const reviews = response.json();
    return reviews;
  }).then(reviews => {
    dbPromise.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      const reviewstore = tx.objectStore('reviews');
      for (const restaurant of reviews) {
        reviewstore.put(restaurant);
      }
      return tx.complete;
    }).then(()=>{
      console.log('reviews added');
    });
    return reviews;
  })
//   .then(function (reviews) {
// return callback(null, reviews);
//   }).catch(() => {
//      return fulResult();
//   });

}



    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json.restaurants;
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();
  

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }
  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/app/img/${restaurant.id}.jpg`);
  }

  // static fetchReviewsById(id, callback) {
  //   db.getReviewByRestaurantId(id)

  //     .then(reviews => {
  //       if (reviews.length > 0) {
  //         // got reviews from IDB
  //         console.log("got reviews from IDB");
  //         callback(null, reviews);
  //       } else {
  //         // no reviews in IDB
  //         const url = `http://localhost:1337/reviews/?restaurant_id=${id}`;
  //         // get  reviews online to render and save them to IDB
  //         fetch(url)
  //           .then(res => res.json())
  //           .then(reviews => {
  //             reviews = reviews.map(review => {
  //               const unique =
  //                 "_" +
  //                 Math.random()
  //                   .toString(36)
  //                   .substr(2, 9);
  //               return {
  //                 id: review.id,
  //                 restaurant_id: review.restaurant_id,
  //                 unique: unique,
  //                 name: review.name,
  //                 rating: review.rating,
  //                 comments: review.comments,
  //                 createdAt: review.createdAt,
  //                 updatedAt: review.updatedAt
  //               };
  //             });
  //             db.addReviewByRestaurantId(reviews);
  //             callback(null, reviews);
  //           })
  //           .catch(error => callback(error, null));
  //       }
  //     })
  //     .catch(error => callback(error, null));
  // }


  /**
   * save review data to the database
   */
  static sendReviewData(review, callback) {
    // we are online or lie-fi
    const url = "http://localhost:1337/reviews/";

    fetch(url, {
      method: "POST",
      header: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(review)
    })
      .then(res => res.json())
      .then(review => callback(null, review))
      .catch(error => {
        // network failure
        callback(error, null);
      });
  }


  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}


