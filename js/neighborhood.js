'use strict';

var shopsDisplayed = ko.observableArray([]);
var mapSet = false; // set to true after 'initializeMap()' completes

// class to represent row in the available shops array
function IceCreamShop(shopName, address1, address2, city, state, zip, streetView, yelpid) {
  var self = this;
  self.shopName = shopName;
  self.address1 = address1;
  self.address2 = address2;
  self.city = city;
  self.state = state;
  self.zip = zip;
  self.streetView = streetView;
  self.yelpid = yelpid;
  self.yelpRatingUrl = '';
  self.yelpImg = '';
  self.marker = {markerInfo: ''};
}

// ********************
// *****VIEWMODEL******
// ********************

function shopsViewModel() {
  var self = this;
  self.filterOnStr = ko.observable("");

  // hard-wired initial list of ice cream shops
  self.shopsAvailable = [
      new IceCreamShop('Fentons Creamery', '4226 Piedmont Ave', '', 'Oakland', 'California', '94611',
        {location: {lat: 37.8281384, lng: -122.2501302}, heading: '142', pitch: '-2.18525'},
        'fentons-creamery-oakland-2'),
      new IceCreamShop('Curbside Creamery', '482 49th St', '', 'Oakland', 'California', '94609',
        {location: {lat: 37.8358959, lng: -122.2621143}, heading: '37.96', pitch: ''},
        'curbside-creamery-oakland'),
      new IceCreamShop('Ben and Jerrys', '505 Embarcadero West', '', 'Oakland', 'California', '94607',
        {location: {lat: 37.7959185, lng: -122.2780369}, heading: '229.48', pitch: ''},
        'ben-and-jerrys-oakland'),
      new IceCreamShop('Sweet Booth', '388 9th St', '', 'Oakland', 'California', '94607',
        {location: {lat: 37.8003083, lng: -122.2718405}, heading: '26.85', pitch: ''},
        'the-sweet-booth-oakland'),
      new IceCreamShop('Smitten Ice Cream', '5800 College Ave', '', 'Oakland', 'California', '94618',
        {location: {lat: 37.846053, lng: -122.2516726}, heading: '327.45', pitch: ''},
        'smitten-ice-cream-oakland-3')
  ];

  // filters list according to term in filter box
  self.filter = function() {

    var filterStr = self.filterOnStr();
    var shops = self.shopsAvailable;
    var dispCount = -1;
    var pos;
    var searchStr;
    var currMarker;

    // clear original shopsDisplayed array
    // repopulate below
    while(shopsDisplayed().length > 0) {
      shopsDisplayed().pop();
    }

    shops.forEach(function(shop) {

      currMarker = shop.marker.markerInfo;

      // clear all markers from map
      if (mapSet) {
        currMarker.setMap(null);
      }

      searchStr = shop.shopName.toLowerCase();

      pos = searchStr.search(filterStr.toLowerCase());

      if (pos > -1) {

        // repopulate shopsDisplayed according to filter
        dispCount += 1;
        shopsDisplayed.push(shop);

        // add markers back to map
        if (mapSet) {
          currMarker.setMap(map);
        }

      }
    });

    shopsDisplayed.sort(function(a,b) {
        return b.shopName > a.shopName ? -1 : 1;
    });

  };

  // when a shop is selected in the list, this function makes
  // the marker bounce and opens the infoWindow
  self.markerHighlight = function(shopClicked) {

    var shopClickedName = shopClicked.shopName;
    var shops = shopsDisplayed();
    var dispMarker = {};
    
    // filter first to make sure correct selection is displayed
    self.filter();

    // loop thru all shops displayed
    shops.forEach(function(shop) {
      if (shop.marker.markerInfo !== undefined) {

        // if the current shop in loop is the clicked shop
        // then call markerClick() as of the marker was clicked
        if (shop.shopName === shopClickedName) {
          markerClick(shop, shop.marker.markerInfo, infoWindow);
        }

      }
    });

  };

  self.collapseList = function() {
    $('.collapse').collapse('hide');
  };

}

ko.applyBindings(new shopsViewModel());

$('#mapDiv').append(googleMap);