var Kafka = require('kafka-node');
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
    console.log(this.id, JSON.stringify(message));
    event = new BeginEvent();
    event.akey = request.payload.akey;
    event.mnu = request.payload.mnu;
    event.pf = request.payload.pf;
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