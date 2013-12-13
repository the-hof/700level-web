var request = require('superagent');
var expect = require('expect.js');
var UserService = require('../lib/UserService');



describe('/user/create', function() {
  it('should save a new user via post', function (done) {
    //make sure user isn't already in the database
    var testURL = 'http://localhost:3000/v1/user/';
    var testUser = {
      "username":"apitest_post",
      "password":"apitest_postpass",
      "email_address":"apitest_POST@700level.com"
    }
    var user = new UserService();
    user.deleteUserName('apitest_post', function (err) {
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

  it('should save a new user via GET', function (done) {
    //make sure user isn't already in the database
    var testURL = 'http://localhost:3000/v1/user/';
    var testUser = {
      "username":"apitest_get",
      "password":"apitest_getpass",
      "email_address":"apitest_GET@700level.com"
    }
    var user = new UserService();
    user.deleteUserName('apitest_get', function (err) {
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
})