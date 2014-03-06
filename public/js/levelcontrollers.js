var levelControllers = angular.module('levelControllers', ['ngSanitize']);

levelControllers.controller('searchCtrl', ['$scope', '$http', '$routeParams',
  function ($scope, $http, $routeParams) {
    var api_url = '/v1/forum/search?callback=JSON_CALLBACK';

    var searchQuery = $routeParams.searchQuery;

    if (searchQuery) {
      var search_url = api_url + '&q=' + searchQuery;
      $http.jsonp(search_url).success(function (data) {
        $scope.searchResults = data;
      });
    }


  }]); //end searchCtrl

levelControllers.controller('homeCtrl', ['$scope', '$http',
  function ($scope, $http) {
    var api_url = '/v1/forum/most_recent?callback=JSON_CALLBACK';

    $http.jsonp(api_url).success(function (data) {
      $scope.mostRecentPostList = data;
    });
  }]); //end homeCtrl

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

levelControllers.controller('registerCtrl', ['$scope', '$routeParams', '$http', '$location', '$rootScope',
  function ($scope, $routeParams, $http, $location, $rootScope) {
    var registrationURL = '/v1/user/?callback=JSON_CALLBACK';

    $scope.new_username = '';
    $scope.new_password = '';
    $scope.new_email = '';

    $scope.check_email = '';
    $scope.check_password = '';

    $scope.server_response = '';

    $scope.registerUser = function () {
      $scope.server_response = '';
      if (!$scope.new_email) {
        $scope.server_response += 'Email is required<br>';
      }

      if (!$scope.new_username) {
        $scope.server_response += 'Screen Name is required<br>';
      }

      if (!$scope.new_password) {
        $scope.server_response += 'Password is required<br>';
      }

      if ($scope.new_email != $scope.check_email) {
        $scope.server_response += 'Email and Verify Email must match<br>';
      }

      if ($scope.new_password != $scope.check_password) {
        $scope.server_response += 'Password and Confirm Password must match<br>';
      }

      if (!$scope.server_response) {
        var postBody = {
          username: $scope.new_username,
          password: $scope.new_password,
          email_address: $scope.new_email
        }

        $http
          .put(registrationURL, postBody)
          .success(function (data) {
            var status = data.status;
            if (status == "OK") {
              $rootScope.$broadcast('loginEvent', [$scope.new_username,$scope.new_password]);
              $location.path('/');
            } else {
              $scope.server_response += status;
            }
          })
      }
    }
  }]);

levelControllers.controller('threadReplyCtrl', ['$scope', '$routeParams', '$http', '$location',
  function ($scope, $routeParams, $http, $location) {
    var userInfoUrl = '/loggedin?callback=JSON_CALLBACK';

    $scope.threadId = $routeParams.threadId;
    $scope.forumCode = $routeParams.forumName;
    $scope.threadName = '';

    $scope.forumName = TranslateForumName($routeParams.forumName);
    $scope.isLoggedIn = false;

    $http
      .jsonp(userInfoUrl)
      .success(function (data) {
        if (data.username == 'anonymous') {
          $scope.isLoggedIn = false;
        } else {
          $scope.isLoggedIn = true;
        }
      })
      .error(function (err) {
        $scope.isLoggedIn = false;
      });

    getThreadPage($scope.forumCode, $scope.threadId, 1, 1, function (data) {

    })

    $scope.cancel = function () {
      var returnTarget = '/forum/' + $scope.forumCode + '/' + $scope.threadId;
      $location.path(returnTarget);
    };

    $scope.talkback = function () {
      var api_url = '/v1/forum/thread?callback=JSON_CALLBACK';
      api_url += '&forum=' + $scope.forumCode;
      api_url += '&threadId=' + $scope.threadId;

      var postBody = {
        post: $scope.post,
        inputURL: $scope.inputURL,
        thread: $scope.threadName
      }

      $http
        .post(api_url, postBody)
        .success(function (data) {
          var returnTarget = '/fansview/' + $scope.forumCode + '/thread/' + $scope.threadId + '/max';
          $location.path(returnTarget);
        })
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

    function getThreadPage(forum, threadId, pageSize, pageNum, callback) {
      var api_url = '/v1/forum/thread?callback=JSON_CALLBACK';
      api_url += '&forum=' + forum;
      api_url += '&threadId=' + threadId;
      api_url += '&pageSize=' + pageSize;
      api_url += '&startPage=' + pageNum;

      $http.jsonp(api_url).success(function (data) {
        $scope.threadName = data.docs[0].thread;
        return callback(data);
      });
    }
  }]);


levelControllers.controller('threadCreateCtrl', ['$scope', '$routeParams', '$http', '$location',
  function ($scope, $routeParams, $http, $location) {
    var userInfoUrl = '/loggedin?callback=JSON_CALLBACK';

    $scope.forumCode = $routeParams.forumName;
    $scope.threadName = '';

    $scope.forumName = TranslateForumName($routeParams.forumName);

    $scope.isLoggedIn = false;

    $http
      .jsonp(userInfoUrl)
      .success(function (data) {
        if (data.username == 'anonymous') {
          $scope.isLoggedIn = false;
        } else {
          $scope.isLoggedIn = true;
        }
      })
      .error(function (err) {
        $scope.isLoggedIn = false;
      });

    $scope.cancel = function () {
      var returnTarget = '/forum/' + $scope.forumCode + '/' + $scope.threadId;
      $location.path(returnTarget);
    };

    $scope.talkback = function () {
      var api_url = '/v1/forum/thread?callback=JSON_CALLBACK';
      api_url += '&forum=' + $scope.forumCode;

      var postBody = {
        post: $scope.post,
        inputURL: $scope.inputURL,
        thread: $scope.threadName
      }

      $http
        .post(api_url, postBody)
        .success(function (data) {
          var returnTarget = '/fansview/' + $scope.forumCode;
          $location.path(returnTarget);
        })
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


levelControllers.controller('contactCtrl', ['$scope', '$routeParams', '$http', '$location',
  function ($scope, $routeParams, $http, $location) {
    var api_url = '/v1/contact';
    $scope.from = '';
    $scope.email = '';
    $scope.subject = '';
    $scope.message = '';

    $scope.error_messages = '';
    $scope.success_messages = '';

    $scope.sendMessage = function () {
      // clear any existing messages and rebuild the list

      $scope.error_messages = '';
      $scope.success_messages = '';

      if (!$scope.from) $scope.error_messages += 'Name is required<br>';
      if (!$scope.email) $scope.error_messages += 'Email is required and must be valid<br>';
      if (!$scope.subject) $scope.error_messages += 'Subject is required<br>';
      if (!$scope.message) $scope.error_messages += 'Message is required<br>';

      if (!$scope.error_messages) {
        $scope.success_messages = 'Sending email now ...';
        var postBody = {
          from: $scope.from,
          email: $scope.email,
          subject: $scope.subject,
          message: $scope.message
        }

        $http
          .post(api_url, postBody)
          .success(function (data) {
            //var returnTarget = '/fansview/' + $scope.forumCode + '/thread/' + $scope.threadId + '/max';
            //$location.path(returnTarget);

            $scope.success_messages = 'Email sent successfully, thank you!';
          })
          .error(function(err) {
            $scope.success_messages = '';
            $scope.error_messages = 'Sorry, but there was a problem on the server while sending your mail, try again later';
          })

      }
    }
  }
]);