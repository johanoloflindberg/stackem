#!/bin/env node
var express = require('express');
var bodyParser = require('body-parser');

var StackEm = function() {

    var self = this;

    self.setupVariables = function() {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    self.setupTerminationHandlers = function(){
        process.on('exit', function() { self.terminator(); });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    self.createRoutes = function() {
        self.routes = { };

        //TODO add password protection
        self.routes['/blocks'] = function(req, res) {
            if (!req.body) return res.sendStatus(400);
            var blocks = req.body; 
            //TODO validate entry and produce id 
            console.log(blocks);
            res.status(200).send("foobarbaz");
        };

         self.routes['/entry'] = function(req, res) {
            var name = req.body.name; 
            var company = req.body.company; 
            var email = req.body.email; 
            var entry = req.body.entry; 
            //TODO test if unique or not and send appropriate response
            //error if already entered
            // make sure all params present including submission - make sure it's valid
            // enter in database, with one or two entries depending
            // serve appropriate response page
            console.log(name + " " + company + " " + email + " " + entry);
            res.status(200).send("unique");
        };
     };

    self.initializeServer = function() {
        self.app = express();
        self.createRoutes();
        self.app.use(express.static(__dirname + '/public'));
        var jsonParser = bodyParser.json();
        var urlEncodedParser = bodyParser.urlencoded({ extended: false});
        self.app.post('/blocks', jsonParser, self.routes['/blocks']);
        self.app.post('/entry', urlEncodedParser, self.routes['/entry']);
    };

    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();
        self.initializeServer();
    };

    self.start = function() {
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };
}; 

var app = new StackEm();
app.initialize();
app.start();
