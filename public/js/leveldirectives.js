angular.module('levelDirectives', ['ui.bootstrap'])
  .directive('levelLogin', function () {

    var userInfoUrl = 'http://beta.700level.com/loggedin?callback=JSON_CALLBACK';
    var loginUrl = 'http://beta.700level.com/login?callback=JSON_CALLBACK';

    var LoginCtrl = function ($scope, $modalInstance, $http, user) {
      $scope.user = user;

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
            $scope.user.name = data.username;
            $modalInstance.close($scope.user);
          })
          .error(function(data) {
            $scope.user.isInvalid = true;
            $scope.user.message = 'invalid username or password';
          })
      };

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
      controller: function ($scope, $http, $modal) {

        $http.jsonp(userInfoUrl).success(function (data) {
          if (data.username == 'anonymous') {
            $scope.username = 'LOGIN';
            $scope.loginClass = "btn btn-primary btn-sm";
          } else {
            $scope.username = 'Logout: ' + data.username;
            $scope.loginClass = "btn btn-primary btn-sm";
          }
        });

        $scope.openLoginModal = function () {
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
            $scope.username = 'Logout: ' + user.name;
            $scope.loginClass = "btn btn-sm";
          });
        };

        $scope.cancel = function () {
          $modal.dismiss('cancel');
        };
      }
    }
  });