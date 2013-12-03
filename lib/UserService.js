var helios = require('helios');
var uuid = require('node-uuid');

// constructor
function UserService() {
  this.solr_client = new helios.client({
    host : 'localhost', // Insert your client host
    port : 8983,
    path : '/solr/700level_admin', // Insert your client solr path
    timeout : 5000  // Optional request timeout
  });

  this.isValid = false;

}

UserService.prototype.save = function (username, password, email_address, callback) {
  var solrdoc = new helios.document();
  solrdoc.addField('id', uuid.v4());
  solrdoc.addField('username', username);
  solrdoc.addField('hashed_password', password);
  solrdoc.addField('email_address', email_address);
  solrdoc.addField('admin_datatype', 'User');

  this.solr_client.addDoc(solrdoc, true, callback);
};

UserService.prototype.deleteUserName = function (username, callback) {
  function translateDeleteResponse (res) {
    if (res && (res.indexOf("There are no documents to delete.") !== -1)) {
      return callback(null);
    } else {
      return callback(res);
    }

  }
  var delete_query = '+username:' + username + ' AND +admin_datatype:User'

  this.solr_client.deleteDocByQuery(delete_query, true, 0, translateDeleteResponse);

}

UserService.prototype.getByUsernamePassword = function(username, password, callback) {
   if ((username === '') || (password === '')) {
     return callback(err, new UserService());
   }

  this.solr_client.select({
    fq : '+admin_datatype:User +username:'+username,
    wt: 'json',
    q: '*:*'
  }, function(err, res) {
    if (err) throw err;
    var result = solrResponseToUser(JSON.parse(res));
    return callback(err, result);
  });
}

function solrResponseToUser(res) {
  if (res.response.docs.length == 1) {
    var tmp = res.response.docs[0];
    this.id = tmp.id;
    this.username = tmp.username;
    this.password = tmp.password;
    this.email_address = tmp.email_address;
    this.isValid = true;

    return this;
  } else {
    return new UserService();
  }

}
// export the class

module.exports = UserService;

