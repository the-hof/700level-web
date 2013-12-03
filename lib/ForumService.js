var helios = require('helios');
var uuid = require('node-uuid');
var UserService = require('./UserService');

// constructor
function ForumService() {
  this.solr_client = new helios.client({
    host: 'localhost', // Insert your client host
    port: 8983,
    path: '/solr/700level', // Insert your client solr path
    timeout: 5000  // Optional request timeout
  });

}

ForumService.prototype.savePost = function (username, password, forum, thread, post_text, ip_address, callback) {
  function savePostInternal(err, User) {
    if (err) throw err;
    if (User.isValid) {
      var solrdoc = new helios.document();
      solrdoc.addField('id', uuid.v4());
      solrdoc.addField('forum', forum);
      solrdoc.addField('thread', thread);
      solrdoc.addField('post', post_text);
      solrdoc.addField('ip_address', ip_address);
      solrdoc.addField('author', username);

      solr_client = new helios.client({
        host: 'localhost', // Insert your client host
        port: 8983,
        path: '/solr/700level', // Insert your client solr path
        timeout: 5000  // Optional request timeout
      });

      solr_client.addDoc(solrdoc, true, callback);
    } else {
      return callback("username and password not authorized to post")
    }
  }

  var user = new UserService();
  user.getByUsernamePassword(username, password, savePostInternal);
};

// export the class

module.exports = ForumService;

