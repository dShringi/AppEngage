var config = {};

config.server = {};
//For development purpose
config.server.host = 'localhost';
//config.server.host = 'DWHBI-SRV1';
config.server.port = '8000';

config.mongodb = {};
//For development purpose
config.mongodb.url = 'mongodb://localhost';
//config.mongodb.url = 'mongodb://DWHBI-SRV3/appengage';
config.mongodb.port = process.env.MONGODB_PORT || '27017';

config.kafka = {};
config.kafka.default = 'unregistered';

config.log = {};
config.log.level = 'debug';
config.log.dir = '/var/log/appengage/nodejs/logs';

config.consumer = {};
//For Development purpose
config.consumer.url = 'localhost:2181';
//config.consumer.url = 'DWHBI-SRV2:2181';

config.url = {};
config.url.post = 'POST';
config.url.beginep = '/api/i/single/B';
config.url.endep = '/api/i/single/E'
config.url.crashep = '/api/i/single/C';
config.url.eventsep = '/api/i/single/event';
config.url.offline = '/api/i/bulk/O';

module.exports = config;
