'use strict'

var Hapi = require('hapi');
var logger = require('./log.js');
var config = require('./config.js');
var server = new Hapi.Server();

server.connection({ host: config.server.host,  port: config.server.port  });

server.start((err) => {
    logger.info('Server started at: ' + server.info.uri);
});

server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply){
		return reply({'message':'Welcome to AppEngage!'});
	}
});