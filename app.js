var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , forum = require('./routes/forum')
  , http = require('http')
  , path = require('path');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , UserService = require('./lib/UserService');

passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = new UserService();
    user.getByUsernamePassword(username, password, function (err, user) {
      if (err) { return done(err); }
      if (!user.isValid) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var user = new UserService();
  user.getById(id, function(err, user) {
    done(err, user);
  });
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Authentication routes
app.get('/loggedin', function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
});
// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
  res.send(req.user);
});
// route to log out
app.post('/logout', function(req, res){
  req.logOut();
  res.send(200);
});

//API routes
app.put('/v1/user/', user.createNew);
app.get('/v1/user/', user.createNew);
app.get('/v1/user/validate', user.validate);
app.get('/v1/user/set_first_admin', user.setFirstAdmin);
app.get('/v1/forum/most_recent', forum.mostRecent);
app.get('/v1/forum/thread', forum.listPostsByThread);
app.get('/v1/forum', forum.listThreadsByForum);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
