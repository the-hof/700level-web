var expect = require('expect.js');
var ForumService = require('../lib/ForumService');
var uuid = require('node-uuid');

describe('Forum', function () {
  /*
  describe('#deletePostByID', function () {
    it('should delete a post without error', function (done) {

    })
  });
  */

  describe('#listThreadsByForum', function () {

  });

  describe('#listPostsByThread', function () {
    it('should error when forum name blank', function(done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread='Auto test thread';
      forumService.listPostsByThread('', thread, function(err, PostList) {
        if (err && (err != 'Forum or thread not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should error when thread name blank', function(done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread='Auto test thread';
      forumService.listPostsByThread(forum, '', function(err, PostList) {
        if (err && (err != 'Forum or thread not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should return an array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread='Auto test thread';
      forumService.listPostsByThread(forum, thread, function(err, PostList) {
        if (err) throw err;
        expect(PostList).to.be.an('array');
        expect(PostList).to.not.be.empty();
        done();
      })
    });
  });

  describe('#savePost', function () {
    it('should save a new post without error', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
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
      var forum = 'The Barrel';
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