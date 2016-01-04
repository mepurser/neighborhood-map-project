"use strict";
var shopsDisplayed = ko.observableArray([]);
var markersDisplayed = ko.observableArray([]);
var infoDisplayed = ko.observableArray([]);

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
  self.yelpid = yelpid
}

// ********************
// *****VIEWMODEL*****
// ********************

function shopsViewModel() {
  var self = this;
  self.filterOnStr = ko.observable("");

  // hard-wired initial list of ice cream shops
  self.shopsAvailable = [
      new IceCreamShop('Fentons Creamery', '4226 Piedmont Ave', '', 'Oakland', 'California', '94611',
        {location:'37.8281384,-122.2501302', heading: '142', pitch: '-2.18525'},
        'fentons-creamery-oakland-2'),
      new IceCreamShop('Curbside Creamery', '482 49th St', '', 'Oakland', 'California', '94609',
        {location:'37.8358959,-122.2621143', heading: '37.96', pitch: ''},
        'curbside-creamery-oakland'),
      new IceCreamShop('Ben and Jerrys', '505 Embarcadero West', '', 'Oakland', 'California', '94607',
        {location:'37.7959185,-122.2780369', heading: '229.48', pitch: ''},
        'ben-and-jerrys-oakland'),
      new IceCreamShop('Sweet Booth', '388 9th St', '', 'Oakland', 'California', '94607',
        {location:'37.8003083,-122.2718405', heading: '26.85', pitch: ''},
        'the-sweet-booth-oakland'),
      new IceCreamShop('Smitten Ice Cream', '5800 College Ave', '', 'Oakland', 'California', '94618',
        {location:'37.846053,-122.2516726', heading: '327.45', pitch: ''},
        'smitten-ice-cream-oakland-3')
  ];


  self.filter = function() {

    // clear original shopsDisplayed array
    // these three arrays always have the same length,
    // so it's sufficient to loop only on shopsDisplayed.
    while(shopsDisplayed().length > 0) {
      shopsDisplayed().pop();
      markersDisplayed().pop();
      infoDisplayed().pop();
    }

    // simplify naming
    var filterStr = self.filterOnStr();
    var shops = self.shopsAvailable;

    // check whether filter term exists in each store name
    // if it does, the shop is added back to shopsDisplayed (which was
    // cleared out a few lines earlier in this function)
    var dispCount = -1;
    var shop = '';
    var pos = '';
    var searchStr = '';
    for (shop in shops) {

      // turn off all markers and infowindows
      if (markers().length > 0) {
        infoWindows()[shop].close(map, markers()[shop]);
        markers()[shop].setMap(null);
      }

      searchStr = shops[shop].shopName.toLowerCase();

      // check to see if filterStr is contained in list items (store names).
      // if true, then add store to shopsDisplayed, markersDisplayed, and infoDisplayed.
      // then make the markers visible (they were turned off above)
      pos = searchStr.search(filterStr.toLowerCase());
      if (pos > -1) {
        dispCount += 1;
        shopsDisplayed.push(shops[shop]);
        markersDisplayed.push(markers()[shop]);
        infoDisplayed.push(infoWindows()[shop]);
        if (markers().length > 0) {
          markersDisplayed()[dispCount].setMap(map);
        }
      }
    }
  };

  self.markerHighlight = function(shopClicked) {
    // runs 'filter' first to ensure '*Displayed' vars are defined
    self.filter();
    var shopClickedName = shopClicked.shopName;

    if (markersDisplayed()[0] !== undefined) {

    // loop through displayed shops and animate and show infoWindow
    // for the one whose button was clicked
      var shop = '';
      var currShop = '';
      var dispMarker = {};
      var dispInfo = {};
      for (shop in shopsDisplayed()) {

        currShop = shopsDisplayed()[shop];

        if (currShop.shopName === shopClickedName) {

          dispMarker = markersDisplayed()[shop];
          dispInfo = infoDisplayed()[shop];

          dispMarker.setAnimation(google.maps.Animation.BOUNCE);
          dispInfo.open(map, dispMarker);

          setTimeout(function() {
            dispMarker.setAnimation(null);
          }, 1400);

        } else {
          // close any other info boxes that are open to avoid clutter
          infoDisplayed()[shop].close(map, markers()[shop]);

        }

      }
    }
  };

}

ko.applyBindings(new shopsViewModel);

$('#mapDiv').append(googleMap);