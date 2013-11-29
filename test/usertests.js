var expect = require('expect.js');
var User = require('../lib/User');
var uuid = require('node-uuid');

describe('User', function () {
  describe('#deleteUserName', function () {
    it('should delete without error', function (done) {
      var user = new User();
      user.deleteUserName('test_username', function (err) {
        if (err) throw err;
        done();
      })
    });

    it('should handle the case of deleting data already deleted without error', function (done) {
      var user = new User();
      user.deleteUserName('test_username', function (err) {
        if (err) throw err;
        done();
      })
    })
  });

  describe('#save()', function () {
    it('should save without error', function (done) {
      var user = new User();
      user.save('test_username', 'test_password', 'test.email@700level.com', function (err) {
        if (err) throw err;
        done();
      });
    })
  });

  describe('getByUsernamePassword', function () {
    it('should find the user just saved', function (done) {
      var user = new User();
      user.getByUsernamePassword('test_username', 'test_password', function (err, User) {
        if (err) throw err;
        expect(User.isValid).to.equal(true);
        done();
      })
    });

    it('should not find randomly generated user in database', function (done) {
      var user = new User();
      user.getByUsernamePassword(uuid.v4(), uuid.v4(), function (err, User) {
        if (err) throw err;
        expect(User.isValid).to.equal(false);
        done();
      })
    });
  });
})
