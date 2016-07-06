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
    event.save(function (err) {
        if (!err) {
            logger.info('/api/i/single/B/' + event._id); 
        } else {
            logger.error(err);
            return;
        }
    });

    switch(data.type){
        case Collection["begin"]:
            break;
        case Collection["crash"]:
            // Insert/Update in dashboard collection
            eventDate = new Date(data.val.rtc);
            year = eventDate.getFullYear();
            month = eventDate.getMonth();
            date = eventDate.getDate();
            
            // For Year
            dashboardData = {
                key : year+month+date,
                ty  : 'Y',
                dt  : data.val.dt
            };
            
            Model.Dashboard.findOne({ 
                _id: dashboardData
            }, function(err, doc){
                if(!err){
                    if(doc === undefined || doc === null){
                        logger.info("No records found!");
                        dashboardData.tce = 1;
                        dashboardData.type = Collection["dashboard"];
                        doc = EventFactory.getEvent(dashboardData);
                        doc.save(function(err){
                           if(err){
                               logger.error("Error saving "+getErrorMessageFrom(err));
                           } 
                        });
                    } else {
                        doc.val.tce = doc.val.tce+1;   
//                        doc.save(function(err){
//                            if(err){
//                                logger.error("Error updating model");
//                            }
//                        })
                        Model.Dashboard.findOneAndUpdate({
                            _id: dashboardData
                        }, doc, {upsert:true}, function(err){
                           if(err){
                               logger.error("Error updating model "+getErrorMessageFrom(err));
                           } 
                        });
                    }
                } else {
                    logger.error(err);
                }
            });
            break;
        case Collection["end"]:
            break;
    }
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

function getErrorMessageFrom(err) {
    var errorMessage = '';
    if (err.errors) {
        for (var prop in err.errors) {
            if(err.errors.hasOwnProperty(prop)) {
                errorMessage += err.errors[prop].message + ' '
            }
        }
    } else {
        errorMessage = err.message;
    }
    return errorMessage;
}