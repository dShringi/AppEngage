var Kafka = require('kafka-node');
var Model = require('../models/analyticEvent');
var Collection = Model.Collection;
var EventFactory = new Model.EventFactory();
var config = require('../conf/config.js');
var logger = require('../conf/log.js');
var Mongoose = require('mongoose');
var common = require('../commons/common.js');
var akey = process.argv[2];

if(akey==undefined||akey==null){
    throw new Error("Please provide appropriate application key. Invalid applicaiton key: "+ akey);
}

var connectionURL = config.mongodb.url + ':' + config.mongodb.port + "/" +akey;
logger.info("MongoDB connection URL: "+ connectionURL);
Mongoose.Promise = global.Promise;
Mongoose.connect(connectionURL);

var HighLevelConsumer = Kafka.HighLevelConsumer;
var Offset = Kafka.Offset;
var Client = Kafka.Client;
var client = new Client(config.consumer.url, 'consumer_'+akey+'_'+process.pid);
var payloads = [ { topic: akey }];

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
	console.log(data);	
    	
	currDate = Math.floor(Date.now()/1000);
    	if(data.val.rtc > currDate){
        	data.val.rtc = currDate;
    	}

    	// Save Begin, Crash or End Event
    	event = EventFactory.getEvent(data);
    	event.save(function (err) {
        	if (err) {
            		logger.error(common.getErrorMessageFrom(err));
            		return;
        	}
    	});
    
    	dashboardYearData 	= {dt  : data.val.dt	,key : common.getStartYear(data.val.rtc)	,ty  : 'Y'};
    	dashboardMonthData 	= {dt  : data.val.dt	,key : common.getStartMonth(data.val.rtc)	,ty  : 'M'};
    	dashboardDayData	= {dt  : data.val.dt	,key : common.getStartDate(data.val.rtc)	,ty  : 'D'};
    	dashboardWeekData 	= {dt  : data.val.dt	,key : common.getStartWeek(data.val.rtc)	,ty  : 'W'};
	dashboardHourData	= {dt  : data.val.dt    ,key : common.getStartHour(data.val.rtc)        ,ty  : 'H'};

    	switch(data.type){
        	case Collection["begin"]:
            		// Dashboard Update
            		updateDashboard(dashboardYearData,data.type,1);
            		updateDashboard(dashboardMonthData,data.type,1);
            		updateDashboard(dashboardDayData,data.type,1);
            		updateDashboard(dashboardWeekData,data.type,1);
			updateDashboard(dashboardHourData,data.type,1);
            
            		// Insert in active sessions
			updateActiveSessions(data);
	       		
			//Insert in Users Collection
			updateUsers(data);
            		break;
        	case Collection["crash"]:
			//Increment the crash count in the dashboard collection
            		updateDashboard(dashboardYearData,data.type,1);
            		updateDashboard(dashboardMonthData,data.type,1);
            		updateDashboard(dashboardDayData,data.type,1);
            		updateDashboard(dashboardWeekData,data.type,1);
			updateDashboard(dashboardHourData,data.type,1);
            		break;
        
		case Collection["end"]:
            		// Delete active session
			removeActiveSession(data.val.sid);

			//Increment the timespent in the dashboard collection
			updateDashboard(dashboardYearData,data.type,data.val.tsd);
                        updateDashboard(dashboardMonthData,data.type,data.val.tsd);
                        updateDashboard(dashboardDayData,data.type,data.val.tsd);
                        updateDashboard(dashboardWeekData,data.type,data.val.tsd);
			updateDashboard(dashboardHourData,data.type,data.val.tsd);			

			//update user collection for timspent
			updateUsers(data);
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


function updateUsers(req){
	switch(req.type){
		case Collection["begin"]:
        		Model.User.findById(req.val.did,function(err,doc){
				if(!err){
					if(doc === null || !doc){
						data.type = Collection["user"];
						data.val.ts = 1;
						data.val.tts = 0;
        					event = EventFactory.getEvent(data);
        					event.save(function (err) {
                					if (err) {
                        					logger.error(common.getErrorMessageFrom(err));
                        					return;
                					}
        					});
					}else{
						Model.User.findByIdAndUpdate(req.val.did,{$set:{'lavn':data.val.avn,'losv':data.val.osv,'llog':data.val.rtc},$inc:{'ts':1}},function(err,doc){
						if(err){
							logger.error(common.getErrorMessageFrom(err));
							return;
						}
					});
					}
				} else {
					logger.error(err);				
                		}	
        		});
			break;
		case Collection["end"]:
			Model.User.findByIdAndUpdate(req.val.did,{$inc:{'tts':req.val.tsd}},function(err,doc){
				if(err){
					logger.error(common.getErrorMessageFrom(err));
					return;
				}
			});
			break;
	}
}

function updateActiveSessions(req){
	Model.ActiveSession.findByIdAndUpdate(req.val.sid,{$set:{'sst':req.val.rtc,'lat':req.val.rtc,'dt':req.val.dt,'did':req.val.did}},{upsert:true},function(err,doc){
        	if(err){
                	logger.error(err);
                }
        });
	
}

function updateDashboard(dashboardData,eventType,valueIncrement){
	switch(eventType){
                case Collection["begin"]:
                        Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.tse':valueIncrement}},{upsert:true},function(err,doc){
                                if(err){
                                        logger.error(err);
                                }
                        });
                        break;
		case Collection["end"]:
			Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.tts':valueIncrement}},{upsert:true},function(err,doc){
				if(err){
					logger.error(err);
				}
			});
			break;
		case Collection["crash"]:
			Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.tce':valueIncrement}},{upsert:true},function(err,doc){
				if(err){
					logger.error(err);
				}
			});
			break;
                case Collection["event"]:
                        Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.te':valueIncrement}},{upsert:true},function(err,doc){
                                if(err){
                                        logger.error(err);
                                }
                        });
                        break;
	}
}

function removeActiveSession(sid){
	Model.ActiveSession.findByIdAndRemove(sid,function(err){
        	if(err){
                	logger.error(err);
		}
	});	
}
