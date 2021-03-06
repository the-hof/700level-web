"use strict";

var UserService = require('../lib/UserService');

//////////////////////////////////////////////////
// helper functions
//////////////////////////////////////////////////

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

function wrapResponseInCallback(callbackQuerystring, responseText) {
    var resText = getCallbackOpenFromQueryString(callbackQuerystring);
    resText += responseText + getCallbackCloseFromQueryString(callbackQuerystring);

    return resText;
}

function getSolrUserNameFromPOST(post_username) {
    if (post_username) return post_username;
    return '';
}


//////////////////////////////////////////////////
// user.js
//////////////////////////////////////////////////

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
                });
            });
        } else {
            res.send("admin already exists, not adding new one");
        }
    });
    //res.send("not implemented");
};

exports.createNew = function (req, res) {
    var username = getSolrUserNameFromPOST(req.param('username'));
    var unhashed_password = getSolrUserNameFromPOST(req.param('password'));
    var email = getSolrUserNameFromPOST(req.param('email_address'));
    var user = new UserService();

    res.setHeader('Content-Type', 'application/json');

    if (username) {
        user.createNew(username, unhashed_password, email, function (err) {
            var returnCode = 'OK';
            if (err) returnCode = err.message;

            res.send(JSON.stringify({status: returnCode})); //not called by jsonp, so don't wrap callback
        });
    } else {
        var returnCode = 'Screen Name can\'t be blank';

        res.send(JSON.stringify({status: returnCode})); //not called by jsonp, so don't wrap callback
    }
};

exports.validate = function (req, res) {
    var username = getSolrUserNameFromPOST(req.param('username'));
    var unhashed_password = getSolrUserNameFromPOST(req.param('password'));
    var user = new UserService();
    var returnCode = 'THERE WAS AN ERROR';
    user.getByUsernamePassword(username, unhashed_password, function (err, SelectedUser) {
        if (err) {
            returnCode = err.message;
        } else {
            returnCode = SelectedUser.isValid ? 'valid' : 'username and password not found';
        }
        res.send(returnCode);
    });
};

exports.login = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(wrapResponseInCallback(req.query.callback, JSON.stringify({username: req.user.username})));
};

exports.logout = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    req.logOut();
    res.send(wrapResponseInCallback(req.query.callback, JSON.stringify({status: 'OK'})));
};

exports.loggedin = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(
      wrapResponseInCallback(
        req.query.callback,
        req.isAuthenticated() ? JSON.stringify({username: req.user.username}) : JSON.stringify({username: 'anonymous'})
      )
    );
};

exports.resetPassword = function (req, res) {
    var userid = getSolrUserNameFromPOST(req.param('id'));
    var reset_code = req.param('reset_code');
    var new_password = req.param('new_password');

    var user = new UserService();
    user.resetPassword(userid, reset_code, new_password, function (err) {
        var returnCode = "password changed";
        if (err) {
            returnCode = err.message;
        }
        res.send(returnCode);
    })
}