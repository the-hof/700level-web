var levelApp = angular.module('levelApp', [
  'ngRoute',
  'levelControllers'
]);

levelApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/forum/:forumName', {
        templateUrl: 'partials/forum-detail.html',
        controller: 'forumDetailCtrl'
      }).
      when('/', {
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);