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

ForumService.prototype.deleteThread = function(username, password, forum, thread, callback) {
  var user = new UserService();
  var self = this;

  user.getByUsernamePassword(username, password, function(err, User) {
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
    thread_author = username;
  } else {
    this.getThreadAuthorByThreadId(thread_id, function(err, original_thread_author) {
      thread_author = original_thread_author;
    })

  }
  //user.getByUsernamePassword(username, password, function (err, User) {
    //if (err) throw err;
    //if (User.isValid) {
      var solrdoc = new helios.document();
      solrdoc.addField('id', uuid.v4());
      solrdoc.addField('forum', forum);
      solrdoc.addField('thread', thread);
      solrdoc.addField('thread_id', thread_id);
      solrdoc.addField('post', post_text);
      solrdoc.addField('ip_address', ip_address);
      solrdoc.addField('author', username);
      solrdoc.addField('thread_author', thread_id?username:'');
      solrdoc.addField('last_modified', moment().toISOString());

      self.solr_client.addDoc(solrdoc, true, function (err) {
        return callback(err, thread_id);
      });
    //} else {
      //return callback("username and password not authorized to post")
    //}
  //});
};

ForumService.prototype.getThreadAuthorByThreadId = function(thread_id, callback) {
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
      for (var i=0; i<threadList.length; i++) {
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

  if (!forum) {
    return callback('Forum not specified', null);
  } else {
    var fq = '+forum:\"' + forum + '\"';

    self.solr_client.select({
      fq: fq,
      rows: 0,
      'stats': 'true',
      'stats.field': 'last_modified',
      'stats.facet': ['thread','thread_id'],
      wt: 'json',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      var results = solrStatsToThreadList(JSON.parse(res), startPage, pageSize, forum);
      self.solr_client.select({
        fq: fq,
        rows: 0,
        'facet': 'true',
        'facet.pivot': 'thread_id,thread_author',
        'facet.limit': 200000,
        wt: 'json',
        q: '*:*'
      }, function (err, res) {
        if (err) throw err;
        res = JSON.parse(res);
        var thread_facets = res.facet_counts.facet_pivot;
        for (key in thread_facets) {
          if (thread_facets.hasOwnProperty(key)) {
            for (var i=0; i<results.docs.length; i++) {
              var result = _.find(thread_facets[key], function (val) {
                return (val.value &&(val.value == results.docs[i].thread_id));
              });
              if (result && result.pivot[0]) results.docs[i].thread_author = result.pivot[0].value;
            }
          }
        }
        return callback(null, results);
      });
    });
  }
} // end listThreadsByForum




function solrStatsToThreadList(res, startPage, pageSize, forum) {
  var thread_facets = res.stats.stats_fields.last_modified.facets.thread;
  var threadid_facets = res.stats.stats_fields.last_modified.facets.thread_id;
  var threadCount = -1;
  var threadList = [];
  var results = {};
  var self = this;

  for (key in thread_facets) {
    if (thread_facets.hasOwnProperty(key)) {
      threadList.push({
        'name':key,
        'forum': forum,
        'count':thread_facets[key].count,
        'last_modified':(thread_facets[key].max?thread_facets[key].max:new Date('7/4/1776').toDateString()),
        'orig_stats':thread_facets[key]
      });
    }
  }

  var startIndex = (startPage-1)*pageSize;
  var endIndex = ((startIndex + pageSize)<threadList.length) ? startIndex + pageSize : threadList.length;

  //use this as the compare function
  threadList = threadList.sort(function (a,b) {
    if (a.last_modified > b.last_modified)
      return -1;
    if (a.last_modified < b.last_modified)
      return 1;
    return 0;
  });

  threadCount = threadList.length;

  threadList = threadList.slice(startIndex, endIndex);

  for (var i=0; i<threadList.length; i++){
    threadList[i].thread_id = findMatchFromDataNode(threadList[i].orig_stats, threadid_facets);
    delete threadList[i].orig_stats;
  }
  results.threadCount = threadCount;
  results.docs = threadList;
  return results;

  function findMatchFromDataNode(node, id_facets) {
    var intCount = 0;
    for (key in id_facets) {

      if (id_facets.hasOwnProperty(key)) {
        if (
          (id_facets[key].min === node.min) &&
            (id_facets[key].max === node.max) //&&
            //(id_facets[key].count === node.count) &&
            //(id_facets[key].missing === node.missing) &&
            //(id_facets[key].sum === node.sum) &&
            //(id_facets[key].mean === node.mean) &&
            //(id_facets[key].sumOfSquares === node.sumOfSquares)
          )return key;
      }
    }
  }
}


ForumService.prototype.listMostRecentPostsByForum = function(forum, pageSize, callback) {
  var self = this;

  if (!forum) {
    return callback({message:'Forum not specified'}, []);
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

ForumService.prototype.listPostsByThreadId = function(forum, threadId, startPage, pageSize, callback) {
  var self = this;
  var startIndex = (startPage-1)*pageSize;

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


ForumService.prototype.listPostsByThread = function(forum, thread, startPage, pageSize, callback) {
  var self = this;
  var startIndex = (startPage-1)*pageSize;

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

function solrResponseToPostList(res){
  var postList = res.response.docs;
  for (var i=0; i<postList.length; i++) {
    if (postList[i].post) {
      postList[i].post = postList[i].post.replace(/\n/g, '<br>');
    }
  }
  return postList;
}
// export the class

module.exports = ForumService;

