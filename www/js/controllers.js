angular.module('starter.controllers', ['starter.services'])

// Sets up Login Controller
.controller('LoginCtrl', function($ionicHistory, $scope, $state, ParseService) {
	
	// Disables back button upon redirect
	$ionicHistory.nextViewOptions({
		disableBack: true
	});
	
	// Redirects to My Map if user is logged in
 	ParseService.getUser().then(function(){
		$state.go('app.mymap');
	},
	function(err){
		alert(err);
	}); 
	
	// Logs in with Parse and redirects to My Map
	$scope.data = {};
	$scope.login = function(){
		ParseService.login($scope.data.username, $scope.data.password).then(function(){
			$state.go('app.mymap');
		},
		function(err){
			alert(err);
		});
	}
})

// Sets up My Map Controller
.controller('MyMapCtrl', function($scope, $ionicModal, $ionicSlideBoxDelegate, ParseService, MapService){
		
		// Sets up picture box modal and functions
		$ionicModal.fromTemplateUrl('templates/slider.html', {
			scope: $scope
		}).then(function(modal){
				$scope.modal = modal;
		},
		function(){
			alert('Error: Modal setup failed');
		});
		$scope.openModal = function(){
			$ionicSlideBoxDelegate.update();
			$ionicSlideBoxDelegate.slide(0);
			$scope.modal.show();
		};
		$scope.closeModal = function(){
			$scope.modal.hide();
		};
		$scope.$on('$destroy', function() {
			$scope.modal.remove();
		});
		
		// Sets up default map
		$scope.map = MapService.getMap();
		
		// Sets up empty markers
		$scope.markers = [];

		// Fills markers with picture URLs & location data and stores them
		if(ParseService.refreshPics == true){
			ParseService.getAllPics().then(function(allPicData){
				return MapService.setMarkers(allPicData);
			}).then(function(markers){
				_.each(markers, function(marker){
					marker.onClick = function(){
						$scope.picUrls = marker.picUrls;
						$scope.openModal();
					}
					$scope.markers.push(marker);
				});
				MapService.markers = markers;
				ParseService.refreshPics = false;
			});
		// Gets stored markers
		} else {
			_.each(MapService.markers, function(marker){
				marker.onClick = function(){
					$scope.picUrls = marker.picUrls;
					$scope.openModal();
				}
				$scope.markers.push(marker);
			});
		}
})

// Sets up New Pic Controller
.controller('NewPicCtrl', function($scope, $ionicPopup, Camera, ParseService, MapService, Geolocater){
	
	// Sets up camera and gets photo
	$scope.getPhoto = function(){
		Camera.getPicture({
			quality: 75,
			targetWidth: 320,
			targetHeight: 320,
			saveToPhotoAlbum: false
		}).then(function(imageURI){
			$scope.lastPhoto = imageURI;
		}, function(err){
			alert(err);
		});
	}
	// Saves new picture to Parse -- need to find workaround to canvas drawing
	$scope.savePhoto = function(){
		var c = document.getElementById("myCanvas");
		var ctx = c.getContext("2d");
		var img = document.getElementById("preview");
		c.width = img.width;
		c.height = img.height;
		ctx.drawImage(img,0,0);
		var imgData = c.toDataURL();
		Geolocater.getPosition().then(function(pos){
			return MapService.pubRevGeocode(pos);
		}).then(function(loc){
			return ParseService.savePic(imgData, loc);
		}).then(function(){
			MapService.recenter(pos);
			ParseService.refreshPics = true;
			$ionicPopup.alert({
				title: 'Done!'
			});
		});
	}
})
