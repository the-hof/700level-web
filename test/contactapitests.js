var request = require('superagent');
var expect = require('expect.js');

describe('/v1/contact', function () {
  this.timeout(6000);
  it('should not send email without a reply-to name', function(done) {
    var testURL = 'http://localhost:3000/v1/contact';
    var testMessage = {
      from: 'Testov Testovsky',
      email: 'test@test.com',
      subject: 'your 700level email test failed',
      message: 'Test message.  It is full of the needful'
    }

    console.log('testing /v1/contact');
    testMessage.from = '';
    request
      .put(testURL)
      .set('Content-Type', 'application/json')
      .send(testMessage)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('error');
        done();
      });
  })

  it('should not send email without a reply-to email address', function(done) {
    var testURL = 'http://localhost:3000/v1/contact';
    var testMessage = {
      from: 'Testov Testovsky',
      email: 'test@test.com',
      subject: 'your 700level email test failed',
      message: 'Test message.  It is full of the needful'
    }

    testMessage.email = '';
    request
      .put(testURL)
      .set('Content-Type', 'application/json')
      .send(testMessage)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('error');
        done();
      });
  })

  it('should not send email without a subject', function(done) {
    var testURL = 'http://localhost:3000/v1/contact';
    var testMessage = {
      from: 'Testov Testovsky',
      email: 'test@test.com',
      subject: 'your 700level email test failed',
      message: 'Test message.  It is full of the needful'
    }

    testMessage.subject = '';
    request
      .put(testURL)
      .set('Content-Type', 'application/json')
      .send(testMessage)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('error');
        done();
      });
  })

  it('should not send email without a message', function(done) {
    var testURL = 'http://localhost:3000/v1/contact';
    var testMessage = {
      from: 'Testov Testovsky',
      email: 'test@test.com',
      subject: 'your 700level email test failed',
      message: 'Test message.  It is full of the needful'
    }

    testMessage.message = '';
    request
      .put(testURL)
      .set('Content-Type', 'application/json')
      .send(testMessage)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('error');
        done();
      });
  })

  it('should send email', function(done) {
    var testURL = 'http://localhost:3000/v1/contact';
    var testMessage = {
      from: 'Testov Testovsky',
      email: 'test@test.com',
      subject: 'your 700level email test worked',
      message: 'Test message.  It is full of the needful'
    }

    request
      .put(testURL)
      .set('Content-Type', 'application/json')
      .send(testMessage)
      .end(function (err, res) {
        if (err) throw err;
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('OK');
        done();
      });
  })
})