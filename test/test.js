var request = require('superagent');
var expect = require('expect.js');


describe('Home Page', function () {
  it('should exist', function (done) {
    request
      .get('localhost:3000', function (error, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('700Level');
        done();
      });
  });
});



