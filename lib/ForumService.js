"use strict";

var helios = require('helios');
var uuid = require('node-uuid');
var UserService = require('./UserService');
var moment = require('moment');
var underscore = require('underscore');
var config = require('../routes/config.js');

//////////////////////////////////////////////////
// helper functions
//////////////////////////////////////////////////
function getThreadCountFromSolrResponse(res) {
    var threadCount = res.grouped.thread.ngroups;
    return threadCount;
}

function getPostCountFromSolrResponse(res) {
    var postCount = res.response.numFound;
    return postCount;
}

function solrResponseToPostList(res) {
    var i, postList = res.response.docs;
    for (i = 0; i < postList.length; i = i + 1) {
        if (postList[i].post) {
            postList[i].post = postList[i].post.replace(/\n/g, '<br>');
        }
    }
    return postList;
}

//////////////////////////////////////////////////
// ForumService
//////////////////////////////////////////////////
function ForumService() {
    this.solr_client = new helios.client(config.forum_connection);
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

ForumService.prototype.search = function (searchTerm, pageSize, startPage, callback) {
    if (searchTerm) {
        var q, qf, defType, mm, self, startIndex;
        q = searchTerm;
        qf = 'thread_name^2 post';
        defType = 'edismax';
        mm = '100'; // setting mm=100 is the same as q.op = AND
        self = this;
        startIndex = (startPage - 1) * pageSize;

        self.solr_client.select({
            q: q,
            wt: 'json',
            qf: qf,
            start: startIndex,
            mm: mm,
            defType: defType,
            rows: pageSize,
            stopwords: true,
            lowercaseOperators: true
        }, function (err, res) {
            if (err) {
                throw err;
            }
            var result = solrResponseToPostList(JSON.parse(res));
            return callback(err, result);
        });
    }
};

ForumService.prototype.deleteThread = function (username, password, forum, thread, callback) {
    var user = new UserService(), self = this;

    user.getByUsernamePassword(username, password, function (err, User) {
        if (err) {
            throw err;
        }
        if (!User.isAdmin) {
            return callback('username and password not authorized to delete');
        }
        var delete_query = '+forum:\"' + forum + '\" AND +thread:\"' + thread + '\"';

        self.solr_client.deleteDocByQuery(delete_query, true, 0, function (res) {
            if (res && (res.indexOf("There are no documents to delete.") !== -1)) {
                return callback(null);
            }
            return callback(res);
        });
    });
};

ForumService.prototype.savePost = function (username, forum, thread, thread_id, post_text, ip_address, callback) {
    var self = this, solrdoc = new helios.document();

    var banned = false;
    for (var i=0; i<config.banned_ip.ip.length; i++)
    {
        if (config.banned_ip.ip[i] == ip_address)
        {
            banned = true;
            console.log('banned attempt from ip ' + ip_address + ' by user ' + username);
        }
    }


    if (!banned) {
        if (!thread_id) {
            thread_id = uuid.v4();
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
                if (err) {
                    throw err;
                }
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
            });
        }
    }
    else {
        return callback(null, null);
    }
};

ForumService.prototype.getThreadDetailsByThreadId = function (thread_id, callback) {
    var self = this, fq, i, threadList, thread_author, thread;
    if (!thread_id) {
        callback({message: 'no thread id supplied'}, '');
    } else {
        fq = '+thread_id:\"' + thread_id + '\"';
        self.solr_client.select({
            fq: fq,
            sort: 'last_modified asc',
            wt: 'json',
            fl: 'thread_author, thread',
            q: '*:*'
        }, function (err, res) {
            if (err) {
                throw err;
            }
            res = JSON.parse(res);
            threadList = res.response.docs;
            thread_author = 'unknown';
            thread = 'unknown';
            for (i = 0; i < threadList.length; i = i + 1) {
                if (threadList[i].thread_author) {
                    thread_author = threadList[i].thread_author;
                    thread = threadList[i].thread;
                    break;
                }
            }
            callback(err, thread_author, thread);
        });
    }
};

