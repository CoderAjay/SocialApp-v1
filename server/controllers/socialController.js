var querystring = require('querystring');

exports.postSocial = function(req, res) {

  res.redirect( 
   'https://www.facebook.com/dialog/oauth?' + querystring.stringify(this.mergeObject({
    client_id: '772927109397599',
    redirect_uri: 'localhost:3000', // possibly overwritten
    
  }))
   );
};
