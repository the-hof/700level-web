levelControllers.controller('threadDetailCtrl', ['$scope', '$routeParams', '$http', '$location',
  function ($scope, $routeParams, $http, $location) {
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    $scope.threadId = $routeParams.threadId;
    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    $scope.requestComplete = true;

    //check for paging
    if ($routeParams.threadPage) {

      if ($routeParams.threadPage === 'max') {
        $scope.pageNum = '1';
        $scope.requestComplete = false;
      }
      else {
        $scope.pageNum = parseInt($routeParams.threadPage, 10);
      }
    }

    getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.pageNum, getThreadPageCallback);



    $scope.jumpToPage = function (pageNum) {
      var returnTarget = '/fansview/' + $scope.forumCode + '/thread/' + $scope.threadId + '/' + pageNum;
      $location.path(returnTarget);
    }

    $scope.nextPage = function () {
      var targetPageNum = parseInt($scope.pageNum, 10) + 1;
      targetPageNum = (targetPageNum > $scope.numPages) ? $scope.numPages : targetPageNum;
      var returnTarget = '/fansview/' + $scope.forumCode + '/thread/' + $scope.threadId + '/' + targetPageNum;
      $location.path(returnTarget);
    }

    $scope.prevPage = function () {
      var targetPageNum = parseInt($scope.pageNum, 10) - 1;
      targetPageNum = (targetPageNum < 1) ? 1 : targetPageNum;
      var returnTarget = '/fansview/' + $scope.forumCode + '/thread/' + $scope.threadId + '/' + targetPageNum;
      $location.path(returnTarget);
    }

    function getThreadPageCallback(data) {
      $scope.postList = data.docs;
      $scope.resultCount = data.docs.length;
      $scope.numPages = Math.ceil(data.postCount / $scope.pageSize);
      $scope.pageList = [];

      //if we're looking for the last page, set the current page # to the last one
      if ($routeParams.threadPage === 'max') {
        if (!$scope.requestComplete) {
          $scope.pageNum = $scope.numPages;
          $scope.requestComplete = true;
          getThreadPage($scope.forumCode, $scope.threadId, $scope.pageSize, $scope.numPages, getThreadPageCallback);
        }
      }

      // if we only have 5 pages or less, show them all
      if ($scope.numPages <= 5) {
        for (var i = 0; i < $scope.numPages; i++) {
          $scope.pageList.push(i + 1);
        }
      } else {
        // check for beginning of paging
        if ($scope.pageNum <= 2) {
          for (var i = 0; i < 5; i++) {
            $scope.pageList.push(i + 1);
          }
        }
        // check for end of paging
        else if ($scope.pageNum >= ($scope.numPages - 2)) {
          for (var i = $scope.pageNum - 3; i < $scope.numPages; i++) {
            $scope.pageList.push(i + 1);
          }
        }
        // otherwise just do two before and two after
        else {
          for (var i = $scope.pageNum - 3; i < $scope.pageNum + 2; i++) {
            $scope.pageList.push(i + 1);
          }
        }
      }
    }

    function getThreadPage(forum, threadId, pageSize, pageNum, callback) {
      var api_url = '/v1/forum/thread?callback=JSON_CALLBACK';
      api_url += '&forum=' + forum;
      api_url += '&threadId=' + threadId;
      api_url += '&pageSize=' + pageSize;
      api_url += '&startPage=' + pageNum;

      $http.jsonp(api_url).success(callback);
    }

    function TranslateForumName(short_name) {
      var ret = '';
      switch (short_name) {
        case 'nosebleeds':
          ret = 'Nosebleeds';
          break;
        case 'concourse':
          ret = 'Concourse';
          break;
        case 'parkinglot':
          ret = 'Parking Lot';
          break;
        case 'ownersbox':
          ret = 'Owners Box';
          break;
        case 'tailgate':
          ret = 'Tailgate';
          break;
      }
      return ret;
    }
  }]);