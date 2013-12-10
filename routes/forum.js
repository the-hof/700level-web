var ForumService = require('../lib/ForumService');

/*
 * GET most recent
 */

function getIntFromQueryString(url_int) {
  var retInt = null;
  if (url_int) retInt = parseInt(url_int);

  return retInt;
}

function getSolrForumFromQueryString(url_forum) {
  var solr_forum = 'Nose Bleeds';
  if (url_forum) {
    switch(url_forum) {
      case 'nosebleeds': solr_forum = 'Nose Bleeds'; break;
      case 'Nosebleeds': solr_forum = 'Nose Bleeds'; break;
      case 'thebleeds': solr_forum = 'Nose Bleeds'; break;
      case 'concourse': solr_forum = 'Concourse'; break;
      case 'parkinglot': solr_forum = 'Parking Lot'; break;
      default: solr_forum = url_forum;
    }
  }
  return solr_forum;
}

function getSolrThreadFromQueryString(url_thread) {
  if (url_thread) return url_thread;
  return '';
}

exports.listThreadsByForum = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  forumService.listThreadsByForum(forum, 1, 25, function(err, threadList) {
    if (err) throw err;
    res.end(JSON.stringify(threadList, null, 2));
  })
};

function stringifyPosts(key, value) {
  switch(key) {
    case 'ip_address': return undefined; break;
    case '_version_': return undefined; break;
    default: return value; break;
  }
}

exports.mostRecent = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  forumService.listMostRecentPostsByForum(forum, 5, function (err, postList) {
    if (err) throw err;
    res.end(JSON.stringify(postList, stringifyPosts, 2));
  })
};

exports.listPostsByThread = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  var thread = getSolrThreadFromQueryString(req.query.thread);
  var startPage = getIntFromQueryString(req.query.startPage);
  var pageSize = getIntFromQueryString(req.query.pageSize);

  forumService.listPostsByThread(forum, thread, startPage, pageSize, function (err, threadList) {
    if (err) throw err;
    res.end(JSON.stringify(threadList, stringifyPosts, 2));
  })
};