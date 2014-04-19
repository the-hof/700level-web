var ForumService = require('../lib/ForumService');

/*
 * GET most recent
 */

function wrapResponseInCallback(callbackQuerystring, responseText) {
  return getCallbackOpenFromQueryString(callbackQuerystring)
    + responseText
    + getCallbackCloseFromQueryString(callbackQuerystring);
}

function getCallbackOpenFromQueryString(url_callback) {
  var retStr = '';
  if (url_callback) retStr = url_callback + '(';
  return retStr;
}

function getCallbackCloseFromQueryString(url_callback) {
  var retStr = '';
  if (url_callback) retStr = ')';
  return retStr;
}

function getIntFromQueryString(url_int, default_value) {
  if (url_int) return parseInt(url_int, 10);

  return default_value;
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
      case 'ownersbox': solr_forum = 'Owners Box'; break;
      case 'tailgate': solr_forum = 'Tailgate'; break;
      default: solr_forum = url_forum;
    }
  }
  return solr_forum;
}

function getSolrThreadFromQueryString(url_thread) {
  if (url_thread) return url_thread;
  return '';
}

function getSolrThreadIdFromQueryString(url_threadid) {
  if (url_threadid) return url_threadid;
  return '';
}

function getQueryTermFromQueryString(url_queryterm) {
  if (url_queryterm) return url_queryterm;
  return '';
}

exports.search = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var q = getQueryTermFromQueryString(req.query.q);
  console.log(q);
  forumService.search(q, 25, 1, function (err, postList) {
    if (err) throw err;
    res.end(wrapResponseInCallback(req.query.callback, JSON.stringify(postList, stringifyPosts, 2)));
  })
}

exports.listThreadsByForum = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  var startPage = getIntFromQueryString(req.query.startPage,1);
  var pageSize = getIntFromQueryString(req.query.pageSize,25);

  forumService.listThreadsByForum(forum, startPage, pageSize, function(err, threadList) {
    if (err) throw err;
    res.end(wrapResponseInCallback(req.query.callback, JSON.stringify(threadList, null, 2)));
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
    res.end(wrapResponseInCallback(req.query.callback, JSON.stringify(postList, stringifyPosts, 2)));
  })
};

exports.listPostsByThread = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  var thread = getSolrThreadFromQueryString(req.query.thread);
  var threadId = getSolrThreadIdFromQueryString(req.query.threadId);
  var startPage = getIntFromQueryString(req.query.startPage, 1);
  var pageSize = getIntFromQueryString(req.query.pageSize, 25);
  if (threadId) {
    forumService.listPostsByThreadId(forum, threadId, startPage, pageSize, function (err, threadList) {
      if (err) throw err;
      res.end(wrapResponseInCallback(req.query.callback, JSON.stringify(threadList, stringifyPosts, 2)));
    })
  } else {
    forumService.listPostsByThread(forum, thread, startPage, pageSize, function (err, threadList) {
      if (err) throw err;
      res.end(wrapResponseInCallback(req.query.callback, JSON.stringify(threadList, stringifyPosts, 2)));
    })
  }
};

exports.addNewPost = function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  var threadId = getSolrThreadIdFromQueryString(req.query.threadId);
  var inputURL = req.body.inputURL;

  var postText = req.body.post;

  if ((inputURL) && (inputURL.length > 5)) {
    postText += '\n\n<a target="_blank" href="' + inputURL + '">yo, click it</a>';
  }

  if (req.isAuthenticated()) {
    var threadSubject = String(req.body.thread);
    if (threadSubject.length > 120) {
      threadSubject = threadSubject.substring(0,120);
    }
    forumService.savePost(req.user.username, forum, threadSubject, threadId, postText, '', function (err) {
        if (err) throw err;
        res.send(200);
    })

  } else {
    res.send(401);
  }
}