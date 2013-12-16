var lvlControllers = angular.module('lvlControllers', []);

lvlControllers.controller('forumListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    /*
    $http.get('phones/phones.json').success(function(data) {
      $scope.phones = data;
    });

    $scope.orderProp = 'age';
    */
  }]);

lvlControllers.controller('forumDetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.forumName = $routeParams.forumName;
  }]);