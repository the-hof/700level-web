var helios = require('helios');
var uuid = require('node-uuid');
var UserService = require('./UserService');
var moment = require('moment');
var _ = require('underscore');

// constructor
function ForumService() {
  this.solr_client = new helios.client({
    host: 'localhost', // Insert your client host
    port: 8983,
    path: '/solr/700level', // Insert your client solr path
    timeout: 5000  // Optional request timeout
  });

}

/*
 //not tested

 ForumService.prototype.deletePostByID = function(username, password, post_id, callback) {
 var user = new UserService();
 var self = this;

 user.getByUsernamePassword(username, password, function(err, User) {
 if (User.isAdmin) {
 self.solr_client.deleteDoc('id', post_id, callback)
 }
 })
 }
 */

ForumService.prototype.search = function(searchTerm, pageSize, pageNum, callback) {
  if (!searchTerm) {

  } else {
    var q = searchTerm;
    var qf = 'thread_name^2 post';
    var defType = 'edismax';
    var mm = '100'; // setting mm=100 is the same as q.op = AND

    var self = this;

    self.solr_client.select({
      q: q,
      wt: 'json',
      qf: qf,
      mm: mm,
      defType: defType,
      rows: pageSize,
      stopwords: true,
      lowercaseOperators: true
    }, function (err, res) {
      if (err) throw err;
      var result = solrResponseToPostList(JSON.parse(res));
      return callback(err, result);
    });
  }
}

ForumService.prototype.deleteThread = function (username, password, forum, thread, callback) {
  var user = new UserService();
  var self = this;

  user.getByUsernamePassword(username, password, function (err, User) {
    if (User.isAdmin) {

      var delete_query = '+forum:\"' + forum + '\" AND +thread:\"' + thread + '\"';

      self.solr_client.deleteDocByQuery(delete_query, true, 0, function (res) {
        if (res && (res.indexOf("There are no documents to delete.") !== -1)) {
          return callback(null);
        } else {
          return callback(res);
        }
      });
    } else {
      return callback('username and password not authorized to delete');
    }
  })
}

ForumService.prototype.savePost = function (username, password, forum, thread, thread_id, post_text, ip_address, callback) {
  var self = this;

  var user = new UserService();

  if (!thread_id) {
    thread_id = uuid.v4();
    var solrdoc = new helios.document();
    solrdoc.addField('id', uuid.v4());
    solrdoc.addField('forum', forum);
    solrdoc.addField('thread', thread);
    solrdoc.addField('thread_id', thread_id);
    solrdoc.addField('post', post_text);
    solrdoc.addField('ip_address', ip_address);
    solrdoc.addField('author', username);
    solrdoc.addField('thread_author', username);
    solrdoc.addField('last_modified', moment().toISOString());

    self.solr_client.addDoc(solrdoc, true, function (err) {
      return callback(err, thread_id);
    });
  } else {
    this.getThreadDetailsByThreadId(thread_id, function (err, original_thread_author, original_thread) {
      var solrdoc = new helios.document();
      solrdoc.addField('id', uuid.v4());
      solrdoc.addField('forum', forum);
      solrdoc.addField('thread', original_thread);
      solrdoc.addField('thread_id', thread_id);
      solrdoc.addField('post', post_text);
      solrdoc.addField('ip_address', ip_address);
      solrdoc.addField('author', username);
      solrdoc.addField('thread_author', original_thread_author);
      solrdoc.addField('last_modified', moment().toISOString());

      self.solr_client.addDoc(solrdoc, true, function (err) {
        return callback(err, thread_id);
      });
    })
  }

};

ForumService.prototype.getThreadDetailsByThreadId = function (thread_id, callback) {
  var self = this;
  if (thread_id) {
    var fq = '+thread_id:\"' + thread_id + '\"';

    self.solr_client.select({
      fq: fq,
      sort: 'last_modified asc',
      wt: 'json',
      fl: 'thread_author, thread',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      res = JSON.parse(res);
      var threadList = res.response.docs;
      var thread_author = 'unknown';
      var thread = 'unknown';
      for (var i = 0; i < threadList.length; i++) {
        if (threadList[i].thread_author) {
          thread_author = threadList[i].thread_author;
          thread = threadList[i].thread;
          break;
        }
      }
      callback(err, thread_author, thread);
    })
  } else {
    callback({message: 'no thread id supplied'}, '');
  }
}

