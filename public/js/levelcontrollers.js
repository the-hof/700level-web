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