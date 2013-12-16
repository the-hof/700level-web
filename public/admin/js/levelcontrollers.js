var lvlControllers = angular.module('lvlControllers', []);

lvlControllers.controller('forumListCtrl', ['$scope',
  function ($scope) {

  }]);

lvlControllers.controller('forumDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    var api_url = 'http://beta.700level.com/v1/forum/?callback=JSON_CALLBACK';
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    api_url += '&forum=' + $routeParams.forumName;
    api_url += '&pageSize=' + $scope.pageSize;
    api_url += '&startPage=' + $scope.pageNum;

    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    $http.jsonp(api_url).success(function(data) {
      $scope.threadList = data;
      $scope.resultCount = data.length;
    });

    function TranslateForumName(short_name) {
      var ret = '';
      switch (short_name) {
        case 'nosebleeds': ret = 'Nosebleeds'; break;
        case 'concourse': ret = 'Concourse'; break;
        case 'parkinglot': ret = 'Parking Lot'; break;
      }
      return ret;
    }

  }]);

lvlControllers.controller('threadDetailCtrl', ['$scope','$routeParams', '$http',
  function($scope, $routeParams, $http) {
    var api_url = 'http://beta.700level.com/v1/forum/thread?callback=JSON_CALLBACK';
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    api_url += '&forum=' + $routeParams.forumName;
    api_url += '&thread=' + $routeParams.threadName;
    api_url += '&pageSize=' + $scope.pageSize;
    api_url += '&startPage=' + $scope.pageNum;

    $scope.threadName = $routeParams.threadName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    $http.jsonp(api_url).success(function(data) {
      $scope.postList = data;
      $scope.resultCount = data.length;
    });

    function TranslateForumName(short_name) {
      var ret = '';
      switch (short_name) {
        case 'nosebleeds': ret = 'Nosebleeds'; break;
        case 'concourse': ret = 'Concourse'; break;
        case 'parkinglot': ret = 'Parking Lot'; break;
      }
      return ret;
    }
}]);