var levelApp = angular.module('levelApp', [
  'ngRoute',
  'levelControllers',
  'levelDirectives'
]);

levelApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {


    $routeProvider
      .when('/fansview/:forumName/thread/create', {
        templateUrl: 'partials/thread-create.html',
        controller: 'threadCreateCtrl'
      })
      .when('/fansview/:forumName/thread/:threadId/reply', {
        templateUrl: 'partials/thread-reply.html',
        controller: 'threadReplyCtrl'
      })
      .when('/fansview/:forumName/thread/:threadId/:threadPage?', {
        templateUrl: 'partials/thread-detail.html',
        controller: 'threadDetailCtrl'
      })
      .when('/fansview/:forumName/:forumPage?', {
        templateUrl: 'partials/forum-detail.html',
        controller: 'forumDetailCtrl'
      })
      .when('/fansview', {
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