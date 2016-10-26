// this script is used to send push notification
'use strict'

const logger = require('../conf/log.js');
const config = require('../conf/config.js');
const common = require('../commons/common');

var mongodb = require('mongodb');
var dateFormat = require('dateformat');
var FCM = require('fcm-push');
var ObjectID = require('mongodb').ObjectID;

var MongoClient = mongodb.MongoClient;

var url = config.mongodb.url+'/'+process.argv[2];

//Android server key
var andriodServerKey = 'AIzaSyB1avXGX6dBNO4_l51iBFEbXvESmlPiJFU';

//iOS server key
var iosServerKey = 'AIzaSyBugP2RtRsfpqhY_mY-Q6U0aB_GHdpzDoU';

var andriodFcm = new FCM(andriodServerKey);
var iosFcm = new FCM(iosServerKey);

	MongoClient.connect(url, function (err, db) {
		if (err) {
			printErrorMessage(err);
		} else {
			var datekey =  dateFormat(getUtcCurrentTime(), "yyyymmddHHMM");
			var endDate =  dateFormat(getUtcCurrentTime(), "yyyymmdd");
			var campaignCollection = db.collection(config.mongodb.coll_campaigns);
			//var findQuery = '{"$or":[{"status":"active","trigger_time":'+datekey+'},{"status":"active","recursive":true,"schedule_type": "scheduled","trigger_time":'+datekey+'},{"status":"active","recursive":true,"schedule_type": "cyclic","trigger_time":'+datekey+'} ]}';
			var findQuery = '{"$or":[{"endDate":null,"status":"active","trigger_time":'+datekey+'},{"endDate":{"$gte": '+endDate+' },"status":"active","trigger_time":'+datekey+'}]}';
			campaignCollection.find(JSON.parse(findQuery)).toArray(function (err, result) {
				if (err) {
					printErrorMessage(err);
					db.close();
				} else if (result.length) {

					var usersCollection = db.collection(config.mongodb.coll_users);
					for (var i = 0; i < result.length; i++) {
						var campaignResult = result[i];
						var mongofindQuery = campaignResult.query;
						var findQueryString = JSON.stringify(mongofindQuery);
						var findJsonQuery = JSON.parse(multiReplace(findQueryString,'***','$'));
						usersCollection.find(findJsonQuery).toArray(function(err,docs) {
							if (err) {
								printErrorMessage(err);
								db.close();
							} else if(docs.length){
								var countTotal = 0;
								for (var i = 0; i < docs.length; i++) {
								var userResult = docs[i];
									if(userResult.rkey != null){
										countTotal++;
										var message = {priority : 'high',to: userResult.rkey, data:{title:campaignResult.pn_title,body:campaignResult.pn_msg}};
										try {
											if(userResult.lpf == 'iOS'){
												pushToFcmIos(message);
											} else if(userResult.lpf == 'A') {
												pushToFcmAndroid(message);
											}
										} catch(err){
											countTotal--;
											printErrorMessage(err);
										}
									}
								}
								var cpn_Id = ObjectID(campaignResult._id);
								var findQuery = {_id:cpn_Id};
								var updateQuery
								if((campaignResult.schedule_type =='cyclic') || (campaignResult.schedule_type == 'scheduled' && campaignResult.recursive == true)){

									var cycle = campaignResult.cycle;
									var scheduleType = campaignResult.schedule_type;

									var nextTriggerTime = getNextTriggerTime(cycle, scheduleType);

									updateQuery = '{"$set":{"trigger_time":'+parseInt(nextTriggerTime)+',"last_execution":'+parseInt(datekey)+',"total":'+countTotal+'}}';

								} else {
									updateQuery = '{"$set":{"total":'+countTotal+'}}';
								}
								var updateQueryJson = JSON.parse(updateQuery);
								campaignCollection.update(findQuery, updateQueryJson,function(err, result) {
										if (err) {
											printErrorMessage(err);
										}
										db.close();
								});
							} else {
								db.close();
							}
						});
					}
				} else {
					console.log('No document(s) found with defined "find" criteria! ',datekey);
					db.close();
				}
			});
		}
	});
//});

function pushToFcmAndroid(message){
	andriodFcm.send(message, function(err, response){
		if (err) {
			printErrorMessage(err);
		} else {
			printErrorMessage(err);

		}
	});
}


function pushToFcmIos(message){
	iosFcm.send(message, function(err, response){
		if (err) {
			printErrorMessage(err);
		} else {
			printErrorMessage(err);

		}
	});
}

function getNextTriggerTime(cycle, scheduleType){
	if(cycle != null && scheduleType != null){
		var date = getUtcCurrentTime();
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
	console.log('err  ',err);
	return;
}

function getUtcCurrentTime(){
	var now = new Date();
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}


function multiReplace(str, match, repl) {
    if (match === repl)
        return str;
    do {
        str = str.replace(match, repl);
    } while(str.indexOf(match) !== -1);
    return str;
}
