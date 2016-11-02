//TODO Clustering https://nodejs.org/api/cluster.html
//node --optimize_for_size --max_old_space_size=460 --gc_interval=100 server.js
'use strict';
const Hapi = require('hapi');
const server = new Hapi.Server();

const config = require('./conf/config.js');
const routes = require('./routes');
const Kafka = require('kafka-node');
const Producer = Kafka.Producer;
const client = new Kafka.Client(config.consumer.url);
const producer = new Producer(client);

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
