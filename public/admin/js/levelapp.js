var lvlApp = angular.module('lvlApp', [
  'ngRoute',
  'lvlControllers'
]);

lvlApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/forum', {
         templateUrl: 'partials/forum-list.html',
        controller: 'forumListCtrl'
      }).
      when('/forum/:forumName', {
        templateUrl: 'partials/forum-detail.html',
        controller: 'forumDetailCtrl'
      }).
      otherwise({
        redirectTo: '/forum'
      });
  }]);