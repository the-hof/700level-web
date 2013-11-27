var helios = require('helios');
var uuid = require('node-uuid');

var level_username = '';
var level_password = '';
var level_email_address = '';

// constructor
function User(username, password, email_address) {
  level_username=username;
  level_password=password;
  level_email_address=email_address;
}


// class methods
User.prototype.save= function (callback) {
  var solr_client = new helios.client({
    host : 'localhost', // Insert your client host
    port : 8983,
    path : '/solr/700level_admin', // Insert your client solr path
    timeout : 5000  // Optional request timeout
  });

  var solrdoc = new helios.document();
  solrdoc.addField('id', uuid.v4());
  solrdoc.addField('username', level_username);
  solrdoc.addField('hashed_password', level_password);
  solrdoc.addField('email_address', level_email_address);
  solrdoc.addField('admin_datatype', 'User');

  solr_client.addDoc(solrdoc, true, callback);

};

// export the class

module.exports = User;

