var helios = require('helios');
var uuid = require('node-uuid');
var crypto = require('crypto');
var bcrypt = require('bcrypt');


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
};

UserService.prototype.createNew = function (username, password, email_address, callback) {
  var self = this;
  this.getByUsername(username, function(err, SelectedUser) {
    if (err) throw err;
    if (SelectedUser.isValid) return callback({message:'username already exists'});

    var solrdoc = new helios.document();

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    solrdoc.addField('id', uuid.v4());
    solrdoc.addField('username', username);
    solrdoc.addField('email_address', email_address);
    solrdoc.addField('role', 'post');
    solrdoc.addField('salt', salt);
    solrdoc.addField('admin_datatype', 'User');
    solrdoc.addField('hashed_password', hash);

    self.solr_client.addDoc(solrdoc, true, callback);
  })
};

UserService.prototype.checkSiteAdmin = function(callback) {
  var self = this;

  this.solr_client.select({
    fq: '+admin_datatype:User',
    wt: 'json',
    q: 'admin',
    qf: 'role',
    defType:'edismax'
  }, function (err, res) {
    if (err) throw err;
    var result = solrResponseToUserList(JSON.parse(res));
    //console.log(result.length>0);
    return callback(err, (result.length>0));
  });
}

UserService.prototype.setAdmin = function(id, callback) {
  var self = this;

  this.getById(id, function(err, SelectedUser) {
    if (err) throw err;

    if (!SelectedUser.isValid) {
      callback('error finding user id trying to set admin');
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

UserService.prototype.deleteUserName = function (username, callback) {
  function translateDeleteResponse (res) {
    if (res && (res.indexOf("There are no documents to delete.") !== -1)) {
      return callback(null);
    } else {
      return callback(res);
    }

  }
  var delete_query = '+username:\"' + username + '\" AND +admin_datatype:User'

  this.solr_client.deleteDocByQuery(delete_query, true, 0, translateDeleteResponse);

}

UserService.prototype.listUsers = function(callback) {
  this.solr_client.select({
    fq: '+admin_datatype:User',
    wt: 'json',
    q: '*:*'
  }, function (err, res) {
    if (err) throw err;
    var result = solrResponseToUserList(JSON.parse(res));
    return callback(err, result);
  });
}

UserService.prototype.getById = function (id, callback) {
  if (!id) return callback(null, getBlankUser());

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

UserService.prototype.getByUsername = function(username, callback) {
  if (username === '') {
    return callback(null, getBlankUser());
  }

  this.solr_client.select({
    fq: '+admin_datatype:User +username:"' + username + '"',
    wt: 'json',
    q: '*:*'
  }, function (err, res) {
    if (err) throw err;
    var result = solrResponseToUser(JSON.parse(res));
    return callback(err, result);
  })
};

UserService.prototype.getByUsernamePassword = function (username, password, callback) {
  if ((username === '') || (password === '')) {
    return callback(null, getBlankUser());
  }

  this.getByUsername(username, function (err, SelectedUser) {
    if (err) throw err;
    if (!SelectedUser) {
      return callback(null, getBlankUser());
    }
    bcrypt.compare(password, SelectedUser.hashed_password, function(err, res) {
      if (res == true) {
        return callback(err, SelectedUser);
      } else {
        return callback(err, getBlankUser());
      }
    });
  });
};


function solrResponseToUserList(res) {
  var userCount = res.response.docs.length;
  var result = [];

  if (userCount > 0) {
    for (var i=0; i<userCount; i++) {
      var retUser = res.response.docs[i];
      retUser.isValid = (retUser.role.indexOf('post') > -1);
      retUser.isAdmin = (retUser.role.indexOf('admin') > -1);

      result.push(retUser);
    }
  }

  return result;
}

function solrResponseToUser(res) {
  if (res.response.docs.length == 1) {
    var retUser = res.response.docs[0];
    retUser.isValid = (retUser.role.indexOf('post') > -1);
    retUser.isAdmin = (retUser.role.indexOf('admin') > -1);

    return retUser;
  } else {
    return getBlankUser()
  }
}

function getBlankUser() {
  return {
    username: '',
      hashed_password: '',
    isAdmin: false,
    isValid: false
  }
}

// export the class

module.exports = UserService;

