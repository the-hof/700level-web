"use strict";

var helios = require('helios');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');
var config = require('../routes/config.js');

//////////////////////////////////////////////////
// helper functions
//////////////////////////////////////////////////
function solrResponseToUserList(res) {
    var userCount, result, retUser;
    userCount = res.response.docs.length;
    result = [];

    if (userCount > 0) {
        for (var i = 0; i < userCount; i++) {
            retUser = res.response.docs[i];
            retUser.isValid = (retUser.role.indexOf('post') > -1);
            retUser.isAdmin = (retUser.role.indexOf('admin') > -1);

            result.push(retUser);
        }
    }

    return result;
}

function getBlankUser() {
    return {
        username: '',
        hashed_password: '',
        isAdmin: false,
        isValid: false
    };
}

function solrResponseToUser(res) {
    var retUser;
    if (res.response.docs.length == 1) {
        retUser = res.response.docs[0];
        retUser.isValid = (retUser.role.indexOf('post') > -1);
        retUser.isAdmin = (retUser.role.indexOf('admin') > -1);

        return retUser;
    } else {
        return getBlankUser();
    }
}


//////////////////////////////////////////////////
// UserService
//////////////////////////////////////////////////
function UserService() {
    this.solr_client = new helios.client(config.user_connection);

    this.isValid = false;
    this.isAdmin = false;
}

UserService.prototype.createNew = function (username, password, email_address, callback) {
    var self = this;
    this.getByUsername(username, function (err, SelectedUser) {
        if (err) throw err;
        if (SelectedUser.isValid) return callback({message: 'username already exists'});

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

        //self.solr_client.addDoc(solrdoc, true, callback);
    });
};

UserService.prototype.checkSiteAdmin = function (callback) {
    this.solr_client.select({
        fq: '+admin_datatype:User',
        wt: 'json',
        q: 'admin',
        qf: 'role',
        defType: 'edismax'
    }, function (err, res) {
        if (err) throw err;
        var result = solrResponseToUserList(JSON.parse(res));
        //console.log(result.length>0);
        return callback(err, (result.length > 0));
    });
};

UserService.prototype.setAdmin = function (id, callback) {
    var self = this;

    this.getById(id, function (err, SelectedUser) {
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
    });
};

UserService.prototype.deleteUserName = function (username, callback) {
    function translateDeleteResponse(res) {
        if (res && (res.indexOf("There are no documents to delete.") !== -1)) {
            return callback(null);
        } else {
            return callback(res);
        }

    }

    var delete_query = '+username:\"' + username + '\" AND +admin_datatype:User';

    this.solr_client.deleteDocByQuery(delete_query, true, 0, translateDeleteResponse);

};

UserService.prototype.listUsers = function (callback) {
    this.solr_client.select({
        fq: '+admin_datatype:User',
        wt: 'json',
        q: '*:*'
    }, function (err, res) {
        if (err) throw err;
        var result = solrResponseToUserList(JSON.parse(res));
        return callback(err, result);
    });
};

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

UserService.prototype.getByUsername = function (username, callback) {
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
    });
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
        bcrypt.compare(password, SelectedUser.hashed_password, function (err, res) {
            if (res === true) {
                return callback(err, SelectedUser);
            } else {
                return callback(err, getBlankUser());
            }
        });
    });
};

UserService.prototype.resetPassword = function (id, reset_code, new_password, callback) {
    var self = this;
    var magic_code = '0e7cc521-c0f7-488d-a0a5-9e63f8d15c26';
    //var magic_id = '0e7cc521-c0f7-488d-a0a5-9e63f8d15c26';
    var magic_id = 'efc6e62e-35b6-4ad5-9802-341e8e799b85';

    if (id && (id === magic_id) && (new_password) && (reset_code==magic_code)) {

        this.getById(id, function (err, SelectedUser) {
            if (err) throw err;

            if (!SelectedUser.isValid) {
                callback('error finding user id');
            } else {
                //console.log('username=' + SelectedUser.username);
                var solrdoc = new helios.document();
                var salt = bcrypt.genSaltSync(10);
                //var salt = SelectedUser.salt;
                var hash = bcrypt.hashSync(new_password, salt);
                //console.log('salt=' + salt);
                //console.log('pwd=' + hash);

                solrdoc.addField('id', id);
                solrdoc.setField('salt', salt);
                solrdoc.setField('hashed_password', hash);
                solrdoc.setFieldUpdate('salt', 'set');
                solrdoc.setFieldUpdate('hashed_password', 'set');

                self.solr_client.updateDoc(solrdoc, true, callback);
            }
        });
    } else {
        callback({message:'unsupported operation'});
    }
};

// export the class
module.exports = UserService;

