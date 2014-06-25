/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes');
var socialCtrl = require('./server/controllers/socialController.js');
var everyauth = require('everyauth');
var connect = require('connect');
var socialNet = require('./socialNet/commonsocial');
var url = require('url');
var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

//common 
app.get('/api/social/:network', socialNet.social_code); // call back from social networks redirect url with code
app.post('/api/social', socialNet.action); //login and other action for social networks

app.listen(3000, function() {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
