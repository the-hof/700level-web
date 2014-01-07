var levelControllers = angular.module('levelControllers', ['ngSanitize']);

levelControllers.controller('homeCtrl', ['$scope', '$http',
  function ($scope, $http) {
    var api_url = 'http://beta.700level.com/v1/forum/most_recent?callback=JSON_CALLBACK';

    $http.jsonp(api_url).success(function(data) {
      $scope.mostRecentPostList = data;
    });
  }]);

levelControllers.controller('forumDetailCtrl', ['$scope', '$routeParams', '$http', '$location',
  function($scope, $routeParams, $http, $location) {
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    //check for paging
    if ($routeParams.forumPage) {

      if ($routeParams.forumPage === 'max') {
        $scope.pageNum = '1';
      }
      else {
        $scope.pageNum = parseInt($routeParams.forumPage,10);
      }
    }

    getForumPage($scope.forumCode, $scope.pageSize, $scope.pageNum, function(data) {
      $scope.threadList = data;
      $scope.resultCount = data.length;

      $scope.numPages = Math.ceil($scope.threadCount/$scope.pageSize);
      $scope.pageList = [];
      // if we only have 5 pages or less, show them all
      if ($scope.numPages <= 5) {
        for(var i=0; i<$scope.numPages; i++) {
          $scope.pageList.push(i+1);
        }
      } else {
        // check for beginning of paging
        if ($scope.pageNum <=2) {
          for (var i=0; i<5; i++) {
            $scope.pageList.push(i+1);
          }
        }
        // check for end of paging
        else if ($scope.pageNum >= ($scope.numPages-2)) {
          for (var i=$scope.pageNum-3; i<$scope.numPages; i++) {
            $scope.pageList.push(i+1);
          }
        }
        // otherwise just do two before and two after
        else {
          for (var i=$scope.pageNum-3; i<$scope.pageNum+2; i++) {
            $scope.pageList.push(i+1);
          }
        }
      }


      // if we request the last page in the thread, set that now
      if ($routeParams.forumPage === 'max') {
        $scope.jumpToPage($scope.numPages);
      }
    })

    $scope.jumpToPage = function(pageNum) {
      var returnTarget = '/fansview/' + $scope.forumCode +'/' + pageNum;
      $location.path(returnTarget);
    }

    $scope.nextPage = function() {
      var targetPage = parseInt($scope.pageNum, 10) + 1;
      var returnTarget = '/fansview/' + $scope.forumCode +'/' + targetPage;
      $location.path(returnTarget);
    }

    $scope.prevPage = function() {
      var targetPage = parseInt($scope.pageNum, 10) - 1;
      var returnTarget = '/fansview/' + $scope.forumCode +'/' + targetPage;
      $location.path(returnTarget);
    }

    function getForumPage(forum, pageSize, pageNum, callback) {
      var api_url = 'http://beta.700level.com/v1/forum/?callback=JSON_CALLBACK';
      api_url += '&forum=' + forum;
      api_url += '&pageSize=' + pageSize;
      api_url += '&startPage=' + pageNum;

      $http.jsonp(api_url).success(function(data) {
        $scope.threadCount = data.threadCount;
        callback(data.docs);
      });
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

levelControllers.controller('threadDetailCtrl', ['$scope','$routeParams', '$http', '$location',
  function($scope, $routeParams, $http, $location) {
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    $scope.threadId = $routeParams.threadId;
    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    //check for paging
    if ($routeParams.threadPage) {

      if ($routeParams.threadPage === 'max') {
        $scope.pageNum = '1';
      }
      else {
        $scope.pageNum = parseInt($routeParams.threadPage,10);
      }
    }

    getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, function(data) {
      $scope.postList = data.docs;
      $scope.resultCount = data.docs.length;
      $scope.numPages = Math.ceil(data.postCount/$scope.pageSize);
      $scope.pageList = [];
      // if we only have 5 pages or less, show them all
      if ($scope.numPages <= 5) {
        for(var i=0; i<$scope.numPages; i++) {
          $scope.pageList.push(i+1);
        }
      } else {
        // check for beginning of paging
        if ($scope.pageNum <=2) {
          for (var i=0; i<5; i++) {
            $scope.pageList.push(i+1);
          }
        }
        // check for end of paging
        else if ($scope.pageNum >= ($scope.numPages-2)) {
          for (var i=$scope.pageNum-3; i<$scope.numPages; i++) {
            $scope.pageList.push(i+1);
          }
        }
        // otherwise just do two before and two after
        else {
          for (var i=$scope.pageNum-3; i<$scope.pageNum+2; i++) {
            $scope.pageList.push(i+1);
          }
        }
      }

      // if we request the last page in the thread, set that now
      if ($routeParams.threadPage === 'max') {
        $scope.jumpToPage($scope.numPages);
      }
    })

    $scope.jumpToPage = function(pageNum) {
      var returnTarget = '/fansview/' + $scope.forumCode +'/thread/' + $scope.threadId +'/' + pageNum;
      $location.path(returnTarget);
    }

    $scope.nextPage = function() {
      var targetPage = parseInt($scope.pageNum, 10) + 1;
      var returnTarget = '/fansview/' + $scope.forumCode +'/thread/' + $scope.threadId +'/' + targetPage;
      $location.path(returnTarget);
    }

    $scope.prevPage = function() {
      var targetPage = parseInt($scope.pageNum, 10) - 1;
      var returnTarget = '/fansview/' + $scope.forumCode +'/thread/' + $scope.threadId +'/' + targetPage;
      $location.path(returnTarget);
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
          var returnTarget = '/fansview/' + $scope.forumCode +'/thread/' + $scope.threadId + '/max';
          $location.path(returnTarget);
        })
    }

    $scope.jumpToPage = function(pageNum) {
      var returnTarget = '/fansview/' + $scope.forumCode +'/thread/' + $scope.threadId +'/' + pageNum;
      $location.path(returnTarget);
    }

    $scope.nextPage = function() {
      var returnTarget = '/fansview/' + $scope.forumCode +'/thread/' + $scope.threadId +'/' + ($scope.pageNum+1);
      $location.path(returnTarget);
    }

    $scope.prevPage = function() {
      var returnTarget = '/fansview/' + $scope.forumCode +'/thread/' + $scope.threadId +'/' + ($scope.pageNum-1);
      $location.path(returnTarget);
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