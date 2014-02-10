angular.module('levelDirectives', ['ui.bootstrap'])
  .directive('levelLogin', function () {

    var userInfoUrl = '/loggedin?callback=JSON_CALLBACK';
    var logoutUrl = '/logout?callback=JSON_CALLBACK';
    var loginUrl = '/login?callback=JSON_CALLBACK';

    var LoginCtrl = function ($scope, $modalInstance, $http, user, $location, $rootScope) {
      $scope.user = user;
      $scope.isLoggedIn = false;

      $scope.doLogin = function (username, password) {
        // do login here

        $http({
          url: loginUrl,
          method: 'JSONP',
          params: {
            username: username,
            password: password
          }
        })
          .success(function (data) {
            $modalInstance.close($scope.user);
            $scope.isLoggedIn = true;
            $location.search({login:1});
          })
          .error(function (data) {
            $scope.isLoggedIn = false;
            $scope.user.isInvalid = true;
            $scope.user.message = 'invalid username or password';
          })
      };

      $scope.signup = function() {
        $modalInstance.close(null);
        $scope.isLoggedIn = false;
        $location.path('/');
      }

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    return {
      template: '<div style="margin:10px 0px 0px 10px;"><button ng-click="openLoginModal()" data-target="#myModal" data-toggle="modal" class="{{loginClass}}">{{username}}</button></div>',
      restrict: 'E',
      link: function (scope, iElement, iAttrs) {
      },
      scope: {

      },
      replace: true,
      controller: function ($scope, $http, $modal, $location) {

        function setLoginStatus() {
          $http
            .jsonp(userInfoUrl)
            .success(function (data) {
              if (data.username == 'anonymous') {
                $scope.username = 'LOGIN';
                $scope.loginClass = "btn btn-primary btn-sm";
              } else {
                $scope.username = 'Logout: ' + data.username;
                $scope.loginClass = "btn btn-primary btn-sm";
                $scope.isLoggedIn = true;
              }
            })
            .error(function (err) {
              $scope.username == 'LOGIN';
              $scope.loginClass = "btn btn-primary btn-sm";
            });
        }

        setLoginStatus();

        // catch 'loginEvent' messages broadcast from outside
        // data is an array:  [username,password]
        $scope.$on('loginEvent', function(event, data) {

          $http({
            url: loginUrl,
            method: 'JSONP',
            params: {
              username: data[0],
              password: data[1]
            }
          })
            .success(function (data) {
              $scope.isLoggedIn = true;
              setLoginStatus();
            })
            .error(function (data) {
              $scope.isLoggedIn = false;
              $scope.user.isInvalid = true;
              $scope.user.message = 'invalid username or password';
            });
        });

        $scope.openLoginModal = function () {
          if (!$scope.isLoggedIn) { //log in
            var modalInstance = $modal.open({
              templateUrl: 'partials/modal-login.html?v=1',
              controller: LoginCtrl,
              resolve: {
                user: function () {
                  return { username: $scope.user };
                }
              }
            });

            modalInstance.result.then(function (user) {
              setLoginStatus();
              if (user) {
                $location.search({login:2});
              } else {
                $location.path('/register');
              }
            });
          } else { // log out
            $http
              .jsonp(logoutUrl)
              .success(function (data) {
                  $scope.username = 'LOGIN';
                  $scope.loginClass = "btn btn-primary btn-sm";
                  $scope.isLoggedIn = false;
                  $location.search({logout:1});

              })
              .error(function (err) {
                $scope.username == 'LOGIN';
                $scope.loginClass = "btn btn-primary btn-sm";
                $scope.isLoggedIn = false;
              });
          }

        };

        $scope.cancel = function () {
          $modal.dismiss('cancel');
        };
      }
    }
  });