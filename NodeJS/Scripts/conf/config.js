var config = {};

config.server = {};
//For development purpose
config.server.host = 'localhost';
//config.server.host = 'DWHBI-SRV1';
config.server.port = '8000';

config.mongodb = {};
//For development purpose
config.mongodb.url = 'mongodb://localhost';
config.mongodb.appengage = 'mongodb://localhost/appengage';
//config.mongodb.url = 'mongodb://DWHBI-SRV3';
//config.mongodb.appengage = 'mongodb://DWHBI-SRV3/appengage';
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
config.url.offlineep = '/api/i/bulk/O';
config.url.screenep = '/api/i/single/S';

config.app = {};
config.defaultAppTimeZone = 'Asia/Kolkata';
config.app.details = [
{app:"test1234",TZ:"Asia/Kolkata",TimeOut:600},
{app:"4170b44d6459bba992acaa857ac5b25d7fac6cc1",TZ:"Asia/Kolkata",TimeOut:600}
];

config.app.defaultTZ = 'Asia/Kolkata';

config.messages = {};
config.messages.success = 'Success';
config.messages.failure = 'Failure';

config.msgcodes = {};
config.msgcodes.success = 200;
config.msgcodes.failure = 400;

config.mongodb.coll_crashes = 'coll_crashes';
config.mongodb.coll_dashboard	= 'coll_dashboard';
config.mongodb.coll_realtime = 'coll_realtimes';
config.mongodb.coll_users = 'coll_users';
config.mongodb.coll_activesessions = 'coll_activesessions';
config.mongodb.coll_appengageusers = 'coll_users';
config.mongodb.coll_appengageapps = 'coll_apps';
config.mongodb.coll_begins = 'coll_begins';
config.mongodb.coll_campaigns = 'coll_campaigns';
config.mongodb.coll_cohorts = 'coll_cohorts';


config.mongodb.triggerType_hourly = 'hourly';
config.mongodb.triggerType_daily = 'daily';
config.mongodb.triggerType_weekly = 'weekly';
config.mongodb.triggerType_monthly = 'monthly';
config.mongodb.triggerType_yearly = 'yearly';

config.dateformat = {};
config.dateformat.YYYYMMDDHH = 'YYYYMMDDHH';
config.dateformat.YYYYMMDD = 'YYYYMMDD';
config.dateformat.HOUR = 'hour';
config.dateformat.DAY = 'day';

config.object = {};
config.object.UNDEFINED = undefined;
config.object.NULL = null;
config.object.EMPTYSTRING ="";

module.exports = config;
