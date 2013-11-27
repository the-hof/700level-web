var request = require('superagent');
var expect = require('expect.js');
var User = require('../lib/User');

describe('Home Page', function () {
  it('should exist', function (done) {
    request
      .get('localhost:3000', function (error, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('700Level');
        done();
      });
  });
});

describe('User', function(){
  describe('#save()', function(){
    it('should save without error', function(done){
      var user = new User('test_username', 'test_password', 'test.email@700level.com');
      user.save(function(err){
        if (err) throw err;
        done();
      });
    })
  })
})
