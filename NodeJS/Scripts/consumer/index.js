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
    var currDate = new Date(0);
    	
    console.log(currDate+'_'+data.val.rtc); 
    event = EventFactory.getEvent(data);
    
    event.save(function (err) {
	console.log(err);
        if (err) {
            logger.error(getErrorMessageFrom(err));
            return;
        }
    });
    
    eventDate = new Date(0);
    eventDate.setUTCSeconds(data.val.rtc);	
    //console.log(eventDate);
    year = eventDate.getFullYear();
    month = '0'.concat(eventDate.getMonth()+1).slice(-2);
    date = '0'.concat(eventDate.getDate()+1).slice(-2);
            
    dashboardYearData = {
        dt  : data.val.dt,
        key : ""+year+"0101",
        ty  : 'Y'
    };
    dashboardMonthData = {
        dt  : data.val.dt,
        key : ""+year+month+"01",
        ty  : 'M'
    };
    dashboardDayData = {
        dt  : data.val.dt,
        key : ""+year+month+date,
        ty  : 'D'
    };

    switch(data.type){
        case Collection["begin"]:
            saveOrUpdate(dashboardYearData,data.type);
            saveOrUpdate(dashboardMonthData,data.type);
            saveOrUpdate(dashboardDayData,data.type);
            
            // Insert in active sessions
            if(data.val.sid){
		data.type = Collection["activesessions"];
                sessionEvent = EventFactory.getEvent(data);
                
		sessionEvent.save(function(err){
		//console.log(err);
                   if(err){
                       logger.error(getErrorMessageFrom(err));
                       return;
                   } 
                });
            }
            break;
        case Collection["crash"]:
            saveOrUpdate(dashboardYearData,data.type);
            saveOrUpdate(dashboardMonthData,data.type);
            saveOrUpdate(dashboardDayData,data.type);
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

function saveOrUpdate(dashboardData, eventType){
    Model.Dashboard.findOne({
        _id: dashboardData
    }, function(err, doc){
	//console.log(doc);
        if(!err){
            if(doc == undefined || doc == null){
		//console.log(eventType+'_'+dashboardData);
                switch(eventType){
                    case Collection["begin"]:
                        dashboardData.tse = 1;
                        break;
                    case Collection["crash"]:
                        dashboardData.tce = 1;
                        break;
                }
                dashboardData.type = Collection["dashboard"];
                doc = EventFactory.getEvent(dashboardData);
                doc.save(function(err){
                   if(err){
                       logger.error("Error saving "+getErrorMessageFrom(err));
                   } 
                });
            } else {
                doc._id = dashboardData;
                // TODO Figure out a better way to do it.
                dashboardVal = Object.create(doc.val);
                switch(eventType){
                    case Collection["begin"]:
                        dashboardVal.tse = dashboardVal.tse+1;
                        break;
                    case Collection["crash"]:
                        dashboardVal.tce = dashboardVal.tce+1;
                        break;
                }                
                doc.val = dashboardVal;
                doc.save(function(err){
                    if(err){
                        logger.error("Error updating model"+getErrorMessageFrom(err));
                    }
                });
            }
        } else {
            logger.error(err);
        }
    });
}
