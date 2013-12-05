var expect = require('expect.js');
var ForumService = require('../lib/ForumService');
var UserService = require('../lib/UserService');
var uuid = require('node-uuid');

describe('Forum', function () {
  /*
   describe('#deletePostByID', function () {
   it('should delete a post without error', function (done) {

   })
   });
   */

  function addTenRecs(err) {
    if (err) throw err;
    var forumService = new ForumService();
    var forum = 'The Barrel';
    var thread = '';
    var post = '';
    var ip = '127.0.0.1';

    for (var i = 0; i < 10; i++) {
      switch (i % 3) {
        case 0:
          thread = 'thread topic 0';
          post = 'text sample 1';
          break;
        case 1:
          thread = 'thread topic 1';
          post = 'text sample 2';
          break;
        case 2:
          thread = 'thread topic 2';
          post = 'text sample 3';
          break;
        case 3:
          thread = 'thread topic 3';
          post = 'text sample 4';
          break;
        case 4:
          thread = 'thread topic 4';
          post = 'text sample 5';
          break;
      }

      forumService.savePost('forumtest_user', 'forumtest_userpwd', forum, thread, post, ip, function(err) {
        if (err) console.log(err);
      });
    }
  }

  before(function (done) {
    var user = new UserService();
    user.createNew('forumtest_user', 'forumtest_userpwd', 'test.email@700level.com', function(err) {
      if (err) console.log(err);
      user.getByUsernamePassword('forumtest_user', 'forumtest_userpwd', function(err, SelectedUser){
        if (err) console.log(err);
        user.setAdmin(SelectedUser.id, done);
      })
    });
  })

  after(function () {
    var user = new UserService();
    var forumService = new ForumService();
    var forum = 'The Barrel';
    var thread = 'thread topic 0';

    forumService.deleteThread('forumtest_user', 'forumtest_userpwd', forum, thread, function (err) {
      if (err) throw err;
      thread = 'thread topic 1';
      forumService.deleteThread('forumtest_user', 'forumtest_userpwd', forum, thread, function (err) {
        if (err) throw err;
        thread = 'thread topic 2';
        forumService.deleteThread('forumtest_user', 'forumtest_userpwd', forum, thread, function (err) {
          if (err) throw err;
          thread = 'thread topic 3';
          forumService.deleteThread('forumtest_user', 'forumtest_userpwd', forum, thread, function (err) {
            if (err) throw err;
            thread = 'thread topic 4';
            forumService.deleteThread('forumtest_user', 'forumtest_userpwd', forum, thread, function (err) {
              if (err) throw err;
              console.log('deleting forum user');
              user.deleteUserName('forumtest_user', function(err) {
                if (err) console.log(err);
              })
            })
          })
        })
      })
    })
  })


  describe('#savePost', function () {
    it('should save a new post without error', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      var post = 'test post';
      var ip = '127.0.0.1';

      forumService.savePost('forumtest_user', 'forumtest_userpwd', forum, thread, post, ip, done);
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


  describe('#listThreadsByForum', function () {
    it('should error when forum name blank', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      forumService.listThreadsByForum('', function (err, PostList) {
        if (err && (err != 'Forum not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should return an array of threads', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      forumService.listThreadsByForum(forum, function (err, PostList) {
        if (err) throw err;
        expect(PostList).to.be.an('array');
        expect(PostList).to.not.be.empty();
        for (var i = 0; i < PostList.length; i++) {
          switch (PostList[i].name) {
            case 'thread topic 0':
              expect(PostList[i].count).to.equal(4);
          }
        }
        done();
      })
    })

  });

  describe('#listPostsByThread', function () {
    it('should error when forum name blank', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      forumService.listPostsByThread('', thread, function (err, PostList) {
        if (err && (err != 'Forum or thread not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should error when thread name blank', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      forumService.listPostsByThread(forum, '', function (err, PostList) {
        if (err && (err != 'Forum or thread not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should return an array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      forumService.listPostsByThread(forum, thread, function (err, PostList) {
        if (err) throw err;
        expect(PostList).to.be.an('array');
        expect(PostList).to.not.be.empty();
        done();
      })
    })
    it('should return a sorted array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      forumService.listPostsByThread(forum, thread, function (err, PostList) {
        if (err) throw err;
        expect(PostList).to.be.an('array');
        expect(PostList).to.not.be.empty();
        //loop through result set
        //skipping the first one, so starting at i=1
        for (var i = 1; i < PostList.length; i++) {
          var prior_post_time = PostList[i - 1].last_modified;
          var this_post_time = PostList[i].last_modified;
          expect(this_post_time).to.be.greaterThan(prior_post_time);
        }
        done();
      })
    })

  });


  describe('#deleteThread', function () {
    it('should not allow a random user to delete a thread', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';

      forumService.deleteThread(uuid.v4(), uuid.v4(), forum, thread, function (err) {
        if (err && (err != 'username and password not authorized to delete')) throw err;
        done();
      });
    });
    it('should fail gracefully when thread does not exist', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';

      forumService.deleteThread('forumtest_user', 'forumtest_userpwd', forum, uuid.v4(), done);
    });
    it('should delete a thread without error', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';

      forumService.deleteThread('forumtest_user', 'forumtest_userpwd', forum, thread, function (err) {
        if (err) throw err;
        forumService.listPostsByThread(forum, thread, function (err, PostList) {
          if (err) throw err;
          expect(PostList.length).to.equal(0);
          done();
        })
      });
    });
  })
})