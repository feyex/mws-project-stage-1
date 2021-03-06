let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'sk.eyJ1IjoiZmV5ZXgiLCJhIjoiY2pra3V6b2Q1NmE3dTNybWxtZTEyYzR5MCJ9.aG-gf94WwnkhBb_jWQ11gA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const favorite = document.getElementById('restaurant-fav');
  if (restaurant.is_favorite === 'true') {
    favorite.classList.add('active');
    favorite.setAttribute('aria-pressed', 'true');
    favorite.innerHTML = `Remove ${restaurant.name} as a favorite`;
    favorite.title = `Remove ${restaurant.name} as a favorite`;
  } else {
    favorite.setAttribute('aria-pressed', 'false');
    favorite.innerHTML = `Add ${restaurant.name} as a favorite`;
    favorite.title = `Add ${restaurant.name} as a favorite`;
  }
  favorite.addEventListener('click', (evt) => {
    evt.preventDefault();
    if (favorite.classList.contains('active')) {
      favorite.setAttribute('aria-pressed', 'false');
      favorite.innerHTML = `Add ${restaurant.name} as a favorite`;
      favorite.title = `Add ${restaurant.name} as a favorite`;
      DBHelper.unMarkFavorite(restaurant.id);
    } else {
      favorite.setAttribute('aria-pressed', 'true');
      favorite.innerHTML = `Remove ${restaurant.name} as a favorite`;
      favorite.title = `Remove ${restaurant.name} as a favorite`;
      DBHelper.markFavorite(restaurant.id);
    }
    favorite.classList.toggle('active');
  });


  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = "Image of the restaurant "+ restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchRestaurantReviewsById(restaurant.id, fillReviewsHTML);

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}



/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (error, reviews) => {
  self.restaurant.reviews = reviews;

  if (error) {
    console.log('Error retrieving reviews', error);
  }
  const header = document.getElementById('reviews-header');

  const container = document.getElementById('reviews-container');

  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  // const addReview = document.createElement('button');
  // addReview.classList.add('review-add-btn');
  // addReview.innerHTML = '+';
  // addReview.setAttribute('aria-label', 'add review');
  // addReview.title = 'Add Review';
  // addReview.addEventListener('click', toggleModal);
  // header.appendChild(addReview);


  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    const form = createReviewForm();
    container.appendChild(form);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });

  container.appendChild(ul);
  const form = createReviewForm();
  container.appendChild(form);

  setFormHandler();
}

/**
*create a review form for all restaurants
*/
createReviewForm = () => {
  const form = document.createElement('form');
  form.setAttribute('class', 'reviews-form');
  const h3 = document.createElement('h3'); 
  h3.innerHTML = "Add a review";

  form.appendChild(h3);

  const nameInput = createNameInput();
  const ratingInput = createRatingInput();
  const commentInput = createCommentInput();
  // create submit button
  const btn = document.createElement('button');
  btn.innerHTML = "SUBMIT";
  btn.setAttribute('type', 'submit');
  // add elements to form
  form.appendChild(nameInput);
  form.appendChild(ratingInput);
  form.appendChild(commentInput);
  form.appendChild(btn);

  return form;
}
/**
* create name input
*/
createNameInput = () => {
  const label = document.createElement('label');
  label.innerHTML = "Name: ";
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('class', 'name');
  const br = document.createElement('br');
  label.appendChild(br);
  label.appendChild(input);

  return label;
}
/**
* create rating input
*/
createRatingInput = () => {
  const label = document.createElement('label');
  label.innerHTML = "Rating: ";
  const input = document.createElement('input');
  input.setAttribute('type', 'number');
  input.setAttribute('min', '1');
  input.setAttribute('max', '5');
  input.setAttribute('class', 'rating');
  const br = document.createElement('br');
  label.appendChild(br);
  label.appendChild(input);

  return label;
}

/**
* create comment box
*/
createCommentInput = () => {
  const label = document.createElement('label');
  label.innerHTML = "Comment: ";
  const textarea = document.createElement('textarea');
  textarea.setAttribute('class', 'comment');
  const br = document.createElement('br');
  label.appendChild(br);
  label.appendChild(textarea);

  return label;
}



