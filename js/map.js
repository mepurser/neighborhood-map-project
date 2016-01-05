'use strict';
// this file was adapted from udacity's front-end web developer nanodegree resume project

// store these global variables to be called outside this file
var googleMap = '<div id="map"></div>';
var map;
var markers = ko.observableArray([]);
var infoWindows = ko.observableArray([]);

function initializeMap() {

  var locations;
  var mapOptions = {
    disableDefaultUI: true
  };

  /*
  For the map to be displayed, the googleMap var must be
  appended to #mapDiv in neighborhood.js.
  */
  map = new google.maps.Map(document.querySelector('#map'), mapOptions);

  /*
  locationFinder() returns an array of every location string from the JSONs
  */
  function locationFinder() {
    // initializes an empty array
    var locations = [];

    // adds the single location property to the locations array
    var shops = shopsDisplayed();
    var shop;
    var locDetails;
    var formatted_address;
    for (shop in shops) {
      formatted_address = "";
      formatted_address =
        shops[shop].shopName + ", " +
        shops[shop].address1 + " " +
        shops[shop].address2 + ", " +
        shops[shop].city + ", " +
        shops[shop].state + " " +
        shops[shop].zip;
      locDetails = [
        formatted_address,
        shops[shop].shopName,
        shops[shop].streetView,
        shops[shop].yelpid
      ];
      locations.push(locDetails);
    }

    return locations;
  }

  /*
  createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  */
  function createMapMarker(placeData) {

    function addMarkerContent(data) {          
      var self = this;
      self.lat = placeData.geometry.location.lat();  // latitude from the place service
      self.lon = placeData.geometry.location.lng();  // longitude from the place service
      self.name = placeData.formatted_address;   // name of the place from the place service
      self.bounds = window.mapBounds;            // current boundaries of the map window
      self.shortName = data.name;

      self.contentstring;
      self.contentstring ='<div><b>' + self.shortName + '</b></div>';
      self.contentstring +='<div><img src="' + data.rating_img_url_small + '"></div>';
      self.contentstring +='<div><img src="' +data.image_url + '"></div>';

      // marker is an object with additional data about the pin for a single location
      self.marker = new google.maps.Marker({
        map: map,
        position: placeData.geometry.location,
        title: self.name
      });

      markers.push({shortName : self.shortName, markerInfo: self.marker});

      self.infoWindow = new google.maps.InfoWindow({
        content: self.contentstring
      });

      google.maps.event.addListener(self.marker, 'click', function() {

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          self.marker.setAnimation(null);
        }, 1400);
        var marker_close;
        for (marker_close in markers()) {
          infoWindows()[marker_close].infoWindowData.close(map, markers()[marker_close]);
        }

        self.infoWindow.open(map, self.marker);
      });

      infoWindows.push({shortName : self.shortName, infoWindowData: self.infoWindow});
      // this is where the pin actually gets added to the map.
      // bounds.extend() takes in a map location object
      self.bounds.extend(new google.maps.LatLng(self.lat, self.lon));
      // fit the map to the new marker
      map.fitBounds(self.bounds);
      // center the map
      map.setCenter(self.bounds.getCenter());
    }

    // function generate nonce
    var nonce_gen = function(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    var nonce = nonce_gen(20);
    
    var yelp_url = 'https://api.yelp.com/v2/business/';
    var yelp_id = locYelpid;
    var yelp_fullurl = yelp_url + yelp_id;
    var yelp_consumer_key = 'DwYObI6fJhbNJc0I3qG0oQ';
    var yelp_consumer_secret = 'u0C3aVbDQYIDM8KmR-48GqCoNHI';
    var yelp_token = 'vJLaGEB28oWv8nzwZQEdnH-xQMMu7tWA';
    var yelp_token_secret = 'STMQB5P6qd_C76TvLGHNd-6y58U';
    var timestamp = Date.now();
    var sig_method = 'HMAC-SHA1';
    var yelp_version = "1.0"

    var oauth = OAuth({
      consumer: {
          public: yelp_consumer_key,
          secret: yelp_consumer_secret
      },
      signature_method: sig_method
    });

    var request_data = {
      url: yelp_fullurl,
      method: 'GET',
    };
    
    var token = {
      public: yelp_token,
      secret: yelp_token_secret
    };
    $.ajax({
      url: request_data.url,
      type: request_data.method,
      dataType: "json",
      data: oauth.authorize(request_data, token),
      error: function(xhr, ajaxOptions){console.log(xhr, ajaxOptions);},
      success: function(response){
        addMarkerContent.call(this, response);
      }
    });
      
  }

  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      locName = locations[locIndex][1];
      locStreetView = locations[locIndex][2];
      locYelpid = locations[locIndex][3];
      createMapMarker(results[0]);
      locIndex += 1;
    }
  }

  /*
  pinPoster(locations) takes in the array of locations created by locationFinder()
  and fires off Google place searches for each location
  */

  var locName = "";
  var locStreetView = "";
  var locYelpid = "";

  function pinPoster(locations) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);

    // Iterates through the array of locations, creates a search object for each location
    var place;
    var request;
    for (place in locations) {
      // the search request object
      request = {
        query: locations[place][0],
        locName: locations[place][1],
        locStreetView: locations[place][2],
        locYelpid: locations[place][3]
      };
      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, callback);
    }
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // locations is an array of location strings returned from locationFinder()
  locations = locationFinder();
  var locIndex = 0;
  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(locations);

}

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function(e) {
  //Make sure the map bounds get updated on page resize
map.fitBounds(mapBounds);
});
