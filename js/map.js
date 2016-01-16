'use strict';
// this file was adapted from udacity's front-end web developer nanodegree resume project

var googleMap = '<div id="map"></div>';
var map;
var infoWindow;

// called when a marker is clicked
// first animate marker (bounce)
// then getMarkerContent().
// the getMarkerContent func then pings yelp api.
// on success, openInfoWindow() is called back, which calls getInfoWindowContent().
// this returns infoWindow contentString based on yelp api results.
// after returning contentString, the infoWindow is finally opened by openInfoWindow()

function markerClick(placeData, marker, infoWindow) {

  function getInfoWindowContent(data) {

    var contentString = '';
    
    if (typeof data === 'object') { 
      contentString +='<div><b>' + data.name + '</b></div>';
      contentString +='<div><img src="' + data.rating_img_url_small + '"></div>';
      contentString +='<div><img src="' +data.image_url + '"></div>';
    } else {
      contentString +='<div><p>' + data + '</p>';
    }

    return contentString;
  }

  function openInfoWindow(data) {
    var contentString = getInfoWindowContent(data);

    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);
  }

  function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
  }
  
  function getMarkerContent(placeData) {

    var yelp_url = 'https://api.yelp.com/v2/business/';
    var yelp_id = placeData.yelpid;
    var yelp_fullurl = yelp_url + yelp_id;
    var yelp_consumer_key = 'DwYObI6fJhbNJc0I3qG0oQ';
    var yelp_consumer_secret = 'u0C3aVbDQYIDM8KmR-48GqCoNHI';
    var yelp_token = 'vJLaGEB28oWv8nzwZQEdnH-xQMMu7tWA';
    var yelp_token_secret = 'STMQB5P6qd_C76TvLGHNd-6y58U';
    var sig_method = 'HMAC-SHA1';
    var error_msg = 'Unable to display Yelp data';

    var parameters = {
      oauth_consumer_key: yelp_consumer_key,
      oauth_token: yelp_token,
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: sig_method,
      callback: 'cb'
    };
      
    var consumer_secret = yelp_consumer_secret;
    var token_secret = yelp_token_secret;
          
    var encodedSignature = oauthSignature.generate('GET',yelp_fullurl, parameters, consumer_secret, token_secret);
    parameters.oauth_signature = encodedSignature;

    var markerError = setTimeout(function(){
      console.log('yelp api failed');
      openInfoWindow(error_msg);
    }, 4000);

    var settings = {
      url: yelp_fullurl,
      data: parameters,
      cache: true,
      dataType: 'jsonp',
      success: function(data) {
        console.log('yelp api success');
        openInfoWindow.call(this, data);
        clearTimeout(markerError);
      }
    };

    $.ajax(settings);
  }
    
  function markerAnimate(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1400);
  }
  
  markerAnimate(marker);
  getMarkerContent(placeData);

}

// creates initial set of map markers on load
function createMapMarker(placeData, infoWindow) {          

  var myLat = placeData.streetView.location.lat;  // latitude from the place service
  var myLng = placeData.streetView.location.lng;  // longitude from the place service
  var bounds = window.mapBounds;            // current boundaries of the map window
  var LatLng = {lat : myLat, lng: myLng};

  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: map,
    position: LatLng,
    title: placeData.shopName
  });

  placeData.marker = {markerInfo: marker};

  google.maps.event.addListener(marker, 'click', function() {
    markerClick(placeData, marker, infoWindow);
  });

  bounds.extend(new google.maps.LatLng(myLat, myLng));
  map.fitBounds(bounds);
  map.setCenter(bounds.getCenter());
}

// initializes map on load and calls createMapMarker() to add markers
// based on shopsDisplayed() observablearray
function initializeMap() {
  var shops = shopsDisplayed();

  var mapOptions = {
    disableDefaultUI: true
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  window.mapBounds = new google.maps.LatLngBounds();

  // only one infoWindow exists. the associated marker and content
  // is updated when different markers are selected. this prevents
  // multiple infoWindows from appearing or having to loop thru and
  // close other infoWindows in order to display a new one
  infoWindow = new google.maps.InfoWindow({});
  
  shops.forEach(function(shop) {
    createMapMarker(shop, infoWindow);
  });

  // once the map is initialized, mapSet is 'true' and functions
  // on the map are enabled
  mapSet = true;

}

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function(e) {
  //Make sure the map bounds get updated on page resize
map.fitBounds(mapBounds);
});
