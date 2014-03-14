var levelApp = angular.module('levelApp', [
  'ngRoute',
  'levelControllers',
  'levelDirectives'
]);

levelApp.factory('$remember', function() {
  function fetchValue(name) {
    var gCookieVal = document.cookie.split("; ");
    for (var i=0; i < gCookieVal.length; i++)
    {
      // a name/value pair (a crumb) is separated by an equal sign
      var gCrumb = gCookieVal[i].split("=");
      if (name === gCrumb[0])
      {
        var value = '';
        try {
          value = angular.fromJson(gCrumb[1]);
        } catch(e) {
          value = unescape(gCrumb[1]);
        }
        return value;
      }
    }
    // a cookie with the requested name does not exist
    return null;
  }
  return function(name, values) {
    if(arguments.length === 1) return fetchValue(name);
    var cookie = name + '=';
    if(typeof values === 'object') {
      var expires = '';
      cookie += (typeof values.value === 'object') ? angular.toJson(values.value) + ';' : values.value + ';';
      if(values.expires) {
        var date = new Date();
        date.setTime( date.getTime() + (values.expires * 24 *60 * 60 * 1000));
        expires = date.toGMTString();
      }
      cookie += (!values.session) ? 'expires=' + expires + ';' : '';
      cookie += (values.path) ? 'path=' + values.path + ';' : '';
      cookie += (values.secure) ? 'secure;' : '';
    } else {
      cookie += values + ';';

      var date = new Date();
      date.setTime( date.getTime() + (14 * 24 *60 * 60 * 1000));
      expires = date.toGMTString();

      cookie += 'expires=' + expires;
    }
    document.cookie = cookie;
  }
});

levelApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {


    $routeProvider
      .when('/fansview/:forumName/thread/create', {
        templateUrl: 'partials/thread-create.html',
        controller: 'threadCreateCtrl'
      })
      .when('/fansview/:forumName/thread/:threadId/reply', {
        templateUrl: 'partials/thread-reply.html',
        controller: 'threadReplyCtrl'
      })
      .when('/fansview/:forumName/thread/:threadId/:threadPage?', {
        templateUrl: 'partials/thread-detail.html',
        controller: 'threadDetailCtrl'
      })
      .when('/fansview/:forumName/:forumPage?', {
        templateUrl: 'partials/forum-detail.html',
        controller: 'forumDetailCtrl'
      })
      .when('/fansview', {
        templateUrl: 'partials/forum-list.html',
        controller: 'homeCtrl'
      })
      .when('/', {
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      })
      .when('/register', {
        templateUrl: 'partials/register.html',
        controller: 'registerCtrl'
      })
      .when('/contact', {
        templateUrl: 'partials/contact.html',
        controller: 'contactCtrl'
      })
      .when('/about', {
        templateUrl: 'partials/about.html',
        controller: 'homeCtrl'
      })
      .when('/search/:searchQuery', {
        templateUrl: 'partials/search.html',
        controller: 'searchCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);