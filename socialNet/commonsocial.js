var http = require('http');
var https = require('https');
var url = require('url');
var crypto = require('crypto');
var querystring = require('querystring');
var util = require('util');
var fs = require('fs');
var needle = require('needle');



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
            'Location': configuration[network]['URL1'] + 'client_id=' + configuration[network]['data']['client_id'] + '&redirect_uri=' + configuration[network]['data']['redirect_uri'] + '&scope=' + configuration[network]['options']['scope'] + '&state=RNDM_' + RandomState(18)
        });
        res.end();
    } else
        res.json({
            'Error': 'Specify the network.'
        });

}
 
var Oauthstep2 = function(request, response, code, network) {
    console.log("step2" + network + ":" + code);
    var configuration = JSON.parse(fs.readFileSync(__dirname + "/network_config.json", "utf8"));
    if (configuration[network]) {
        var options = configuration[network]['options'];
        if (options['method'] == "POST") {
            var data = configuration[network].data;
            data['code'] = code;
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(querystring.stringify(data))
            }

            options['headers'] = headers;
            console.log(options);
            console.log(data);
        }
        else
            options.path = options.path+code;
        console.log(options);
        var req = https.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function(data) {
                 console.log('BODY------------------------: ' + data);
                 var access_token = (network == 'Facebook') ? data.toString().split('&')[0].split('=')[1] : JSON.parse(data).access_token;
                 console.log("## access_token ::" + network + " -> "); // save access_token -- 
                 if (!request.session.data) request.session.data = {};
                  request.session.data[network] = access_token;
                  console.log(request.session.data);
                  response.redirect("/");
                 
            });
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            response.redirect("/");
        });
        /*if (configuration[network]['options']['method'] == "POST")
            req.write(querystring.stringify(data));
        */req.end();
    } else
        console.log("not found in json file");
}




/*   if (configuration[network]) {
        var options = {
            host: configuration[network]['host'],
            port: 443,
            path: (configuration[network]['method'] == "POST") ? configuration[network]['URL2'] : configuration[network]['URL2'] + code + '&client_id=' + configuration[network]['client_id'] + '&client_secret=' + configuration[network]['client_secret'] + '&redirect_uri=' + configuration[network]['redirect_uri'],
            method: configuration[network]['method']
            //"https://www.linkedin.com/uas/oauth2/accessToken?grant_type=authorization_code&code=" + code + "&redirect_uri=" + callbackURL + "&client_id=" + APIKey + "&client_secret=" + APIKeySecret
        };
        var data = {};

        if (configuration[network]['method'] == "POST") {
            data['client_id'] = configuration[network]['client_id'];
            data['client_secret'] = configuration[network]['client_secret'];
            data['code'] = code;
            data['redirect_uri'] = configuration[network]['redirect_uri'];
            data['grant_type'] = configuration[network]['grant_type'];
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(querystring.stringify(data))
            }
            options['headers'] = headers;
        }

        var req = https.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function(data) {
                console.log('BODY: ' + data);
                 var access_token = (network == 'Facebook') ? data.toString().split('&')[0].split('=')[1] : (data);
                 console.log("## access_token ::" + network + " -> " + access_token); // save access_token -- 
                //if (!request.session.data) request.session.data = {};
                //request.session.data[network] = access_token;
                //console.log(request.session.data);
                     req.end();
                 response.redirect("/");
            });
       
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            response.redirect("/");
        });
        if (configuration[network]['method'] == "POST")
            req.write(querystring.stringify(data));
        req.end();

    }*/


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
        var path = configuration[network]['URL3'] + configuration[network]['Action'][apicall] + configuration[network]['data']['access_token'] + access_token;
        console.log(path);
        needle.get(path, function(error, fbres) {
            if (!error && fbres.statusCode == 200) {
                response.json(fbres.body);
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
