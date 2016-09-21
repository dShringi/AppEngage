// this script is used to send push notification 
'use strict'

var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common');

var cron = require('node-schedule');
var mongodb = require('mongodb');
var dateFormat = require('dateformat');
var FCM = require('fcm-push');
var moment = require('moment-timezone');
var ObjectID = require('mongodb').ObjectID;

var MongoClient = mongodb.MongoClient;

var url = config.mongodb.url+'/'+process.argv[2];

var serverKey = 'AIzaSyB1avXGX6dBNO4_l51iBFEbXvESmlPiJFU';
var fcm = new FCM(serverKey);
 
var j = cron.scheduleJob('*/1 * * * *', function(){

	MongoClient.connect(url, function (err, db) {
		if (err) {
			printErrorMessage(err);
		} else {
			var datekey =  dateFormat(getUtcCurrentTime(), "yyyymmddHHMM");
			var campaignCollection = db.collection(config.coll_campaigns);
			//var findQuery = '{"$or":[{"status":"active","trigger_time":'+datekey+'},{"status":"active","recursive":true,"schedule_type": "scheduled","trigger_time":'+datekey+'},{"status":"active","recursive":true,"schedule_type": "cyclic","trigger_time":'+datekey+'} ]}';
			var findQuery = '{"$or":[{"endDate":null,"status":"active","trigger_time":'+datekey+'},{"endDate":{"$gte": '+datekey+' },"status":"active","trigger_time":'+datekey+'}]}';
			campaignCollection.find(JSON.parse(findQuery)).toArray(function (err, result) {
				if (err) {
					printErrorMessage(err);
				} else if (result.length) {
				
					var usersCollection = db.collection(config.coll_users);
					for (i = 0; i < result.length; i++) {
						var campaignResult = result[i];
						
						if((campaignResult.schedule_type =='cyclic') || (campaignResult.schedule_type == 'scheduled' && campaignResult.recursive == true)){
							
							var cycle = campaignResult.cycle;
							var scheduleType = campaignResult.schedule_type;
							var cpn_Id = ObjectID(campaignResult._id);
							var nextTriggerTime = getNextTriggerTime(cycle, scheduleType);
							var findQuery = {_id:cpn_Id};
							var updateQuery = '{"$set":{"trigger_time":'+parseInt(nextTriggerTime)+',"last_execution":'+parseInt(datekey)+'}}';
							var updateQueryJson = JSON.parse(updateQuery);
							
							campaignCollection.update(findQuery, updateQueryJson,
								function(err, result) {
									if (err) {
										printErrorMessage(err);
									}
								});
						}
						
						var mongofindQuery = campaignResult.query;
						usersCollection.find(mongofindQuery).toArray(function(err,docs) {
							if (err) {
								printErrorMessage(err);
							} else {
								for (var i = 0; i < docs.length; i++) { 
								var userResult = docs[i];
									if(userResult.rkey != null){
										var message = {to: userResult.rkey, notification:{title:campaignResult.pn_title,body:campaignResult.pn_msg}};
										pushToFcm(message);
									}
								}
							}
						});
					}
				} else {
					console.log('No document(s) found with defined "find" criteria!');
				}
				db.close();
			}); 
		}
	});
});

function pushToFcm(message){
	fcm.send(message, function(err, response){
		if (err) {
			printErrorMessage(err);
		} else {
			printErrorMessage(response);
		}
	});
}

function getNextTriggerTime(cycle, scheduleType){
	if(cycle != null && scheduleType != null){
		var date = new Date();
		if(scheduleType == 'cyclic'){
			var hourMinute = cycle.split(':');
			date.setHours(date.getHours()+parseInt(hourMinute[0]), date.getMinutes()+parseInt(hourMinute[1]));
		} else if(scheduleType == 'scheduled'){
			var cycleArray = cycle.split('_');
			var cycleType = cycleArray[0].toUpperCase();
			switch(cycleType) {
				case 'DAILY' :{ 
					date.setHours(date.getHours() + 24); break;
				} case 'ALTERNATE' :{ 
					date.setHours(date.getHours() + 48); break;
				} case 'WEEKLY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'MONTHLY' :{ 
					date = new Date(date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes()); break;
				} 
			}
		}
		return dateFormat(date, "yyyymmddHHMM");
	}
}

function printErrorMessage(err) {
	var errMsg = common.getErrorMessageFrom(err);
	logger.error(errMsg);
	return;
}

function getUtcCurrentTime(){
	var now = new Date(); 
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}