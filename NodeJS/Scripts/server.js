'use strict'

var Hapi = require('hapi');
var server = new Hapi.Server();

var config = require('./conf/config.js');
var logger = require('./conf/log.js');
var routes = require('./routes');

var Kafka = require('kafka-node');
var Producer = Kafka.Producer;
var client = new Kafka.Client();
var producer = new Producer(client);

// HTTP Server connection
server.connection({ host: config.server.host,  port: config.server.port  });

// Initialize Restful routes
routes.init(server, producer);

server.start((err) => {
    logger.info('Server started at: ' + server.info.uri);
});