/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const createdAt = document.createElement('p');
  createdAt.classList.add('createdAt');
  const createdDate = new Date(review.createdAt).toLocaleDateString();
  createdAt.innerHTML = `Added:<strong>${createdDate}</strong>`;
  li.appendChild(createdAt);

  const updatedAt = document.createElement('p');
  const updatedDate = new Date(review.updatedAt).toLocaleDateString();
  updatedAt.innerHTML = `Updated:<strong>${updatedDate}</strong>`;
  updatedAt.classList.add('updatedAt');
  li.appendChild(updatedAt);

  const rating = document.createElement('p');
  rating.classList.add('rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.dataset.rating = review.rating;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.classList.add('comments');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * update reviews list
 */
updateReviewsHTML = review => {
  const ul = document.querySelector("reviews-list");

  ul.appendChild(createReviewHTML(review));
}

/**
 * show toast helper
 */
showToast = message => {
  // Get the snackbar DIV
  const x = document.querySelector(".toast");
  x.innerHTML = message;
  // Add the "show" class
  x.classList.add("show");
  // After 3 seconds, remove the show class from DIV
  setTimeout(() => x.classList.remove("show"), 3000);
};

/**
 * set form handler
 */
setFormHandler = () => {
  const form = document.querySelector('form');
  let name = form.querySelector('.name');
  let rating = form.querySelector('.rating');
  let comment = form.querySelector('.comment');
  
  form.addEventListener('submit', e => {
    e.preventDefault();

    if (name.value === "" || rating.value === "" || comment.value === "") {
      showToast("all fields are required");
      return;
    }
    
    // check if browser support service wroker and backgroud sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      if(navigator.onLine) {
        // user is online
        const review = {
          name: name.value,
          rating: rating.value,
          comments: comment.value,
          restaurant_id: self.restaurant.id
        };
        
        DBHelper.sendReviewData(review, (error, data) => {
          if(error) {
            console.log(error);
          }
          // udate reviews list
          updateReviewsHTML(data);
          showToast("Sucessfully added your review"); // show success message
        
          const unique = '_' + Math.random().toString(36).substr(2, 9);
          // add unique property to data response
          data.unique = unique;
          // save review in IDB 
          db.addSingleReview(data);
          // set input fields to empty
          name.value = ""; 
          rating.value = ""; 
          comment.value = "";
        })
      } else {// user is offline
        // set background sync
        navigator.serviceWorker.ready
          .then(sw => {
            const date = new Date().toISOString();
            const review = {
              id: date,
              name: name.value,
              rating: rating.value,
              comments: comment.value,
              restaurant_id: self.restaurant.id
            }; 

            // save defered review to IDB
            db.writeNewReviewToIDB(review)
              .then(() => {
                sw.sync.register("sync-new-reviews");
              })
              .then(() => {
                showToast("Review saved for background syncing");
                review.createdAt = date;
                updateReviewsHTML(review);
                // set input fields to empty
                name.value = "";
                rating.value = "";
                comment.value = "";
              })
              .catch(err => console.log(err));

            // save review to IDB - reviews
            const unique = '_' + Math.random().toString(36).substr(2, 9);
            // add unique property to rewiew
            review.unique = unique;
            // save review in IDB 
            db.addSingleReview(review);

          })
          .catch(error => console.log(error))
      }
      
    } else { // does not support backgroud syncing
      // check if user is online
      if (navigator.onLine) { // does not support backgroud syncing but user is online
        const review = {
          name: name.value,
          rating: rating.value,
          comments: comment.value,
          restaurant_id: self.restaurant.id
        };
        // save review and update reviews list
        DBHelper.sendReviewData(review, (error, data) => {
          if (error) {
            console.log(error);
          }
          // udate reviews list
          updateReviewsHTML(data);
          showToast("Sucessfully added your review"); // show success message

          const unique = '_' + Math.random().toString(36).substr(2, 9);
          // add unique property to data response
          data.unique = unique;
          // save review in IDB 
          db.addSingleReview(data);
          // set input fields to empty
          name.value = "";
          rating.value = "";
          comment.value = "";
        })
      } else {
        // does not support backgroud syncing and user is offline
        showToast("Sorry you cannot add review offline");
      }
      
    }

  })
}



/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

