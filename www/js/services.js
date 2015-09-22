angular.module('starter.services', [])

// Sets up Parse
.service('ParseService', function($q){
	
	// Initializes Parse
	var app_id = 'jAi8idzvPXkNMiGQMOhFr19tg23JT8CtGYbfiaPp';
	var js_id = '7GHfdj5OYcmmK3MPHZhvCETG4evI6PFw4cLCGGb8';
	Parse.initialize(app_id, js_id);
	
	// Checks current user
	this.getUser = function(){
		var defer = $q.defer();
		var currentUser = Parse.User.current();
		if(currentUser){
			defer.resolve(currentUser);
		} else {
			defer.reject('Error: No user is logged in');
		}
		return defer.promise;
	}
	
	// Logs in with Parse
	this.login = function(user, pass){
		var defer = $q.defer();
		Parse.User.logIn(user, pass, {
			success: function(){
				defer.resolve();
			},
			error: function(){
				defer.reject('Error: Login failed');
			}
		});
		return defer.promise;
	}
	
	//Queries Places
	function getPlaces(objId, location){
		var Place = Parse.Object.extend("Place");
		var query = new Parse.Query(Place);
		if(objId){
			query.equalTo('objectId', objId);
		} else if(location){
			query.equalTo('location', location);
		}
		return query.find().then(function(places){
			var placeData = [];
			_.each(places, function(place){
				placeData.push({'objId': place.id, 'location': place.get('location')});
			});
			return placeData;
		},
		function(){
			alert('Error: Places could not be found');
		});
	}
	
	//Queries Pics
	function getPics(placeId){
		var Pic = Parse.Object.extend("Pic");
		var query = new Parse.Query(Pic);
		if(placeId){
			var Place = Parse.Object.extend("Place");
			var innerQuery = new Parse.Query(Place);
			innerQuery.equalTo('objectId', placeId);
			query.matchesQuery('myPlace', innerQuery);
		}
		return query.find().then(function(pics){
			var picUrls = [];
			_.each(pics, function(pic){
				picUrls.push(pic.get("img").url());
			});
			return picUrls;
		},
		function(){
			alert('Error: Pics could not be found');
		});
	}
	
	// Determines if picture data must be refreshed
	this.refreshPics = true;
	
	// Gets all picture URLS and location data
	this.getAllPics = function(){
		return getPlaces().then(function(places){
			var allPicData = [];
			_.each(places, function(place){
				var objId = place.objId;
				var location = place.location;
				var picData = getPics(objId).then(function(pics){
					return {'location': location, 'picUrls': pics};
				});
				allPicData.push(picData);
			});
			return $q.all(allPicData);
		});
	}
	
	// Saves new picture and current location
	this.savePic = function(imgData, loc){
		var imgFile = new Parse.File("imgFile.png", {base64: imgData});
		imgFile.save().then(function(){
			var Pic = new Parse.Object("Pic");
			Pic.set("img", imgFile);
			Pic.setACL(new Parse.ACL(Parse.User.current()));
			var Place = new Parse.Object("Place");
			Place.set("location", loc);
			Place.setACL(new Parse.ACL(Parse.User.current()));
			Pic.set("myPlace", Place);
			return Pic.save();
		});
	}
})

// Sets up Google Maps
.service('MapService', function($q){
	
	// Sets up default map options
	this.getMap = {center: {latitude: 40, longitude: -40}, zoom: 2};
	
	// Recenters map
	this.recenter = function(pos){
		this.map.center.latitude = pos.coords.latitude;
		this.map.center.longitude = pos.coords.longitude;
	}
	
	// Sets up private geocoder
	function doGeocode(location){
		var defer = $q.defer();
		var geocoder = new google.maps.Geocoder;
		geocoder.geocode({'address': location}, function(gl,st){
			if(st == google.maps.GeocoderStatus.OK){
				defer.resolve(gl[0].geometry.location);
			} else {
				defer.reject('Error: Geocoder failed');
			}
		});
		return defer.promise;
	}
	
	// Sets up public geocoder
	this.pubDoGeocode = function(location){
		return doGeocode(location);
	}
	
	// Sets up private reverse-geocoder
	function revGeocode(pos){
		var defer = $q.defer();
		var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
		var geocoder = new google.maps.Geocoder;
		geocoder.geocode({'location': latLng}, function(posData, st){
			if(st == google.maps.GeocoderStatus.OK){
				defer.resolve(posData[1].formatted_address);
			} else {
				defer.reject('Error: Geocoder failed');
			}
		});
		return defer.promise;
	}
	
	// Sets up public reverse-geocoder
	this.pubRevGeocode = function(pos){
		return revGeocode(pos);
	}
	
	// Stores latest markers
	this.markers = [];
	
	// Sets up markers with picture URLs and location data
	this.setMarkers = function(emptyMarkers){
		var fullMarkers = [];
		_.each(emptyMarkers, function(marker){
			var id = fullMarkers.length;
			var location = marker.location;
			var picUrls = marker.picUrls;
			var newMarker = doGeocode(location).then(function(coords){
				return {'id': id,
						'location': location,
						'picUrls': picUrls,
						'latitude': coords.lat(),
						'longitude': coords.lng()}
			},
			function(err){
				alert(err);
			});
			fullMarkers.push(newMarker);
		});
		return $q.all(fullMarkers);
	}
})

// Sets up Geolocater
.service('Geolocater', function($q){
	this.getPosition = function(){
		var defer = $q.defer();
		navigator.geolocation.getCurrentPosition(defer.resolve(result), defer.reject(err));
		return defer.promise;
	}
})

// Sets up Camera
.service('Camera', function($q){
	this.getPicture = function(options){
		var defer = $q.defer();
		navigator.camera.getPicture(function(result){
			defer.resolve(result);
		}, function() {
			defer.reject('Error: Picture could not be taken');
		}, options);
		return defer.promise;
	}
})