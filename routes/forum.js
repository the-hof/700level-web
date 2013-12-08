var ForumService = require('../lib/ForumService');

/*
 * GET most recent
 */

exports.mostRecent = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var forumService = new ForumService();
  var forum = 'Nose Bleeds';
  forumService.listPostsByForum(forum, 5, function (err, postList) {
    if (err) throw err;
    res.end(JSON.stringify(postList, null, 2));
  });

};