var config = {};

config.server = {};
config.server.host = 'localhost';
config.server.port = '8000';

config.mongodb = {};
config.mongodb.url = 'mongodb://localhost';
config.mongodb.port = process.env.MONGODB_PORT || '27017';

config.kafka = {};
config.kafka.default = 'unregistered';

config.log = {};
config.log.level = 'debug';
config.log.dir = 'D:/mobile-analytics/NodeJS/Logs';

config.consumer = {};
config.consumer.url = 'localhost:2181';

module.exports = config;