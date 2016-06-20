var Kafka = require('kafka-node');
var BeginEvent   = require('../models/analyticEvent').BeginEvent;
var CrashEvent   = require('../models/analyticEvent').CrashEvent;
var EndEvent   = require('../models/analyticEvent').EndEvent;
var logger = require('../conf/log.js');
var Mongoose = require('mongoose');
Mongoose.connect('mongodb://localhost/appengage');

var HighLevelConsumer = Kafka.HighLevelConsumer;
var Offset = Kafka.Offset;
var Client = Kafka.Client;
var client = new Client('localhost:2181','consumer'+process.pid);
var payloads = [ { topic: 'test' }];
var options = {
    groupId: 'kafka-node-group',
    // Auto commit config
    autoCommit: true,
    autoCommitMsgCount: 100,
    autoCommitIntervalMs: 5000,
    // Fetch message config
    fetchMaxWaitMs: 100,
    fetchMinBytes: 1,
    fetchMaxBytes: 1024 * 10,
    fromOffset: false,
    fromBeginning: false
};

var consumer = new HighLevelConsumer(client, payloads, options);
var offset = new Offset(client);

consumer.on('message', function (message) {
    message_data = JSON.parse(message.value);
    console.log(this.id, JSON.stringify(message_data));
    console.log('----------logging message--------------');
    console.log(message_data.akey);
    console.log('----------logging message--------------');
    event = new BeginEvent();
    event.akey = message_data.akey;
    event.mnu = message_data.mnu;
    event.pf = message_data.pf;
    // TODO get ip address and add to json.
    event.save(function (err) {
        if (!err) {
            logger.info('/api/i/single/B/' + event._id); 
        } else {
            logger.error(err);
        }
    });
});

consumer.on('error', function (err) {
    console.log('error', err);
});

consumer.on('offsetOutOfRange', function (topic) {
    console.log("------------- offsetOutOfRange ------------");
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
        var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
    });
});