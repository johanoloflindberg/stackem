#!/bin/env node
var express = require('express');
var bodyParser = require('body-parser');
var validateEntry = require('./validate');
var submitEntry = require('./submit').addEntry;
var drawTime = process.env.YOW_DRAW || '3.30pm on Friday';

var StackEm = function () {

    var self = this;

    self.setupVariables = function () {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    self.terminator = function (sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    self.setupTerminationHandlers = function (){
        process.on('exit', function () { self.terminator(); });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    self.createRoutes = function () {
        self.routes = { };

        //TODO add auth 
        self.routes['/blocks'] = function (req, res) {
            if (!req.body) return res.sendStatus(400);
            var result = validateEntry(req.body);
            if (result == 'invalid') {
                return res.sendStatus(400);
            } else {
                return res.status(200).send(result);
            }
        };

         self.routes['/entry'] = function (req, res) {
             var result = submitEntry(req.body.name, req.body.company, req.body.email, req.body.entry);
             if (result.result == 'invalid') {
                 res.status(400).render('error', { error: result.error });
             } else if (result.result == 'unique') {
                 res.status(200).render('result', { unique: 'unique', chances: 'two chances', draw: drawTime });
             } else {
                 res.status(200).render('result', { unique: 'not unique', chances: 'one chance', draw: drawTime });
             }
        };
    };

    self.initializeServer = function () {
        self.app = express();
        self.createRoutes();
        self.app.use(express.static(__dirname + '/public'));
        self.app.set('views', __dirname + '/views')
        self.app.set('view engine', 'jade')
        var jsonParser = bodyParser.json();
        var urlEncodedParser = bodyParser.urlencoded({ extended: false});
        self.app.post('/blocks', jsonParser, self.routes['/blocks']);
        self.app.post('/entry', urlEncodedParser, self.routes['/entry']);
    };

    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();
        self.initializeServer();
    };

    self.start = function () {
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };
}; 

var app = new StackEm();
app.initialize();
app.start();
