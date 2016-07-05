var Kafka = require('kafka-node');
var Model = require('../models/analyticEvent');
var Collection = Model.Collection;
var EventFactory = new Model.EventFactory();
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
    autoCommit: true,
    autoCommitMsgCount: 100,
    autoCommitIntervalMs: 5000,
    fetchMaxWaitMs: 100,
    fetchMinBytes: 1,
    fetchMaxBytes: 1024 * 10,
    fromOffset: false,
    fromBeginning: false
};

var consumer = new HighLevelConsumer(client, payloads, options);
var offset = new Offset(client);

consumer.on('message', function (message) {
    data = JSON.parse(message.value);
    event = EventFactory.getEvent(data);
    // TODO: Based on event type parse and perform respective db updates.
    event.save(function (err) {
        if (!err) {
            logger.info('/api/i/single/B/' + event._id); 
        } else {
            logger.error(err);
        }
    });
});

consumer.on('error', function (err) {
    logger.error(err);
});

consumer.on('offsetOutOfRange', function (topic) {
    logger.info("------------- offsetOutOfRange ------------");
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
        var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
    });
});