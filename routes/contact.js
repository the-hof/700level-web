var nodemailer = require("nodemailer");
var config = require('./config')

function getParamFromPOST(post_param) {
  if (post_param) return post_param;
  return '';
}

exports.sendMessage = function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  var returnMessage = '';
  var returnCode = 'OK';

  var from = getParamFromPOST(req.param('from'));
  var email = getParamFromPOST(req.param('email'));
  var subject = getParamFromPOST(req.param('subject'));
  var message = getParamFromPOST(req.param('message'));

  if (!from) returnMessage += "reply-to name not supplied";
  if (!email) returnMessage += "email address not supplied";
  if (!subject) returnMessage += "subject not supplied";
  if (!message) returnMessage += "message not supplied";

  if (!returnMessage) {
    var messageText = '';
    var transport = nodemailer.createTransport("SMTP", {
      service: "Gmail",
      auth: config.contact.auth
    });

    message = message + '\n\nreply-to: ' + email;

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: from + "<" + email + ">", // sender address
      to: config.contact.contact_recipient, // list of receivers
      subject: "[700level contact] " + subject, // Subject line
      text: message, // plaintext body
      html: message // html body
    }

    // send mail with defined transport object
    transport.sendMail(mailOptions, function(error, response){
      if(error){
        returnMessage += error;
        console.log(error);
      }else{
        returnMessage += "Message sent";
        console.log("Message sent: " + response.message);
      }
      res.send(JSON.stringify({status:returnCode, message:returnMessage}));
      transport.close(); // shut down the connection pool, no more messages

    });


  } else {
    //API params invalid, return error code
    returnCode = 'error';

    res.send(JSON.stringify({status:returnCode, message:returnMessage}));
  }

}