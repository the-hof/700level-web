var expect = require('expect.js');
var ForumService = require('../lib/ForumService');
var uuid = require('node-uuid');

describe('Forum', function () {
  describe('#savePost', function () {
    it('should save a new post without error', function (done) {
      var forumService = new ForumService();
      var forum = 'Parking Lot';
      var thread = 'Auto test thread';
      var post = 'test post';
      var ip = '127.0.0.1';


      forumService.savePost('test_username', 'test_password', forum, thread, post, ip, function (err) {
        if (err) throw err;
        done();
      });
    });

    it('should not allow saves by invalid username & password combos', function (done) {
      var forumService = new ForumService();
      var forum = 'Parking Lot';
      var thread = 'Auto test thread';
      var post = 'should never see this';
      var ip = '127.0.0.1';

      forumService.savePost(uuid.v4(), uuid.v4(), forum, thread, post, ip, function (err) {
        if (err && (err != 'username and password not authorized to post')) throw err;
        done();
      })
    });

  })
})