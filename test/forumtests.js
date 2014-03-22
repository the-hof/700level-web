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


  function addRecords(err, recordsToAdd, callback) {
    if (err) throw err;
    if (recordsToAdd > 0) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = '';
      var post = '';
      var ip = '127.0.0.1';

      switch (recordsToAdd % 5) {
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
      forumService.savePost('forumtest_user', 'forumtest_userpwd', forum, thread, null, post, ip, function (err) {
        if (err) console.log(err);
        addRecords(err, recordsToAdd - 1, callback);
      });
    }
    else {
      return callback(err);
    }
  }

  before(function (done) {
    var user = new UserService();
    var forumService = new ForumService();
    var forum = 'The Barrel';
    var thread = 'thread topic 0';
    console.log('initializing forumtests.js')

    user.deleteUserName('forumtest_user', function (err) {
      if (err) console.log(err);
      user.deleteUserName('forumtest_user2', function (err) {
        if (err) console.log(err);
        user.createNew('forumtest_user', 'forumtest_userpwd', 'test.email@700level.com', function (err) {
          if (err) console.log(err);
          user.getByUsernamePassword('forumtest_user', 'forumtest_userpwd', function (err, SelectedUser) {
            if (err) console.log(err);
            user.setAdmin(SelectedUser.id, function (err) {
              if (err) console.log(err);
              user.createNew('forumtest_user2', 'forumtest_userpwd', 'test.email@700level.com', function (err) {
                if (err) console.log(err);
                console.log('adding records');
                addRecords(err, 11, done);
              });
            });
          });
        });
      });
    });
  });

  after(function (done) {
    var shouldCleanUp = true;
    if (shouldCleanUp) {
      var user = new UserService();
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'thread topic 0';
      console.log('cleaning up forumtests.js');

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
                user.deleteUserName('forumtest_user', function (err) {
                  user.deleteUserName('forumtest_user2', function (err) {
                    if (err) console.log(err);
                    done();
                  })
                })
              })
            })
          })
        })
      })
    }
  })


  describe('#savePost', function () {
    it('should save a new post without error', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      var post = 'test post';
      var ip = '127.0.0.1';

      console.log('testing savePost for new post');
      forumService.savePost('forumtest_user', 'forumtest_userpwd', forum, thread, null, post, ip,
        function (err, thread_id) {
          console.log('new post thread_id = ' + thread_id);
          if (err) throw err;
          forumService.getThreadAuthorByThreadId(thread_id, function (err, thread_author) {
            expect(thread_author).to.equal('forumtest_user');
          })
          done();
        });
    });

    it('should keep the original poster as the thread_author when another users replies', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread reply';
      var post1 = 'test post';
      var post2 = 'test reply'
      var ip = '127.0.0.1';

      console.log('testing savePost for existing post');
      forumService.savePost('forumtest_user2', 'forumtest_userpwd', forum, thread, null, post1, ip,
        function (err, thread_id) {
          if (err) throw err;
          forumService.savePost('forumtest_user', 'forumtest_userpwd', forum, thread, thread_id, post2, ip,
            function (err, thread_id) {
              if (err) throw err;
              forumService.getThreadAuthorByThreadId(thread_id, function (err, thread_author) {
                expect(thread_author).to.equal('forumtest_user2');
                done();
              })
            });
        });
    })

    it('should not allow saves by invalid username & password combos', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      var post = 'should never see this';
      var ip = '127.0.0.1';

      forumService.savePost(uuid.v4(), uuid.v4(), forum, thread, null, post, ip, function (err, thread_id) {
        if (err && (err != 'username and password not authorized to post')) throw err;
        done();
      })
    });
  })


  describe('#listThreadsByForum', function () {
    it('should error when forum name blank', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      forumService.listThreadsByForum('', 1, 25, function (err, PostList) {
        if (err && (err != 'Forum not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should return an array of threads', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      forumService.listThreadsByForum(forum, 1, 25, function (err, res) {
        if (err) throw err;
        var ThreadList = res.docs;
        expect(res.threadCount).to.be.greaterThan(1);
        expect(ThreadList).to.be.an('array');
        expect(ThreadList).to.not.be.empty();
        expect(ThreadList.length).to.be.greaterThan(1);
        for (var i = 0; i < ThreadList.length; i++) {
          switch (ThreadList[i].name) {
            case 'thread topic 0':
              expect(ThreadList[i].count).to.equal(2);
              break;
            case 'thread topic 1':
              expect(ThreadList[i].count).to.equal(3);
              break;
            case 'thread topic 2':
              expect(ThreadList[i].count).to.equal(2);
              break;
            case 'thread topic 3':
              expect(ThreadList[i].count).to.equal(2);
              break;
            case 'thread topic 4':
              expect(ThreadList[i].count).to.equal(2);
              break;
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
      forumService.listPostsByThread('', thread, 1, 25, function (err, PostList) {
        if (err && (err != 'Forum or thread not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should error when thread name blank', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      forumService.listPostsByThread(forum, '', 1, 25, function (err, PostList) {
        if (err && (err != 'Forum or thread not specified')) throw err;
        expect(PostList).to.not.be.ok();
        done();
      })
    })
    it('should return an array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      forumService.listPostsByThread(forum, thread, 1, 25, function (err, PostList) {
        if (err) throw err;
        expect(PostList.docs).to.be.an('array');
        expect(PostList.docs).to.not.be.empty();
        done();
      })
    })
    it('should return a sorted array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      forumService.listPostsByThread(forum, thread, 1, 25, function (err, PostList) {
        if (err) throw err;
        expect(PostList.docs).to.be.an('array');
        expect(PostList.docs).to.not.be.empty();
        //loop through result set
        //skipping the first one, so starting at i=1
        for (var i = 1; i < PostList.docs.length; i++) {
          var prior_post_time = PostList.docs[i - 1].last_modified;
          var this_post_time = PostList.docs[i].last_modified;
          expect(this_post_time).to.be.greaterThan(prior_post_time);
        }
        done();
      })
    })
  });


  describe('#listPostsByThreadId', function () {
    it('should error when thread id not supplied', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      var threadId = '';
      forumService.listPostsByThread(forum, thread, 1, 1, function (err, ControlPostList) {
        if (err) throw err;
        threadId = ControlPostList.docs[0].thread_id;
        forumService.listPostsByThreadId('', threadId, 1, 25, function (err, PostList) {
          if (err && (err != 'Forum or thread not specified')) throw err;
          expect(PostList).to.not.be.ok();
          done();
        })
      })

    })
    it('should error when thread name blank', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      var threadId = '';
      forumService.listPostsByThread(forum, thread, 1, 1, function (err, ControlPostList) {
        if (err) throw err;
        threadId = ControlPostList.docs[0].thread_id;
        forumService.listPostsByThreadId(forum, '', 1, 25, function (err, PostList) {
          if (err && (err != 'Forum or thread not specified')) throw err;
          expect(PostList).to.not.be.ok();
          done();
        })
      })
    })
    it('should return an array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      var threadId = '';
      forumService.listPostsByThread(forum, thread, 1, 1, function (err, ControlPostList) {
        if (err) throw err;
        threadId = ControlPostList.docs[0].thread_id;
        forumService.listPostsByThreadId(forum, threadId, 1, 25, function (err, PostList) {
          if (err) throw err;
          expect(PostList.docs).to.be.an('array');
          expect(PostList.docs).to.not.be.empty();
          done();
        })
      })
    })
    it('should return a sorted array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      var thread = 'Auto test thread';
      var threadId = '';
      forumService.listPostsByThread(forum, thread, 1, 1, function (err, ControlPostList) {
        if (err) throw err;
        threadId = ControlPostList.docs[0].thread_id;
        forumService.listPostsByThreadId(forum, threadId, 1, 25, function (err, PostList) {
          if (err) throw err;
          PostList = PostList.docs;
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
    })
  })


  describe('#listMostRecentPostsByForum', function () {
    it('should fail gracefully when forum does not exist', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      forumService.listMostRecentPostsByForum('', 5, function (err, PostList) {
        if ((err) && (err.message !== 'Forum not specified')) throw err;
        expect(PostList.length).to.equal(0);
        done();
      });
    });
    it('should return an array of posts', function (done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      forumService.listMostRecentPostsByForum(forum, 5, function (err, PostList) {
        if (err) throw err;
        expect(PostList.length).to.equal(5);
        done();
      });
    });
  })

  describe('#search', function() {
    it('should return a list of posts', function(done) {
      var forumService = new ForumService();
      var forum = 'The Barrel';
      forumService.search('rocky vi', 25, 1, function (err, PostList) {
        if (err) throw err;
        expect(PostList.length).to.equal(25);

        done();
      })
    })
  })

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
        forumService.listPostsByThread(forum, thread, 1, 25, function (err, PostList) {
          if (err) throw err;
          expect(PostList.docs.length).to.equal(0);
          done();
        })
      });
    });
  })
})