"use strict";
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
  written for bio, education, and work.
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
        shops[shop].streetView
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

    function addMarkerContent() {          
      var contentstring;

      // on error, the api call below simply appears blank in the infowindow,
      // so no additional handling is included
      contentstring = '<div><b>' + locName + '</b></div>';
      contentstring +='<img src="'+api_req_str+'"><br>';

      // marker is an object with additional data about the pin for a single location
      var marker = new google.maps.Marker({
        map: map,
        position: placeData.geometry.location,
        title: name
      });

      markers.push(marker);

      // infoWindows are the little helper windows that open when you click
      // or hover over a pin on a map. They usually contain more information
      // about a location.
      var infoWindow = new google.maps.InfoWindow({
        content: contentstring
      });


      google.maps.event.addListener(marker, 'click', function() {

        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          marker.setAnimation(null);
        }, 1400);
        var marker_close;
        for (marker_close in markers()) {
          infoWindows()[marker_close].close(map, markers()[marker_close]);
        }

        infoWindow.open(map, marker);
      });

      infoWindows.push(infoWindow);

      // this is where the pin actually gets added to the map.
      // bounds.extend() takes in a map location object
      bounds.extend(new google.maps.LatLng(lat, lon));
      // fit the map to the new marker
      map.fitBounds(bounds);
      // center the map
      map.setCenter(bounds.getCenter());
    }

    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    var url = 'https://maps.googleapis.com/maps/api/streetview';

    var size = '300x150';
    var key = 'AIzaSyCyqnlShlfX9Pc2m8o2RmlpeCEhyY1D0os';

    var api_req_str =
      url + '?' +
      'size=' + size + '&' +
      'location=' + locStreetView.location + '&' +
      'heading=' + locStreetView.heading + '&' +
      'pitch=' + locStreetView.pitch + '&' +
      'key=' + key;

    addMarkerContent(api_req_str);

  }

  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      locName = locations[locIndex][1];
      locStreetView = locations[locIndex][2];
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
        locStreetView: locations[place][2]
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

// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function(e) {
  //Make sure the map bounds get updated on page resize
map.fitBounds(mapBounds);
});