ForumService.prototype.getThreadAuthorByThreadId = function (thread_id, callback) {
  var self = this;
  if (thread_id) {
    var fq = '+thread_id:\"' + thread_id + '\"';

    self.solr_client.select({
      fq: fq,
      sort: 'last_modified asc',
      wt: 'json',
      fl: 'thread_author',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      res = JSON.parse(res);
      var threadList = res.response.docs;
      var thread_author = 'unknown';
      for (var i = 0; i < threadList.length; i++) {
        if (threadList[i].thread_author) {
          thread_author = threadList[i].thread_author;
          break;
        }
      }
      callback(err, thread_author)
    })
  } else {
    callback({message: 'no thread id supplied'}, '');
  }
}

ForumService.prototype.listThreadsByForum = function(forum, startPage, pageSize, callback) {
  var self = this;
  var startIndex = (startPage - 1) * pageSize;

  if (!forum) {
    return callback('Forum not specified', null);
  } else {
    var fq = '+forum:\"' + forum + '\"';

    self.solr_client.select({
      fq: fq,
      rows: pageSize,
      start: startIndex,
      'group': 'true',
      'group.field': 'thread',
      sort: 'last_modified desc',
      wt: 'json',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      res = JSON.parse(res);
      var postList = res.grouped.thread.groups;
      var results = {};
      var threadList = [];

      for (var i=0; i<postList.length; i++) {
        threadList.push({
          'name': postList[i].groupValue,
          'forum': postList[i].doclist.docs[0].forum,
          'count': postList[i].doclist.numFound,
          'last_modified': postList[i].doclist.docs[0].last_modified,
          'thread_id': postList[i].doclist.docs[0].thread_id,
          'thread_author': postList[i].doclist.docs[0].thread_author,
          'last_poster': postList[i].doclist.docs[0].author
        })
      }

      results.threadCount =res.grouped.thread.matches;
      results.docs = threadList;
      return callback(null, results);
    })
  }
}


ForumService.prototype.listMostRecentPostsByForum = function (forum, pageSize, callback) {
  var self = this;

  if (!forum) {
    return callback({message: 'Forum not specified'}, []);
  } else {
    var fq = '+forum:\"' + forum + '\"';

    self.solr_client.select({
      fq: fq,
      sort: 'last_modified desc',
      wt: 'json',
      rows: pageSize,
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      var result = solrResponseToPostList(JSON.parse(res));
      return callback(err, result);
    });
  }
}

ForumService.prototype.listPostsByThreadId = function (forum, threadId, startPage, pageSize, callback) {
  var self = this;
  var startIndex = (startPage - 1) * pageSize;

  if (!forum || !threadId) {
    return callback('Forum or thread not specified', null);
  } else {

    var fq = '+forum:\"' + forum + '\" +thread_id:\"' + threadId + '\"';

    self.solr_client.select({
      fq: fq,
      sort: 'last_modified asc',
      start: startIndex,
      rows: pageSize,
      wt: 'json',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      var result = {};
      result.postCount = getPostCountFromSolrResponse(JSON.parse(res));
      result.docs = solrResponseToPostList(JSON.parse(res));
      return callback(err, result);
    });
  }
}


ForumService.prototype.listPostsByThread = function (forum, thread, startPage, pageSize, callback) {
  var self = this;
  var startIndex = (startPage - 1) * pageSize;

  if (!forum || !thread) {
    return callback('Forum or thread not specified', null);
  } else {

    var fq = '+forum:\"' + forum + '\" +thread:\"' + thread + '\"';

    self.solr_client.select({
      fq: fq,
      sort: 'last_modified asc',
      start: startIndex,
      rows: pageSize,
      wt: 'json',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      var result = {};
      result.docs = solrResponseToPostList(JSON.parse(res));
      return callback(err, result);
    });
  }
}

function getPostCountFromSolrResponse(res) {
  var postCount = res.response.numFound;
  return postCount;
}

function solrResponseToPostList(res) {
  var postList = res.response.docs;
  for (var i = 0; i < postList.length; i++) {
    if (postList[i].post) {
      postList[i].post = postList[i].post.replace(/\n/g, '<br>');
    }
  }
  return postList;
}
// export the class

module.exports = ForumService;

