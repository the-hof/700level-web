var lvlControllers = angular.module('lvlControllers', ['ngSanitize']);

lvlControllers.controller('forumListCtrl', ['$scope',
  function ($scope) {

  }]);

lvlControllers.controller('forumDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    getForumPage($scope.forumCode, $scope.pageSize, $scope.pageNum, function(data) {
      $scope.threadList = data;
      $scope.resultCount = data.length;
    })

    $scope.nextPage = function() {
      $scope.pageNum++;
      getForumPage($scope.forumCode, $scope.pageSize, $scope.pageNum, function(data) {
        $scope.threadList = data;
        $scope.resultCount = data.length;
      })
    }

    $scope.prevPage = function() {
      $scope.pageNum--;
      getForumPage($scope.forumCode, $scope.pageSize, $scope.pageNum, function(data) {
        $scope.threadList = data;
        $scope.resultCount = data.length;
      })
    }

    function getForumPage(forum, pageSize, pageNum, callback) {
      var api_url = 'http://localhost:3000/v1/forum/?callback=JSON_CALLBACK';
      api_url += '&forum=' + forum;
      api_url += '&pageSize=' + pageSize;
      api_url += '&startPage=' + pageNum;

      $http.jsonp(api_url).success(callback);
    }

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
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    $scope.threadId = $routeParams.threadId;
    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
      $scope.postList = data;
      $scope.resultCount = data.length;
    })

    $scope.nextPage = function() {
      $scope.pageNum++;
      getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
        $scope.postList = data;
        $scope.resultCount = data.length;
      })
    }

    $scope.prevPage = function() {
      $scope.pageNum--;
      getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
        $scope.postList = data;
        $scope.resultCount = data.length;
      })
    }

    function getThreadPage(forum, threadId, pageSize, pageNum, callback) {
      var api_url = 'http://localhost:3000/v1/forum/thread?callback=JSON_CALLBACK';
      api_url += '&forum=' + forum;
      api_url += '&threadId=' + threadId;
      api_url += '&pageSize=' + pageSize;
      api_url += '&startPage=' + pageNum;

      $http.jsonp(api_url).success(callback);
    }

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