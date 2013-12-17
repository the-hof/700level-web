var levelControllers = angular.module('levelControllers', ['ngSanitize']);

levelControllers.controller('homeCtrl', ['$scope', '$http',
  function ($scope, $http) {
    var api_url = 'http://beta.700level.com/v1/forum/most_recent?callback=JSON_CALLBACK';

    $http.jsonp(api_url).success(function(data) {
      $scope.mostRecentPostList = data;
    });
  }]);

