var UserService = require('../lib/UserService');

function wrapResponseInCallback(callbackQuerystring, responseText) {
  return getCallbackOpenFromQueryString(callbackQuerystring)
    + responseText
    + getCallbackCloseFromQueryString(callbackQuerystring);
}

function getCallbackOpenFromQueryString(url_callback) {
  var retStr = '';
  if (url_callback) retStr = url_callback + '(';
  return retStr;
}

function getCallbackCloseFromQueryString(url_callback) {
  var retStr = '';
  if (url_callback) retStr = ')';
  return retStr;
}

/*
 * GET users listing.
 */

function getSolrUserNameFromPOST(post_username) {
  if (post_username) return post_username;
  return '';
}

function getSolrPasswordFromPOST(post_password) {
  if (post_password) return post_password;
  return '';
}

function getSolrEmailFromPOST(post_email) {
  if (post_email) return post_email;
  return '';
}

exports.setFirstAdmin = function (req, res) {
  var username = getSolrUserNameFromPOST(req.param('username'));
  var user = new UserService();
  user.checkSiteAdmin(function (err, HasAdmin) {
    if (!HasAdmin) {
      user.getByUsername(username, function (err, SelectedUser) {
        if (err) throw err;
        if (!SelectedUser) res.send("couldn't find username in database");
        user.setAdmin(SelectedUser.id, function (err) {
          if (err) throw err;
          res.send("OK");
        })
      })
    } else {
      res.send("admin already exists, not adding new one");
    }
  })
  //res.send("not implemented");
}

exports.createNew = function (req, res) {
  var username = getSolrUserNameFromPOST(req.param('username'));
  var unhashed_password = getSolrUserNameFromPOST(req.param('password'));
  var email = getSolrUserNameFromPOST(req.param('email_address'));
  var user = new UserService();
  user.createNew(username, unhashed_password, email, function (err) {
    var returnCode = 'OK';
    if (err) returnCode = err.message;
    res.send(wrapResponseInCallback(req.query.callback, JSON.stringify({status:returnCode})));
  });

}

exports.validate = function (req, res) {
  var username = getSolrUserNameFromPOST(req.param('username'));
  var unhashed_password = getSolrUserNameFromPOST(req.param('password'));
  var user = new UserService();
  var returnCode = 'THERE WAS AN ERROR';
  user.getByUsernamePassword(username, unhashed_password, function (err, SelectedUser) {
    if (err) {
      returnCode = err.message
    } else {
      returnCode = SelectedUser.isValid ? 'valid' : 'username and password not found';
    }
    ;
    res.send(returnCode);
  })
};

exports.login = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(wrapResponseInCallback(req.query.callback, JSON.stringify({username:req.user.username})));
};

exports.logout = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  req.logOut();
  res.send(wrapResponseInCallback(req.query.callback, JSON.stringify({status:'OK'})));
};

exports.loggedin = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(
    wrapResponseInCallback(
      req.query.callback,
      req.isAuthenticated() ? JSON.stringify({username:req.user.username}) : JSON.stringify({username:'anonymous'})
    )
  );
};