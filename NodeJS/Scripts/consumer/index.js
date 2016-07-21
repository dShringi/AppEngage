var Kafka = require('kafka-node');
var Model = require('../models/analyticEvent');
var Collection = Model.Collection;
var EventFactory = new Model.EventFactory();
var logger = require('../conf/log.js');
var Mongoose = require('mongoose');
var common = require('../commons/common.js');

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

consumer.on('message', function(message) {    

    data = JSON.parse(message.value);
    currDate = Math.floor(Date.now()/1000);
    
    if(!data.val.rtc){
	   data.val.rtc = currDate;
    } else if(data.val.rtc > currDate){
        data.val.rtc = currDate;
    }

    // Save Begin, Crash or End Event
    event = EventFactory.getEvent(data);
    event.save(function (err) {
        if (err) {
            logger.error(getErrorMessageFrom(err));
            return;
        }
    });
    
    dashboardYearData = {
        dt  : data.val.dt,
        key : common.getStartYear(data.val.rtc),
        ty  : 'Y'
    };
    dashboardMonthData = {
        dt  : data.val.dt,
        key : common.getStartMonth(data.val.rtc),
        ty  : 'M'
    };
    dashboardDayData = {
        dt  : data.val.dt,
        key : common.getStartDate(data.val.rtc),
        ty  : 'D'
    };
    dashboardWeekData = {
        dt  : data.val.dt,
        key : common.getStartWeek(data.val.rtc),
        ty  : 'W'
    };

    switch(data.type){
        case Collection["begin"]:
            // Dashboard Update
            saveOrUpdate(dashboardYearData,data.type);
            saveOrUpdate(dashboardMonthData,data.type);
            saveOrUpdate(dashboardDayData,data.type);
            saveOrUpdate(dashboardWeekData,data.type);
            
            // Insert in active sessions
            if(data.val.sid){
    		    data.type = Collection["activesessions"];
                sessionEvent = EventFactory.getEvent(data);
                sessionEvent.save(function(err){
                   if(err){
                       logger.error(getErrorMessageFrom(err));
                       return;
                   } 
                });
            }

	       //Insert in Real Time
            break;
        case Collection["crash"]:
            saveOrUpdate(dashboardYearData,data.type);
            saveOrUpdate(dashboardMonthData,data.type);
            saveOrUpdate(dashboardDayData,data.type);
            saveOrUpdate(dashboardWeekData,data.type);
            break;
        case Collection["end"]:
            // Delete active session
            if(data.val.sid){
    		    Model.ActiveSession.find({ _id:data.val.sid }).remove(function(err){
                   if(err){
                       logger.error(err);
                   } 
                });
            }
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
	//console.log(err);
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
