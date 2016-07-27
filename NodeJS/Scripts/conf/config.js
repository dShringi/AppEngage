var config = {};

config.server = {};
config.server.host = 'DWHBI-SRV1';
config.server.port = '8000';

config.mongodb = {};
config.mongodb.url = 'mongodb://DWHBI-SRV3/appengage';
config.mongodb.port = process.env.MONGODB_PORT || '27017';

config.kafka = {};
config.kafka.default = 'unregistered';

config.log = {};
config.log.level = 'debug';
config.log.dir = '/var/log/AppEngage/NodeJS/Logs';

config.consumer = {};
config.consumer.url = 'DWHBI-SRV2:2181';

config.url = {};
config.url.post = 'POST';

module.exports = config;
