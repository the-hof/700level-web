var expect = require('expect.js');
var UserService = require('../lib/UserService');
var uuid = require('node-uuid');

after(function (done) {
  var shouldCleanUp = true;
  if (shouldCleanUp) {
    var user = new UserService();

    user.deleteUserName('test_username', function (err) {
      if (err) console.log(err);
      done();
    })
  }
})

describe('User', function () {
  describe('#deleteUserName', function () {
    it('should delete without error', function (done) {
      var user = new UserService();
      user.deleteUserName('test_username', done);
    });

    it('should handle the case of deleting data already deleted without error', function (done) {
      var user = new UserService();
      user.deleteUserName('test_username', done);
    })
  });

  describe('#createNew()', function () {
    it('should save without error', function (done) {
      var user = new UserService();
      user.createNew('test_username', 'test_password', 'test.email@700level.com', done);
    })
  });

  describe('#listUsers', function () {
    it('should list users without error', function (done) {
      var user = new UserService();
      user.listUsers(function (err, UserList) {
        if (err) throw err;
        expect(UserList.length).to.be.greaterThan(0);
        for (var i = 0; i < UserList.length; i++) {
          expect(UserList[i].username).to.be.ok();
        }
        done();
      })
    })
  })

  describe('getByUsernamePassword', function () {
    it('should find the user just saved', function (done) {
      var user = new UserService();
      user.getByUsernamePassword('test_username', 'test_password', function (err, SelectedUser) {
        if (err) throw err;
        if (!SelectedUser.isValid) {
          console.log(SelectedUser)
        }
        ;
        expect(SelectedUser.isValid).to.equal(true);
        expect(SelectedUser.isAdmin).to.equal(false);
        done();
      })
    });

    it('should not find the user just saved with the wrong password', function (done) {
      var user = new UserService();
      user.getByUsernamePassword('test_username', uuid.v4(), function (err, SelectedUser) {
        if (err) throw err;
        //if (SelectedUser.isValid) {console.log(SelectedUser)};
        expect(SelectedUser.isValid).to.equal(false);
        expect(SelectedUser.isAdmin).to.equal(false);
        done();
      })
    });

    it('should not find randomly generated user in database', function (done) {
      var user = new UserService();
      user.getByUsernamePassword(uuid.v4(), uuid.v4(), function (err, User) {
        if (err) throw err;
        expect(User.isValid).to.equal(false);
        done();
      })
    });
  });

  describe('getByUsername', function () {
    it('should find a user previously saved', function (done) {
      var user = new UserService();
      user.getByUsername('test_username', function (err, SelectedUser) {
        if (err) throw err;
        expect(SelectedUser.isValid).to.equal(true);
        expect(SelectedUser.username).to.equal('test_username');
        done();
      })
    })
  })

  describe('getById', function () {
    it('should find a user previously saved', function (done) {
      var user = new UserService();
      user.getByUsernamePassword('test_username', 'test_password', function (err, SelectedUser) {
        if (err) throw err;
        user.getById(SelectedUser.id, function (err, ConfirmedUser) {
          if (err) throw err;
          expect(ConfirmedUser.isValid).to.equal(true);
          expect(ConfirmedUser.isAdmin).to.equal(false);
          done();
        })
      })
    })

    it('should not find randomly generated userid in database', function (done) {
      var user = new UserService();
      user.getById(uuid.v4(), function (err, SelectedUser) {
        if (err) throw err;
        expect(SelectedUser.isValid).to.equal(false);
        done();
      })
    })
  });

  describe('makeAdmin', function () {
    it('should set a user to be an admin without error', function (done) {
      var user = new UserService();
      user.getByUsernamePassword('test_username', 'test_password', function (err, SelectedUser) {
        if (err) throw err;
        user.setAdmin(SelectedUser.id, done);
      })
    });

    it('should correctly identify the recently promoted user as an admin', function (done) {
      var user = new UserService();
      user.getByUsernamePassword('test_username', 'test_password', function (err, SelectedUser) {
        if (err) throw err;
        expect(SelectedUser.isAdmin).to.equal(true);
        done();
      });
    });
  })
});
