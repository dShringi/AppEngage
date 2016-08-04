var Kafka = require('kafka-node');
var Model = require('../models/analyticEvent');
var Collection = Model.Collection;
var EventFactory = new Model.EventFactory();
var config = require('../conf/config.js');
var logger = require('../conf/log.js');
var Mongoose = require('mongoose');
var common = require('../commons/common.js');
var _ = require('underscore');
var akey = process.argv[2];
var appTZ = 'Asia/Kolkata';

if(akey==undefined||akey==null){
    throw new Error("Please provide appropriate application key. Invalid applicaiton key: "+ akey);
}

// TODO : Bring it from AppEngage Database
var application = config.app.details;

_.each(application,function(data){
	if(data.app === akey){
		appTZ = data.TZ;
	}
});

var connectionURL = config.mongodb.url + ':' + config.mongodb.port + "/" +akey;
logger.info("MongoDB connection URL: "+ connectionURL);

//TODO : The MongoDB Connection should be implemented using callback.
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
    
    	dashboardYearData 	= {dt  : data.val.dt	,key : common.getStartYear(data.val.rtc,appTZ)	,ty  : 'Y'};
    	dashboardMonthData 	= {dt  : data.val.dt	,key : common.getStartMonth(data.val.rtc,appTZ)	,ty  : 'M'};
    	dashboardDayData	= {dt  : data.val.dt	,key : common.getStartDate(data.val.rtc,appTZ)	,ty  : 'D'};
    	dashboardWeekData 	= {dt  : data.val.dt	,key : common.getStartWeek(data.val.rtc,appTZ)	,ty  : 'W'};
	dashboardHourData	= {dt  : data.val.dt    ,key : common.getStartHour(data.val.rtc,appTZ)	,ty  : 'H'};
	logger.info('DashBoardData Set');
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
			updateUsers(data,dashboardDayData.key);
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
			updateUsers(data,dashboardDayData.key);
            		break;
		case Collection["event"]:
			//Increment the total events count in the dashboard collection
                        updateDashboard(dashboardYearData,data.type,1);
                        updateDashboard(dashboardMonthData,data.type,1);
                        updateDashboard(dashboardDayData,data.type,1);
                        updateDashboard(dashboardWeekData,data.type,1);
                        updateDashboard(dashboardHourData,data.type,1);
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


function updateUsers(req,dateKey){
	var yyyy	= parseInt(dateKey.toString().substring(0,4));
	var mm		= dateKey.toString().substring(4,6);
	var dd		= dateKey.toString().substring(6,8);
	switch(req.type){
		case Collection["begin"]:
        		Model.User.findById(req.val.did,function(err,doc){
				if(!err){
					if(doc === null || !doc){
						req.type = Collection["user"];
						req.val.ts = 1;
						req.val.tts = 0;
        					event = EventFactory.getEvent(req);
        					event.save(function (err) {
                					if (err) {
                        					logger.error(common.getErrorMessageFrom(err));
                        					return;
                					}
							var push = {};
							push['_'+yyyy] = JSON.parse('{"_id":'+mm.concat(dd)+',"tse":1,"tts":0}');
							Model.User.findByIdAndUpdate(req.val.did,{$push:push},{upsert:true},function(err,doc){
								if(err){
									logger.error(common.getErrorMessageFrom(err));
									return;
								}
							});
			
        					});			

					}else{
						Model.User.findByIdAndUpdate(req.val.did,{$set:{'lavn':req.val.avn,'losv':req.val.osv,'llog':req.val.rtc},$inc:{'ts':1}},function(err,doc){
						if(err){
							logger.error(common.getErrorMessageFrom(err));
							return;
						}
					});
						
						var sessionIncrement = '_'+yyyy+'.$.tse';
						var update = {$inc:{}};
						update.$inc[sessionIncrement] = 1;
						var search = JSON.parse('{"_id":"'+req.val.did+'","_2015._id":1229}');
						Model.User.findByIdAndUpdate(search,update,function(err,doc){
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
