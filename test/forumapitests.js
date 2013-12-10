var request = require('superagent');
var expect = require('expect.js');


describe('List Most Recent Posts By Thread API call', function () {
  var testURL = 'localhost:3000/v1/forum/thread?forum=nosebleeds&thread=Eagles+-+Raiders&startPage=2&pageSize=25';
  it('should return 25 posts', function (done) {
    request
      .get(testURL, function (err, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);try {
          var postList = JSON.parse(res.text);
          expect(postList.length).to.equal(25);
          for (var i = 0; i < postList.length; i++) {
            expect(postList[i].id).to.be.ok();
            expect(postList[i].forum).to.be.ok();
            expect(postList[i].forum).to.equal('Nose Bleeds');
            expect(postList[i].thread).to.be.ok();
            expect(postList[i].post).to.be.ok();
            expect(postList[i].last_modified).to.be.ok();
            expect(postList[i].ip_address).to.not.be.ok();
            expect(postList[i]._version_).to.not.be.ok();
            if (i > 0) {
              var prior_post_time = postList[i - 1].last_modified;
              var this_post_time = postList[i].last_modified;
              expect(prior_post_time).to.be.lessThan(this_post_time);
            }
          }
          done();
        }
        catch (err) {
          done(err);
        }
      });
  });
})


describe('List Most Recent Threads By Forum API call', function () {
  it('should exist', function (done) {
    request
      .get('localhost:3000/v1/forum/', function (err, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should return a list of the 25 most recent nosebleeds threads by default', function (done) {
    request
      .get('localhost:3000/v1/forum/', function (err, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        try {
          var postList = JSON.parse(res.text);
          expect(postList.length).to.equal(25);
          for (var i=0; i<postList.length; i++) {
            expect(postList[i].name).to.be.ok();
            expect(postList[i].forum).to.equal('Nose Bleeds');
          }
          done();
        }
        catch (err) {
          done(err);
        }
      })
  })

  it('should return a list of the 25 most recent concourse threads', function (done) {
    request
      .get('localhost:3000/v1/forum/?forum=concourse', function (err, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        try {
          var postList = JSON.parse(res.text);
          expect(postList.length).to.equal(25);
          for (var i=0; i<postList.length; i++) {
            expect(postList[i].name).to.be.ok();
            expect(postList[i].forum).to.equal('Concourse');
          }
          done();
        }
        catch (err) {
          done(err);
        }
      })
  })
})


describe('List Most Recent Posts By Forum API call', function () {
  it('should exist', function (done) {
    request
      .get('localhost:3000/v1/forum/most_recent', function (error, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should return a list of 5 nosebleeds posts in json by default', function (done) {
    request
      .get('localhost:3000/v1/forum/most_recent', function (err, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        try {
          var postList = JSON.parse(res.text);
          expect(postList.length).to.equal(5);
          for (var i = 0; i < postList.length; i++) {
            expect(postList[i].id).to.be.ok();
            expect(postList[i].forum).to.be.ok();
            expect(postList[i].forum).to.equal('Nose Bleeds');
            expect(postList[i].thread).to.be.ok();
            expect(postList[i].post).to.be.ok();
            expect(postList[i].last_modified).to.be.ok();
            expect(postList[i].ip_address).to.not.be.ok();
            expect(postList[i]._version_).to.not.be.ok();
            if (i > 0) {
              var prior_post_time = postList[i - 1].last_modified;
              var this_post_time = postList[i].last_modified;
              expect(prior_post_time).to.be.greaterThan(this_post_time);
            }
          }
          done();
        }
        catch (err) {
          done(err);
        }
      })
  })

  it('should return a list of 5 concourse posts in json', function (done) {
    request
      .get('localhost:3000/v1/forum/most_recent?forum=concourse', function (err, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        try {
          var postList = JSON.parse(res.text);
          expect(postList.length).to.equal(5);
          for (var i = 0; i < postList.length; i++) {
            expect(postList[i].id).to.be.ok();
            expect(postList[i].forum).to.be.ok();
            expect(postList[i].forum).to.equal('Concourse');
            expect(postList[i].thread).to.be.ok();
            expect(postList[i].post).to.be.ok();
            expect(postList[i].last_modified).to.be.ok();
            expect(postList[i].ip_address).to.not.be.ok();
            expect(postList[i]._version_).to.not.be.ok();
            if (i > 0) {
              var prior_post_time = postList[i - 1].last_modified;
              var this_post_time = postList[i].last_modified;
              expect(prior_post_time).to.be.greaterThan(this_post_time);
            }
          }
          done();
        }
        catch (err) {
          done(err);
        }
      })
  })
});
