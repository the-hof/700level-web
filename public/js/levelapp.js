var levelApp = angular.module('levelApp', [
  'ngRoute',
  'levelControllers'
]);

levelApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);