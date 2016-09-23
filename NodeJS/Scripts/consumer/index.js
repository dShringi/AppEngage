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
var appTZ = config.app.defaultTZ;
var geoip = require('geoip-lite');

if(akey===undefined||akey===null){
    throw new Error("Please provide appropriate application key. Invalid applicaiton key: "+ akey);
}

// TODO : Bring it from AppEngage Database
var application = config.app.details;

_.each(application,function(data){
	if(data.app === akey){
		appTZ = data.TZ;
		return;
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

//TODO : Implement Low Level Kafka Client
var consumer = new HighLevelConsumer(client, payloads, options);
var offset = new Offset(client);

consumer.on('message', function(message) {

	data = JSON.parse(message.value);
	logger.info(data);

	currDate = Math.floor(Date.now()/1000);
	if(data.val.rtc > currDate){
		data.val.rtc = currDate;
	}

	if(data.type === Collection["begin"]){
		var geo = geoip.lookup(data.val.ipa);
		console.log(geo);
		if(geo === config.object.NULL || geo === config.object.UNDEFINED || geo.city === config.object.UNDEFINED || geo.city === config.object.NULL || geo.city === config.object.EMPTYSTRING) {
			data.val.city = 'Unknown';
			data.val.ctry = 'Unknown';
			data.val.dlat = '0';
			data.val.dlog = '0';
		}
		else {
			data.val.city = geo.city;
			data.val.ctry = geo.country;
			data.val.dlat = geo.ll[0];
			data.val.dlog = geo.ll[1];
		}

	}

	// Save Begin, Crash End & Event data
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

	switch(data.type){
		case Collection["begin"]:
			// TODO : Implement Bulk Insert.
			//Insert in Users and Dashboard Collection
			updateUsers(data,dashboardDayData.key,function onUpdateUsersComplete(err,newUserIncrement){
				if(!err){
					updateDashboard(dashboardYearData,data.type,1,newUserIncrement,function onUpdateDashboardComplete(err){
						if(err) logError(err);
						return;
					});

					updateDashboard(dashboardMonthData,data.type,1,newUserIncrement,function onUpdateDashboardComplete(err){
						if(err) logError(err);
						return;
					});

					updateDashboard(dashboardDayData,data.type,1,newUserIncrement,function onUpdateDashboardComplete(err){
						if(err) logError(err);
						return;
					});

					updateDashboard(dashboardWeekData,data.type,1,newUserIncrement,function onUpdateDashboardComplete(err){
						if(err) logError(err);
						return;
					});

					updateDashboard(dashboardHourData,data.type,1,newUserIncrement,function onUpdateDashboardComplete(err){
						if(err) logError(err);
						return;
					});
				}else{
					logError(err);
					return;
				}
			});

			// Insert in active sessions
			updateActiveSessions(data,function onUpdateAcriveSessionsComplete(err){
				if(err) logError(err);
				return;
			});

			//Incrementing Active Session Count in the RealTime Collection
			updateRealTimeSessionCount(data.val.rtc,1,function onupdateRealTimeSessionCountComplete(err){
				if(err) logError(err);
				return;
			});

		break;

		case Collection["crash"]:
			// TODO : Implement Bulk Insert.
			//Increment the crash count in the dashboard collection
			updateDashboard(dashboardYearData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardMonthData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
					return;
			});

			updateDashboard(dashboardDayData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardWeekData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardHourData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			//update user collection for timspent
			updateUsers(data,dashboardDayData.key,function onUpdateDashboardComplete(err,data){
				if(err) log(err);
				return;
			});

		break;

		case Collection["end"]:
			// TODO : Implement Bulk Insert.
			//Decrementing Active Session Count in the RealTime Collection
			updateRealTimeSessionCount(data.val.rtc,-1,function onupdateRealTimeSessionCountComplete(err){
				if(err) logError(err);
				return;
			});

			// Delete active session
			removeActiveSession(data.val.sid,function onremoveActiveSessionComplete(err){
				if(err) logError(err);
				return;
			});

			//Increment the timespent in the dashboard collection
			updateDashboard(dashboardYearData,data.type,data.val.tsd,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardMonthData,data.type,data.val.tsd,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardDayData,data.type,data.val.tsd,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardWeekData,data.type,data.val.tsd,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardHourData,data.type,data.val.tsd,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			//update user collection for timspent
			updateUsers(data,dashboardDayData.key,function onupdateUsersComplete(err,data){
				if(err) log(err);
				return;
			});

		break;

		case Collection["event"]:
			// TODO : Implement Bulk Insert.
			//Increment the total events count in the dashboard collection

			updateDashboard(dashboardYearData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardMonthData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardDayData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardWeekData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			updateDashboard(dashboardHourData,data.type,1,0,function onUpdateDashboardComplete(err){
				if(err) logError(err);
				return;
			});

			// Insert in active sessions
			updateActiveSessions(data,function onupdateActiveSessionsComplete(err){
				if(err) logError(err);
				return;
			});

			//update user collection for timspent
			updateUsers(data,dashboardDayData.key,function onupdateUsersComplete(err,data){
				if(err) log(err);
				return;
			});
		break;
	}
});

consumer.on('error', function (err) {
	logError(err);
});

consumer.on('offsetOutOfRange', function (topic) {
	logger.info("------------- offsetOutOfRange ------------");
	topic.maxNum = 2;
	offset.fetch([topic], function (err, offsets) {
		var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
		consumer.setOffset(topic.topic, topic.partition, min);
	});
});

function logError(err){
	logger.error(common.getErrorMessageFrom(err));
	return;
}

function updateUsers(req,dateKey,callback){
	var yyyy	= parseInt(dateKey.toString().substring(0,4));
	var mm		= parseInt(dateKey.toString().substring(4,6));
	var dd		= dateKey.toString().substring(6,8);
	switch(req.type){
		//Processing for Begin messages
		case Collection["begin"]:
			//Find if the incoming user exists in the application.
			Model.User.findById(req.val.did,function(err,doc){
				//Proceed only if there are no errors
				if(!err){
					//Proceed only if the user doesn't exist in the system
					if(doc === null || !doc){
						req.type = Collection["user"];
						req.val.ts = 1;
						req.val.tts = 0;
						event = EventFactory.getEvent(req);
						//Add the user in the coll_users collection.
						event.save(function (err) {
							if (err) {
									logger.error(common.getErrorMessageFrom(err));
									return;
							}

							//Against the user add the counters for data which he has performed a login.
							var push = {};
							push['_'+yyyy] = JSON.parse('{"_id":'+parseInt(mm.toString().concat(dd))+',"tse":1,"tts":0}');
							Model.User.findByIdAndUpdate(req.val.did,{$push:push},{upsert:true},function(err,doc){
								if(err){
									logger.error(common.getErrorMessageFrom(err));
									return;
								}

								callback(null,1);
							});
						});
					}else{
						//This path executes if the user alredy exists
						//Updating the latest values of the existing user.
						if(req.val.rkey){
							Model.User.findByIdAndUpdate(req.val.did,{$set:{'lavn':req.val.avn,'losv':req.val.osv,'llog':req.val.rtc,'lres':req.val.res,'lcty':req.val.city,'lctry':req.val.ctry,'llat':req.val.dlat,'llong':req.val.dlog,'rkey':req.val.rkey},$inc:{'ts':1}},function(err,doc){
								if(err){
									logger.error(common.getErrorMessageFrom(err));
									return;
								}
							});
						}else{
							Model.User.findByIdAndUpdate(req.val.did,{$set:{'lavn':req.val.avn,'losv':req.val.osv,'llog':req.val.rtc,'lres':req.val.res,'lcty':req.val.city,'lctry':req.val.ctry,'llat':req.val.dlat,'llong':req.val.dlog},$inc:{'ts':1}},function(err,doc){
								if(err){
									logger.error(common.getErrorMessageFrom(err));
									return;
								}
							});
						}
						var _update = JSON.parse('{"$inc":{"_'+yyyy+'.$.tse":1}}');
						var _search = JSON.parse('{"_id":"'+req.val.did+'","_'+yyyy+'._id":'+parseInt(mm.toString().concat(dd))+'}');
						//Update the counters for the user against the respective date.
						Model.User.findOneAndUpdate(_search,_update,function(err,doc){
							//If none of the document gets updated.
							if(doc===null || doc===undefined){
								// If there are no errors
								if(!err){
									var push = {};
									push['_'+yyyy] = JSON.parse('{"_id":'+parseInt(mm.toString().concat(dd))+',"tse":1,"tts":0}');
									//Against the user add the counters for data which he has performed a login.
									Model.User.findByIdAndUpdate(req.val.did,{$push:push},function(err,doc){
										if(err){
											logger.error(common.getErrorMessageFrom(err));
											return;
										}
									});
								}else{
									logger.error(common.getErrorMessageFrom(err));
									return;
								}
							}else{
								callback(err,0);
								return;
							}
						});
					}
				}else{
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
				callback(err,0);
			});

			var _update = JSON.parse('{"$inc":{"_'+yyyy+'.$.tts":'+req.val.tsd+'}}');
			var _search = JSON.parse('{"_id":"'+req.val.did+'","_'+yyyy+'._id":'+parseInt(mm.toString().concat(dd))+'}');
			//Update the counters for the user against the respective date.
			Model.User.findOneAndUpdate(_search,_update,function(err,doc){
				//If none of the document gets updated.
				if(doc===null || doc===undefined){
					// If there are no errors
					if(!err){
						var push = {};
						push['_'+yyyy] = JSON.parse('{"_id":'+parseInt(mm.toString().concat(dd))+',"tse":0,"tts":'+req.val.tsd+'}');
						//Against the user add the counters for data which he has performed a login.
						Model.User.findByIdAndUpdate(req.val.did,{$push:push},function(err,doc){
							if(err){
								logger.error(common.getErrorMessageFrom(err));
								return;
							}
						});
					}else{
						logger.error(common.getErrorMessageFrom(err));
						return;
					}
				}else{
					callback(err,0);
					return;
				}
			});
		break;
		case Collection["crash"]:
			Model.User.findByIdAndUpdate(req.val.did,{$inc:{'tce':1}},function(err,doc){
				if(err){
					logger.error(common.getErrorMessageFrom(err));
					return;
				}
				callback(err,0);
			});

			var updateDoc = JSON.parse('{"$inc":{"_'+yyyy+'.$.tce":1}}');
			var searchDoc = JSON.parse('{"_id":"'+req.val.did+'","_'+yyyy+'._id":'+parseInt(mm.toString().concat(dd))+'}');
			//Update the counters for the user against the respective date.
			Model.User.findOneAndUpdate(searchDoc,updateDoc,function(err,doc){
				//If none of the document gets updated.
				if(doc===null || doc===undefined){
					// If there are no errors
					if(!err){
						var push = {};
						push['_'+yyyy] = JSON.parse('{"_id":'+parseInt(mm.toString().concat(dd))+',"tce":1}');
						//Against the user add the counters for data which he has performed a login.
						Model.User.findByIdAndUpdate(req.val.did,{$push:push},function(err,doc){
							if(err){
								logger.error(common.getErrorMessageFrom(err));
								return;
							}
						});
					}else{
						logger.error(common.getErrorMessageFrom(err));
						return;
					}
				}else{
					callback(err,0);
					return;
				}
			});
		break;
		case Collection["event"]:
			Model.User.findByIdAndUpdate(req.val.did,{$inc:{'te':1}},function(err,doc){
				if(err){
					logger.error(common.getErrorMessageFrom(err));
					return;
				}
				callback(err,0);
			});

			var updateDoc = JSON.parse('{"$inc":{"_'+yyyy+'.$.te":1}}');
			var searchDoc = JSON.parse('{"_id":"'+req.val.did+'","_'+yyyy+'._id":'+parseInt(mm.toString().concat(dd))+'}');
			//Update the counters for the user against the respective date.
			Model.User.findOneAndUpdate(searchDoc,updateDoc,function(err,doc){
				//If none of the document gets updated.
				if(doc===null || doc===undefined){
					// If there are no errors
					if(!err){
						var push = {};
						push['_'+yyyy] = JSON.parse('{"_id":'+parseInt(mm.toString().concat(dd))+',"te":1}');
						//Against the user add the counters for data which he has performed a login.
						Model.User.findByIdAndUpdate(req.val.did,{$push:push},function(err,doc){
							if(err){
								logger.error(common.getErrorMessageFrom(err));
								return;
							}
						});
					}else{
						logger.error(common.getErrorMessageFrom(err));
						return;
					}
				}else{
					callback(err,0);
					return;
				}
			});

			var updateEventsDoc = JSON.parse('{"$inc":{"_'+req.val.key+'._'+yyyy+'.$.te":1}}');
			var searchEventsDoc = JSON.parse('{"_id":"'+req.val.did+'","_'+req.val.key+'._'+yyyy+'._id":'+parseInt(mm.toString().concat(dd))+'}');
			console.log(updateEventsDoc);
			console.log(searchEventsDoc);
			//Update the counters for the user against the respective date for the key.
			Model.User.findOneAndUpdate(searchEventsDoc,updateEventsDoc,function(err,doc){
				//If none of the document gets updated.
				if(doc===null || doc===undefined){
					// If there are no errors
					if(!err){
						var push = {};
						push['_'+req.val.key+'._'+yyyy] = JSON.parse('{"_id":'+parseInt(mm.toString().concat(dd))+',"te":1}');
						console.log(push);
						//Against the user add the counters for data which he has performed a login.
						Model.User.findByIdAndUpdate(req.val.did,{$push:push},function(err,doc){
							if(err){
								logger.error(common.getErrorMessageFrom(err));
								return;
							}
						});

						Model.EventNames.findOneAndUpdate({_id:req.val.key},{_id:req.val.key},{upsert:true},function(err,doc){
							if(err){
								//console.log(err);
								logger.error(common.getErrorMessageFrom(err));
								return;
							}
						});
					}else{
						logger.error(common.getErrorMessageFrom(err));
						return;
					}
				}else{
					callback(err,0);
					return;
				}
			});
		break;
	}
}

function updateActiveSessions(req,callback){
	switch(req.type){
		case Collection["begin"]:
			Model.ActiveSession.findByIdAndUpdate(req.val.sid,{$set:{'sst':req.val.rtc,'lat':req.val.rtc,'dt':req.val.dt,'did':req.val.did}},{upsert:true},function(err,doc){
				if(err){
					logger.error(err);
					return;
				}
				callback(err);
			});
		break;

		case Collection["event"]:
			Model.ActiveSession.findByIdAndUpdate(req.val.sid,{$set:{'lat':req.val.rtc}},function(err,doc){
				if(err){
					logger.error(err);
					return;
				}
				callback(err);
			});
		break;
	}
}

function updateRealTimeSessionCount(epochTime,inc,callback){
	var _id = epochTime + (10 - (epochTime%10));
	Model.RealTime.findByIdAndUpdate(_id,{$inc:{'val':parseInt(inc)}},{upsert:true},function(err,doc){
		callback(err);
	});
}

function updateDashboard(dashboardData,eventType,valueIncrement,newUserIncrement,callback){
	switch(eventType){
		case Collection["user"]:
		case Collection["begin"]:
			Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.tse':valueIncrement,'val.tnu':newUserIncrement}},{upsert:true},function(err,doc){
				callback(err);
			});
		break;
		case Collection["end"]:
			Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.tts':valueIncrement}},{upsert:true},function(err,doc){
				callback(err);
			});
		break;
		case Collection["crash"]:
			Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.tce':valueIncrement}},{upsert:true},function(err,doc){
				callback(err);
			});
		break;
		case Collection["event"]:
			Model.Dashboard.findByIdAndUpdate(dashboardData,{$inc:{'val.te':valueIncrement}},{upsert:true},function(err,doc){
				callback(err);
			});
		break;
	}
}

function removeActiveSession(sid,callback){
	Model.ActiveSession.findByIdAndRemove(sid,function(err){
		if(err){
			logger.error(err);
			return;
		}
	callback(err);
	});
}
