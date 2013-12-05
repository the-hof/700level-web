var helios = require('helios');
var uuid = require('node-uuid');
var UserService = require('./UserService');
var moment = require('moment');

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

ForumService.prototype.savePost = function (username, password, forum, thread, post_text, ip_address, callback) {
  var self = this;

  var user = new UserService();
  user.getByUsernamePassword(username, password, function (err, User) {
    if (err) throw err;
    if (User.isValid) {
      var solrdoc = new helios.document();
      solrdoc.addField('id', uuid.v4());
      solrdoc.addField('forum', forum);
      solrdoc.addField('thread', thread);
      solrdoc.addField('post', post_text);
      solrdoc.addField('ip_address', ip_address);
      solrdoc.addField('author', username);
      solrdoc.addField('last_modified', moment().toISOString());

      self.solr_client.addDoc(solrdoc, true, callback);
    } else {
      return callback("username and password not authorized to post")
    }
  });
};

ForumService.prototype.listPostsByForum = function(forum, numberOfPostsToGet, callback) {
  var self = this;

  if (!forum) {
    return callback({message:'Forum not specified'}, []);
  } else {
    var fq = '+forum:\"' + forum + '\"';

    self.solr_client.select({
      fq: fq,
      sort: 'last_modified asc',
      wt: 'json',
      rows: numberOfPostsToGet,
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      var result = solrResponseToPostList(JSON.parse(res));
      return callback(err, result);
    });
  }
}

ForumService.prototype.listThreadsByForum = function(forum, callback) {
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
      'stats.facet': 'thread',
      wt: 'json',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      var result = solrStatsToThreadList(JSON.parse(res));
      return callback(err, result);
    });
  }
}

ForumService.prototype.listPostsByThread = function(forum, thread, callback) {
  var self = this;

  if (!forum || !thread) {
    return callback('Forum or thread not specified', null);
  } else {

    var fq = '+forum:\"' + forum + '\" +thread:\"' + thread + '\"';

    self.solr_client.select({
      fq: fq,
      sort: 'last_modified asc',
      wt: 'json',
      q: '*:*'
    }, function (err, res) {
      if (err) throw err;
      var result = solrResponseToPostList(JSON.parse(res));
      return callback(err, result);
    });
  }
}

function solrStatsToThreadList(res) {
  var facets = res.stats.stats_fields.last_modified.facets.thread;
  var threadList = [];
  for (key in facets) {
    if (facets.hasOwnProperty(key)) {
      threadList.push({
        'name':key,
        'count':facets[key].count,
        'last_modified':(facets[key].max?facets[key].max:new Date('7/4/1776').toDateString())
      });
    }
  }

  //use this as the compare function
  return threadList.sort(function (a,b) {
    if (a.last_modified < b.last_modified)
      return -1;
    if (a.last_modified > b.last_modified)
      return 1;
    return 0;
  });
}

function solrResponseToPostList(res){
  return res.response.docs;
}
// export the class

module.exports = ForumService;

