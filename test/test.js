var request = require('superagent');
var expect = require('expect.js');

describe('Suite one', function () {
  it('xyzzy', function (done) {
    request
      .get('localhost:3000', function (error, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('700Level');
        done();
      });
  });
});
