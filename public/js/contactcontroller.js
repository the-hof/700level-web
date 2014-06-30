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