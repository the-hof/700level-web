var lvlControllers = angular.module('lvlControllers', []);

lvlControllers.controller('forumListCtrl', ['$scope',
  function ($scope) {

  }]);

lvlControllers.controller('forumDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    var api_url = 'http://localhost:3000/v1/forum/?callback=JSON_CALLBACK';
    var pageSize = 25;
    var pageNum = 0;

    api_url += '&forum=' + $routeParams.forumName;
    api_url += '&startPage=' + pageNum;
    api_url += '&pageSize=' + pageSize;

    $scope.forumName = TranslateForumName($routeParams.forumName);

    $http.jsonp(api_url).success(function(data) {
      $scope.threadList = data;
    });

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