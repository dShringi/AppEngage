//TODO Clustering https://nodejs.org/api/cluster.html
//node --optimize_for_size --max_old_space_size=460 --gc_interval=100 server.js
'use strict'
var Hapi = require('hapi');
var server = new Hapi.Server();

var config = require('./conf/config.js');
var logger = require('./conf/log.js');
var routes = require('./routes');
var Kafka = require('kafka-node');
var Producer = Kafka.Producer;
var client = new Kafka.Client(config.consumer.url);
var producer = new Producer(client);

// HTTP Server connection
server.connection({ host: config.server.host,  port: config.server.port  });

// Initialize Restful routes
routes.init(server, producer);

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
