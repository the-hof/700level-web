var levelApp = angular.module('levelApp', [
  'ngRoute',
  'levelControllers',
  'levelDirectives'
]);

levelApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {


    $routeProvider
      .when('/forum/:forumName/:threadId/reply', {
        templateUrl: 'partials/thread-reply.html',
        controller: 'threadReplyCtrl'
      })
      .when('/forum/:forumName/:threadId', {
        templateUrl: 'partials/thread-detail.html',
        controller: 'threadDetailCtrl'
      })
      .when('/forum/:forumName', {
        templateUrl: 'partials/forum-detail.html',
        controller: 'forumDetailCtrl'
      })
      .when('/forum', {
        templateUrl: 'partials/forum-list.html',
        controller: 'homeCtrl'
      })
      .when('/', {
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);