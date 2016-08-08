var winston = require('winston');
var config = require('./config.js');

var logger = new (winston.Logger)({
  transports: [
//    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: config.logdir + '/debug.log', json: false })
  ],
  exceptionHandlers: [
//    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: config.logdir + '/exceptions.log', json: false })
  ],
  exitOnError: false
});

module.exports = logger;