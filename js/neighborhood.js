shopsDisplayed = ko.observableArray([]);
markersDisplayed = ko.observableArray([]);
infoDisplayed = ko.observableArray([]);

// class to represent row in the available shops array
function IceCreamShop(shopName, address1, address2, city, state, zip, yelp) {
	var self = this;
	self.shopName = shopName;
	self.address1 = address1;
	self.address2 = address2;
	self.city = city;
	self.state = state;
	self.zip = zip;
	self.yelp = yelp;
}

function shopsViewModel() {
	var self = this;
	self.filterOnStr = ko.observable("");
	
	// hard-wired initial list of ice cream shops
	self.shopsAvailable = [
			new IceCreamShop('Fentons Creamery', '4226 Piedmont Ave', '', 'Oakland', 'California', '94611',
				'https://api.yelp.com/v2/business/fentons-creamery-oakland-2'),
			new IceCreamShop('Curbside Creamery', '482 49th St', '', 'Oakland', 'California', '94609',
				''),
			new IceCreamShop('Ben and Jerrys', '505 Embarcadero West', '', 'Oakland', 'California', '94607',
				''),
			new IceCreamShop('Sweet Booth', '388 9th St', '', 'Oakland', 'California', '94607',
				''),
			new IceCreamShop('Smitten Ice Cream', '5800 College Ave', '', 'Oakland', 'California', '94618',
				'')
	]


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
		filterStr = self.filterOnStr();
		shops = self.shopsAvailable;

		// check whether filter term exists in each store name
		// if it does, the shop is added back to shopsDisplayed (which was
		// cleared out a few lines earlier in this function)
		var dispCount = -1;
		for (var shop in shops) {
			
			// turn off all markers and infowindows
			if (markers().length > 0) {
				infoWindows()[shop].close(map, markers()[shop]);
				markers()[shop].setMap(null);
			}
			
			searchStr = shops[shop].shopName.toLowerCase();
			
			// check to see if filterStr is contained in list items (store names).
			// if true, then add store to shopsDisplayed, markersDisplayed, and infoDisplayed.
			// then make the markers visible (they were turned off above)
			var pos = searchStr.search(filterStr.toLowerCase())
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
	}

	self.markerHighlight = function(shopClicked) {

		var shopClickedName = shopClicked.shopName;

		// on initial load, there's a delay in populating 'markers' in the
		// 'filter' function above. two lines below check if markersDisplayed
		// and infoDisplayed are undefined after 'filter' function completes.
		// if so, they reset their values to the full set.
		if (markersDisplayed()[0] === undefined) {markersDisplayed = ko.observableArray(markers());}
		if (infoDisplayed()[0] === undefined) {infoDisplayed = ko.observableArray(infoWindows());}

		// loop through displayed shops and animate and show infoWindow
		// for the one whose button was clicked
		for (var shop in shopsDisplayed()) {

			var currShop = shopsDisplayed()[shop];

			if (currShop.shopName === shopClickedName) {
			
				var dispMarker = markersDisplayed()[shop];
				var dispInfo = infoDisplayed()[shop];
			
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

}

ko.applyBindings(new shopsViewModel);

$('#mapDiv').append(googleMap);