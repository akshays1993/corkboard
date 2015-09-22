// Ionic App
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'uiGmapgoogle-maps'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
	
  // Establishes states of the 'starter' app
  $stateProvider
    .state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html'
    })
	.state('app.login', {
		url: '/login',
		views: {
		'menuContent': {
			templateUrl: 'templates/login.html',
			controller: 'LoginCtrl'
		}
		}
	})
    .state('app.mymap', {
      url: '/mymap',
      views: {
        'menuContent': {
          templateUrl: 'templates/mymap.html',
          controller: 'MyMapCtrl'
        }
      }
    })
	.state('app.newpic', {
		url: '/newpic',
		views: {
		'menuContent': {
			templateUrl: 'templates/newpic.html',
			controller: 'NewPicCtrl'
		}
		}
	})
	
	// Sends to login state by default
	$urlRouterProvider.otherwise('/app/login');
});
