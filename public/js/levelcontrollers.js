var levelControllers = angular.module('levelControllers', ['ngSanitize']);

levelControllers.controller('homeCtrl', ['$scope', '$http',
  function ($scope, $http) {
    var api_url = 'http://beta.700level.com/v1/forum/most_recent?callback=JSON_CALLBACK';

    $http.jsonp(api_url).success(function(data) {
      $scope.mostRecentPostList = data;
    });
  }]);

levelControllers.controller('forumDetailCtrl', ['$scope', '$routeParams', '$http',
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
      var api_url = 'http://beta.700level.com/v1/forum/?callback=JSON_CALLBACK';
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

levelControllers.controller('threadDetailCtrl', ['$scope','$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    $scope.threadId = $routeParams.threadId;
    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
      $scope.postList = data.docs;
      $scope.resultCount = data.docs.length;
      $scope.numPages = Math.ceil(data.postCount/$scope.pageSize);
      $scope.pageList = [];
      for(var i=0; i<$scope.numPages; i++) {
        $scope.pageList.push(i+1);
      }
    })

    $scope.jumpToPage = function(pageNum) {
      $scope.pageNum = pageNum;
      getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
        $scope.postList = data.docs;
        $scope.resultCount = data.docs.length;
      })
    }

    $scope.nextPage = function() {
      $scope.pageNum++;
      getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
        $scope.postList = data.docs;
        $scope.resultCount = data.docs.length;
      })
    }

    $scope.prevPage = function() {
      $scope.pageNum--;
      getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
        $scope.postList = data.docs;
        $scope.resultCount = data.docs.length;
      })
    }

    function getThreadPage(forum, threadId, pageSize, pageNum, callback) {
      var api_url = 'http://beta.700level.com/v1/forum/thread?callback=JSON_CALLBACK';
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

levelControllers.controller('threadReplyCtrl', ['$scope','$routeParams', '$http', '$location',
  function($scope, $routeParams, $http, $location) {
    $scope.threadId = $routeParams.threadId;
    $scope.forumCode = $routeParams.forumName;

    getThreadPage($scope.forumCode, $scope.threadId, 1, 1, function(data) {

    })

    $scope.cancel = function() {
      var returnTarget = '/forum/' + $scope.forumCode +'/' + $scope.threadId;
      $location.path(returnTarget);
    };

    $scope.talkback = function() {
      var api_url = 'http://beta.700level.com/v1/forum/thread?callback=JSON_CALLBACK';
      api_url += '&forum=' + $scope.forumCode;
      api_url += '&threadId=' + $scope.threadId;

      var postBody = {
        post: $scope.post,
        inputURL: $scope.inputURL,
        thread: $scope.threadName
      }

      $http
        .post(api_url, postBody)
        .success(function(data) {

        })
    }

    function getThreadPage(forum, threadId, pageSize, pageNum, callback) {
      var api_url = 'http://beta.700level.com/v1/forum/thread?callback=JSON_CALLBACK';
      api_url += '&forum=' + forum;
      api_url += '&threadId=' + threadId;
      api_url += '&pageSize=' + pageSize;
      api_url += '&startPage=' + pageNum;

      $http.jsonp(api_url).success(function(data) {
        $scope.threadName = data.docs[0].thread;
        return callback(data);
      });
    }
  }]);