ForumService.prototype.getThreadAuthorByThreadId = function (thread_id, callback) {
    var self = this, fq, threadList, thread_author, i;
    if (!thread_id) {
        callback({message: 'no thread id supplied'}, '');
    } else {
        fq = '+thread_id:\"' + thread_id + '\"';
        self.solr_client.select({
            fq: fq,
            sort: 'last_modified asc',
            wt: 'json',
            fl: 'thread_author',
            q: '*:*'
        }, function (err, res) {
            if (err) {
                throw err;
            }
            res = JSON.parse(res);
            threadList = res.response.docs;
            thread_author = 'unknown';
            for (i = 0; i < threadList.length; i = i + 1) {
                if (threadList[i].thread_author) {
                    thread_author = threadList[i].thread_author;
                    break;
                }
            }
            callback(err, thread_author);
        });
    }
};

ForumService.prototype.listThreadsByForum = function (forum, startPage, pageSize, callback) {
    var self = this, startIndex, postList, results, threadList, fq, i;
    startIndex = (startPage - 1) * pageSize;

    if (!forum) {
        return callback('Forum not specified', null);
    }
    fq = '+forum:\"' + forum + '\"';

    self.solr_client.select({
        fq: fq,
        rows: pageSize,
        start: startIndex,
        'group': 'true',
        'group.field': 'thread',
        'group.ngroups': 'true',
        sort: 'last_modified desc',
        wt: 'json',
        q: '*:*'
    }, function (err, res) {
        if (err) {
            throw err;
        }
        res = JSON.parse(res);
        postList = res.grouped.thread.groups;
        results = {};
        threadList = [];

        for (i = 0; i < postList.length; i = i + 1) {
            threadList.push({
                'name': postList[i].groupValue,
                'forum': postList[i].doclist.docs[0].forum,
                'count': postList[i].doclist.numFound,
                'last_modified': postList[i].doclist.docs[0].last_modified,
                'thread_id': postList[i].doclist.docs[0].thread_id,
                'thread_author': postList[i].doclist.docs[0].thread_author,
                'last_poster': postList[i].doclist.docs[0].author
            });
        }

        results.threadCount = getThreadCountFromSolrResponse(res);
        results.docs = threadList;
        return callback(null, results);
    });
};


ForumService.prototype.listMostRecentPostsByForum = function (forum, pageSize, callback) {
    var self = this, fq;

    if (!forum) {
        return callback({message: 'Forum not specified'}, []);
    }
    fq = '+forum:\"' + forum + '\"';

    self.solr_client.select({
        fq: fq,
        sort: 'last_modified desc',
        wt: 'json',
        rows: pageSize,
        q: '*:*'
    }, function (err, res) {
        if (err) {
            throw err;
        }
        var result = solrResponseToPostList(JSON.parse(res));
        return callback(err, result);
    });
};

ForumService.prototype.listPostsByThreadId = function (forum, threadId, startPage, pageSize, callback) {
    var self = this, startIndex, fq, result;
    startIndex = (startPage - 1) * pageSize;

    if (!forum || !threadId) {
        return callback('Forum or thread not specified', null);
    }
    fq = '+forum:\"' + forum + '\" +thread_id:\"' + threadId + '\"';

    self.solr_client.select({
        fq: fq,
        sort: 'last_modified asc',
        start: startIndex,
        rows: pageSize,
        wt: 'json',
        q: '*:*'
    }, function (err, res) {
        if (err) {
            throw err;
        }
        result = {};
        result.postCount = getPostCountFromSolrResponse(JSON.parse(res));
        result.docs = solrResponseToPostList(JSON.parse(res));
        return callback(err, result);
    });
};


ForumService.prototype.listPostsByThread = function (forum, thread, startPage, pageSize, callback) {
    var self = this, startIndex, fq, result;
    startIndex = (startPage - 1) * pageSize;

    if (!forum || !thread) {
        return callback('Forum or thread not specified', null);
    }
    fq = '+forum:\"' + forum + '\" +thread:\"' + thread + '\"';

    self.solr_client.select({
        fq: fq,
        sort: 'last_modified asc',
        start: startIndex,
        rows: pageSize,
        wt: 'json',
        q: '*:*'
    }, function (err, res) {
        if (err) { throw err; }
        result = {};
        result.docs = solrResponseToPostList(JSON.parse(res));
        return callback(err, result);
    });
};

// export the class
module.exports = ForumService;

