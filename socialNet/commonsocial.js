var http = require('http');
var https = require('https');
var url = require('url');
var crypto = require('crypto');
var querystring = require('querystring');
var util = require('util');
var needle = require('needle');
var fs = require('fs');



// perform action 
exports.action = function(req, res) {
    var action = req.body.action;
    // if called for login action
    if (action == 'Login') {
        Oauthstep1(req, res);

    } else
    // perform specified action 
    // to do remove
        Oauthstep3(req, res);
}

// getting code from redirect url
exports.social_code = function(req, res) {
    var network = req.params.network;
    console.log(network);
    var queryObject = url.parse(req.url, true).query;
    if (!queryObject.code) {
        // STEP 1 - If this is the first run send them to LinkedIn for Auth
        OauthStep1(req, res);
    } else {
        // STEP 2 - If they have given consent and are at the callback do the final token request
        Oauthstep2(req, res, queryObject.code, network);
    }
}


var Oauthstep1 = function(req, res) {
    console.log("step1-common");
    var network = req.body.network;
    var configuration = JSON.parse(fs.readFileSync(__dirname + "/network_config.json", "utf8"));
    if (configuration[network]) {
        res.writeHead(302, {
            'Location': configuration[network]['URL1'] + 'client_id=' + configuration[network]['client_id'] + '&redirect_uri=' + configuration[network]['redirect_uri'] + '&scope=' + configuration[network]['scope'] + '&state=RNDM_' + RandomState(18)
        });
        res.end();
    } else
        res.json({
            'Error': 'Specify the network.'
        });

}

var Oauthstep2 = function(req, res, code, network) {
    console.log("step2" + network + ":" + code);
    var configuration = JSON.parse(fs.readFileSync(__dirname + "/network_config.json", "utf8"));
    if (configuration[network]) {

        needle.get(configuration[network]['URL2'] + code + '&client_id=' + configuration[network]['client_id'] + '&client_secret=' + configuration[network]['client_secret'] + '&redirect_uri=' + configuration[network]['redirect_uri'],
            function(error, response) {
                if (!error && response.statusCode == 200) {
                    //console.log(response.body.access_token
                    // to do from json
                    access_token = (network == 'Facebook') ? response.body.toString().split('&')[0].split('=')[1] : response.body.access_token;
                    //access_token = JSON.parse(response).access_token;
                    console.log("## access_token ::" + network + " -> " + access_token); // save access_token -- 
                    if (!req.session.data) req.session.data = {};
                    req.session.data[network] = access_token;
                    console.log(req.session.data);
                    res.redirect("/");
                } else {
                    res.json({
                        'Error': error
                    });
                }
            });

    }
}

var Oauthstep3 = function(request, response) {
    console.log("Step3");
    try {
        var apicall = request.body.action;
        var network = request.body.network;
        var access_token = request.session.data[network];
        console.log(request.session.data);
        console.log(access_token);
    } catch (e) {
        console.log("error");
    }
    var configuration = JSON.parse(fs.readFileSync(__dirname + "/network_config.json", "utf8"));
    if (configuration[network] && apicall && access_token) {
        var path = configuration[network]['URL3'] + configuration[network]['Action'][apicall] + configuration[network]['access_token'] + access_token;
        console.log(path);
        needle.get(path, function(error, fbres) {
            if (!error && fbres.statusCode == 200) {
                response.json(fbres.body);
                //response.end();
            } else {
                console.log("Error :: " + error);
                response.json({
                    "Error": 'Not found'
                });
            }

        });
    } else response.json({
        "Error": 'Please follow up with Login step.'
    });


}

var RandomState = function(howLong) {
    howLong = parseInt(howLong);
    if (!howLong || howLong <= 0) {
        howLong = 18;
    }
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    for (var i = 0; i < howLong; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
