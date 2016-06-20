'use strict'

var Hapi = require('hapi');
var Kafka = require('kafka-node');
var Producer = Kafka.Producer;
var Mongoose = require('mongoose');

var logger = require('./conf/log.js');
var routes = require('./routes');
var config = require('./conf/config.js');

var server = new Hapi.Server();
var client = new Kafka.Client();
var producer = new Producer(client);
var table = server.table();

// HTTP Server connection
server.connection({ host: config.server.host,  port: config.server.port  });

// Mongo Connect
Mongoose.connect('mongodb://localhost/appengage');

//producer.init().then(function(){
//    logger.info("Kafka producer ready.");
//})

// Initialize Restful routes
routes.init(server, producer);

server.start((err) => {
    logger.info('Server started at: ' + server.info.uri);
});


// Default Route
server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply){
        console.log(table);
        logger.info(table)
		return reply({'message':'Welcome to AppEngage!'});
	}
});