var request = require('superagent');
var expect = require('expect.js');
var uuid = require('node-uuid');
var UserService = require('../lib/UserService');


after(function (done) {
  var shouldCleanUp = true;
  if (shouldCleanUp) {
    var user = new UserService();
    console.log('cleaning up user api tests');
    user.deleteUserName('apitest_get', function (err) {
      if (err) console.log(err);
      user.deleteUserName('apitest_post', function (err) {
        if (err) console.log(err);
        done();
      });
    })
  }
})



describe('/user/create', function () {
  it('should save a new user via GET', function (done) {
    //make sure user isn't already in the database
    var testURL = 'http://localhost:3000/v1/user/';
    var testUser = {
      "username": "apitest_get",
      "password": "apitest_getpass",
      "email_address": "apitest_GET@700level.com"
    }
    var user = new UserService();
    user.deleteUserName(testUser.username, function (err) {
      if (err) throw err;
      request
        .get(testURL)
        .query(testUser)
        .end(function (err, res) {
          if (err) throw err;
          expect(res).to.exist;
          expect(res.status).to.equal(200);
          expect(res.text).to.contain('OK');
          done();
        });
    });
  })


  it('should save a new user via post', function (done) {
    //make sure user isn't already in the database
    var testURL = 'http://localhost:3000/v1/user/';
    var testUser = {
      "username": "apitest_post",
      "password": "apitest_postpass",
      "email_address": "apitest_POST@700level.com"
    }
    var user = new UserService();
    user.deleteUserName(testUser.username, function (err) {
      if (err) throw err;
      request
        .put(testURL)
        .set('Content-Type', 'application/json')
        .send(testUser)
        .end(function (err, res) {
          if (err) throw err;
          expect(res).to.exist;
          expect(res.status).to.equal(200);
          expect(res.text).to.contain('OK');
          done();
        });
    });
  })


  it('should not allow duplicate usernames', function (done) {
    //make sure user isn't already in the database
    var testURL = 'http://localhost:3000/v1/user/';
    var testUser = {
      "username": "apitest_get",
      "password": "apitest_getpass",
      "email_address": "apitest_GET@700level.com"
    }
    var user = new UserService();

    request
      .get(testURL)
      .query(testUser)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('username already exists');
        done();
      });
  })
})

describe('/user/set_first_admin', function () {
  it('should set a user to be the admin without error', function (done) {
    var testURL = 'http://localhost:3000/v1/user/set_first_admin';
    var testUser = {
      "username": "apitest_get"
    }
    request
      .get(testURL)
      .query(testUser)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('OK');
        done();
      });
  })

  it('should not allow a 2nd admin to be set', function (done) {
    var testURL = 'http://localhost:3000/v1/user/set_first_admin';
    var testUser = {
      "username": "apitest_post"
    }
    request
      .get(testURL)
      .query(testUser)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('admin already exists');
        done();
      });
  })
})

describe('/user/validate', function () {
  it ('should validate a known good user', function (done) {
    var testURL = 'http://localhost:3000/v1/user/validate';
    var testUser = {
      "username": "apitest_get",
      "password": "apitest_getpass"
    }

    request
      .get(testURL)
      .query(testUser)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('valid');
        done();
      });
  })

  it ('should not find a random user', function (done) {
    var testURL = 'http://localhost:3000/v1/user/validate';
    var testUser = {
      "username": uuid.v4(),
      "password": uuid.v4()
    }

    request
      .get(testURL)
      .query(testUser)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('not found');
        done();
      });
  })
})