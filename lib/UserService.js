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
  this.isAdmin = false;
}

UserService.prototype.setAdmin = function(id, callback) {
  var self = this;

  this.getById(id, function(err, SelectedUser) {
    if (err) throw err;

    if (!SelectedUser.isValid) {
      callback('error finding user id');
    } else {
      var newRole = SelectedUser.role;
      if (newRole.indexOf('admin') == -1) {
        newRole += ' admin';
        var solrdoc = new helios.document();
        solrdoc.addField('id', SelectedUser.id);
        solrdoc.setField('role', newRole, null, 'set');

        self.solr_client.updateDoc(solrdoc, true, callback);
      }
    }
  })
}

UserService.prototype.createNew = function (username, password, email_address, callback) {
  var solrdoc = new helios.document();
  solrdoc.addField('id', uuid.v4());
  solrdoc.addField('username', username);
  solrdoc.addField('hashed_password', password);
  solrdoc.addField('email_address', email_address);
  solrdoc.addField('role', 'post');
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

UserService.prototype.getById = function (id, callback) {
  if (!id) return callback(null, new UserService());

  this.solr_client.select({
    fq: '+admin_datatype:User +id:' + id,
    wt: 'json',
    q: '*:*'
  }, function (err, res) {
    if (err) throw err;
    var result = solrResponseToUser(JSON.parse(res));
    return callback(err, result);
  });

};

UserService.prototype.getByUsernamePassword = function (username, password, callback) {
  if ((username === '') || (password === '')) {
    return callback(null, new UserService());
  }

  this.solr_client.select({
    fq: '+admin_datatype:User +username:' + username,
    wt: 'json',
    q: '*:*'
  }, function (err, res) {
    if (err) throw err;
    var result = solrResponseToUser(JSON.parse(res));
    return callback(err, result);
  });
};

function solrResponseToUser(res) {
  if (res.response.docs.length == 1) {
    var tmp = res.response.docs[0];
    this.id = tmp.id;
    this.username = tmp.username;
    this.password = tmp.password;
    this.email_address = tmp.email_address;
    this.role = tmp.role;
    this.isValid = (role.indexOf('post') > -1);
    this.isAdmin = (role.indexOf('admin') > -1);

    return this;
  } else {
    return new UserService();
  }

}
// export the class

module.exports = UserService;

