levelControllers.controller('forumDetailCtrl', ['$scope', '$routeParams', '$http', '$location',
  function ($scope, $routeParams, $http, $location) {
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.resultCount = 0;

    $scope.forumCode = $routeParams.forumName;
    $scope.forumName = TranslateForumName($routeParams.forumName);

    $scope.searchTerm = '';

    //check for paging
    if ($routeParams.forumPage) {
      if ($routeParams.forumPage === 'max') {
        $scope.pageNum = '1';
      }
      else {
        $scope.pageNum = parseInt($routeParams.forumPage, 10);
      }
    }

    getForumPage($scope.forumCode, $scope.pageSize, $scope.pageNum, function (data) {
      $scope.threadList = data;
      $scope.resultCount = data.length;

      console.log(data);

      $scope.numPages = Math.ceil($scope.threadCount / $scope.pageSize);
      $scope.pageList = [];

      //if we're looking for the last page, set the current page # to the last one
      if ($routeParams.forumPage === 'max') {
        $scope.pageNum = $scope.numPages;
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
    })



    $scope.search = function () {
      var searchTerm = $scope.searchTerm;
      var searchQuery = '';

      if (searchTerm) {
        searchQuery = searchTerm.replace(" ", "+");

        var returnTarget = '/search';
        $location.path(returnTarget + '/' + searchQuery);
      }
    }

    $scope.newThread = function () {
      var returnTarget = '/fansview/' + $scope.forumCode + '/thread/create';
      $location.path(returnTarget);
    }

    $scope.jumpToPage = function (pageNum) {
      var returnTarget = '/fansview/' + $scope.forumCode + '/' + pageNum;
      $location.path(returnTarget);
    }

    $scope.nextPage = function () {
      var targetPageNum = parseInt($scope.pageNum, 10) + 1;
      targetPageNum = (targetPageNum > $scope.numPages) ? $scope.numPages : targetPageNum;
      var returnTarget = '/fansview/' + $scope.forumCode + '/' + targetPageNum;
      $location.path(returnTarget);
    }

    $scope.prevPage = function () {
      var targetPageNum = parseInt($scope.pageNum, 10) - 1;
      targetPageNum = (targetPageNum < 1) ? 1 : targetPageNum;
      var returnTarget = '/fansview/' + $scope.forumCode + '/' + targetPageNum;
      $location.path(returnTarget);
    }

    function getForumPage(forum, pageSize, pageNum, callback) {
      var api_url = '/v1/forum/?callback=JSON_CALLBACK';
      api_url += '&forum=' + forum;
      api_url += '&pageSize=' + pageSize;
      api_url += '&startPage=' + pageNum;

      $http.jsonp(api_url).success(function (data) {
        $scope.threadCount = data.threadCount;
        callback(data.docs);
      });
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

  }]);  //end forumDetailCtrl