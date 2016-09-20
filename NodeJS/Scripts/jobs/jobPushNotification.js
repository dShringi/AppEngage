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
			var campaignCollection = db.collection('coll_campaign');
			//var findQuery = '{"$or":[{"status":"active","trigger_time":'+datekey+'},{"status":"active","recursive":true,"schdule_type": "schduled","trigger_time":'+datekey+'},{"status":"active","recursive":true,"schdule_type": "cyclic","trigger_time":'+datekey+'} ]}';
			var findQuery = '{"status":"active","trigger_time":'+datekey+'}';
			campaignCollection.find(JSON.parse(findQuery)).toArray(function (err, result) {
				if (err) {
					printErrorMessage(err);
				} else if (result.length) {
				
					var recordCollection = db.collection('coll_record');
					for (i = 0; i < result.length; i++) {
						var campaignResult = result[i];
						
						if((campaignResult.schdule_type =='cyclic') || (campaignResult.schdule_type == 'schduled' && campaignResult.recursive == true)){
							
							var cycle = campaignResult.cycle;
							var schduleType = campaignResult.schdule_type;
							var cpn_Id = ObjectID(campaignResult._id);
							var nextTriggerTime = getNextTriggerTime(cycle, schduleType);
							var findQuery = {_id:cpn_Id};
							var updateQuery = '{"$set":{"trigger_time":'+parseInt(nextTriggerTime)+',"last_execution":'+parseInt(datekey)+'}}';
							var updateQueryJson = JSON.parse(updateQuery);
							
							campaignCollection.update(findQueryJson, updateQueryJson,
								function(err, result) {
									if (err) {
										printErrorMessage(err);
									}
								});
						}
						
						var mongofindQuery = campaignResult.query;
						recordCollection.find(mongofindQuery).toArray(function(err,docs) {
							if (err) {
								printErrorMessage(err);
							} else {
								for (var i = 0; i < docs.length; i++) { 
								var userResult = docs[i];
									var message = {to: userResult.app_key, notification:{title:campaignResult.pn_title,body:campaignResult.pn_msg}};
									pushToFcm(message);
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

function getNextTriggerTime(cycle, schduleType){
	if(cycle != null && schduleType != null){
		var date = new Date();
		if(schduleType == 'cyclic'){
			var hourMinute = cycle.split(':');
			date.setHours(date.getHours()+parseInt(hourMinute[0]), date.getMinutes()+parseInt(hourMinute[1]));
		} else if(schduleType == 'schduled'){
			switch(cycle) {
				case 'DAILY' :{ 
					date.setHours(date.getHours() + 24); break;
				} case 'ALTERNATE' :{ 
					date.setHours(date.getHours() + 48); break;
				} case 'WEEKLY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'MONTHLY' :{ 
					date = new Date(date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes()); break;
				} case 'SUNDAY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'MONDAY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'TUESDAY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'WEDNESDAY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'THURSDAY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'FRIDAY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
				} case 'SATURDAY' :{ 
					date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7, date.getHours(), date.getMinutes()); break;
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