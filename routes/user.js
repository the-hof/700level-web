var UserService = require('../lib/UserService');

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

exports.createNew = function(req, res) {
  var username = getSolrUserNameFromPOST(req.param('username'));
  var unhashed_password = getSolrUserNameFromPOST(req.param('password'));
  var email = getSolrUserNameFromPOST(req.param('email_address'));
  var user = new UserService();
  user.createNew(username, unhashed_password, email, function (err) {
    var returnCode = 'OK';
    if (err) returnCode = err.message;
    res.send(returnCode);
  });

}

exports.list = function(req, res){
  res.send("respond with a resource");
};