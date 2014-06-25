var assert = require("assert");
var needle = require("needle");
//var controllersocial = require('../../server/controllers/socialController.js');

beforeEach(function(done) {
    done()
});


describe('MyTest', function() {
  console.log("Testing begins");

    it('get controller ok', function(done) {
    	 console.log("Tesing api controller");

        needle.get('http://localhost:3000/api/social', function(err, res, body) {
        	console.log(body);
            assert.equal(err, null);
            assert.equal(typeof(body),"string");
            assert.equal(body, "hello");
            done()
        })

    });


    it('Posting data to socialController', function(done) {
    	 console.log("Tesing api controller to post data");
        var data = {
        	media :'fb',
        	action:'/me',
        	key:'12345678',
        	url:'/home'

        };
        needle.post('http://localhost:3000/api/social', data,function(err, res, body) {
         	console.log(body);
            assert.equal(err, null);
            //assert.equal();  
            done() 
             
        })

    });

});
