var ForumService = require('../lib/ForumService');

/*
 * GET most recent
 */

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

exports.listThreadsByForum = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  forumService.listThreadsByForum(forum, 1, 25, function(err, threadList) {
    if (err) throw err;
    res.end(JSON.stringify(threadList, null, 2));
  })
}

exports.mostRecent = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = getSolrForumFromQueryString(req.query.forum);
  forumService.listPostsByForum(forum, 5, function (err, postList) {
    if (err) throw err;
    res.end(JSON.stringify(postList, null, 2));
  });

};