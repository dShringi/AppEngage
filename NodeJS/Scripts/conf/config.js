var config = {};

config.server = {};
config.server.host = 'localhost';
config.server.port = '8000';

config.mongodb = {};
config.mongodb.url = 'mongodb://localhost/appengage';
config.mongodb.port = process.env.MONGODB_PORT || '27017';

config.kafka = {};
config.kafka.default = 'unregistered';

config.log = {};
config.log.level = 'debug';
config.log.dir = 'D:/mobile-analytics/NodeJS/Logs'

module.exports = config;