// use this script to update dashboard collection
'use strict'

var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common');

var mongodb = require('mongodb');
var dateFormat = require('dateformat');
var moment = require('moment-timezone');

var MongoClient = mongodb.MongoClient;
var application = config.app.details;	
var appTZ = config.defaultAppTimeZone;
var url = config.mongodb.url+'/'+process.argv[2];

//run time parameters(aapkey and triggerType)
var appKey =  process.argv[2];
var triggerType = process.argv[3].toLowerCase();

if (Boolean(url) && Boolean(appKey) && Boolean(triggerType)){
	MongoClient.connect(url, function (err, db) {
		if (err) {
			printErrorMessage(err);
		} else {
			console.log('Connection established to', url);
			getTimezone(appKey);
			var endDate=new Date();
			var endDateUnixtime = getUnixTime('C');
			var endDateDay = endDate.getDate();
			var endDateMonth = endDate.getMonth()+1;
			var endDateYear = endDate.getFullYear();
			
			var startDate;
			if(triggerType == config.mongodb.triggerType_hourly) {
				startDate = getStartDate(triggerType);
				var beginsCollection = db.collection(config.mongodb.coll_begins);
				var startDateUnixtime = getUnixTime('P');
				var query = '[{"$match":{"rtr":{"$gte":' + startDateUnixtime + ',"$lt":' + endDateUnixtime
							+ '}}},{"$group":{"_id":{"val":"$val.dt","val.did":"$val.did"}}},{"$group":{"_id":{"result":"$_id.val"},"users":{"$sum":1}}}]';
				beginsCollection.aggregate(JSON.parse(query),function(err, items) {
					if(err){
						printErrorMessage(err);
					}
					var resultLength = items.length;
					console.log(resultLength,' result found');
					if(resultLength > 0){
						// find tablet/smart phone entry
						var beginsCollectionQueryResult = getGroupByQueryResult(items);
						var smartCount = beginsCollectionQueryResult.smartCount;
						var tabletCount = beginsCollectionQueryResult.tabletCount;
						
						var KeyFormat = moment.utc(startDate).tz(appTZ).format('YYYYMMDDHH');
						console.log('KeyFormat ', KeyFormat);
						//var dashboardCollection = db.collection(config.mongodb.coll_dashboard);
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmartJson = updateQueryBuilder(triggerType, 'S', KeyFormat);
							var updateQueryJsonSmt = setQueryBuilder(smartCount);
							updateCollection(db, dashboardQuerySmartJson, updateQueryJsonSmt);
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTabletJson = updateQueryBuilder(triggerType, 'T', KeyFormat);
							var updateQueryJsonTab = setQueryBuilder(tabletCount);
							updateCollection(db, dashboardQueryTabletJson, updateQueryJsonTab);
						}
						console.log('all done...!');
					} else {
						console.log('no record found...!');
					}
					db.close();
				});
			} else {
				startDate = getStartDate(triggerType);
				startDate = getTimeFromZone(startDate, appTZ);
				var startDateDay = startDate.getDate();
				startDateDay = checkDateDayLength(startDateDay);
				var startDateMonth = startDate.getMonth()+1;
				var startDateYear = startDate.getFullYear();
				
				endDate = getTimeFromZone(endDate, appTZ);
				endDateDay = checkDateDayLength(endDate.getDate());
				
				var usersCollection = db.collection(config.mongodb.coll_users);
				var endDayMonth = parseInt(''+endDateMonth+''+endDateDay);
				var startDayMonth = parseInt(''+startDateMonth+''+startDateDay);
				var unwindvar = '$_'+endDateYear;
				var matchKey = '_'+endDateYear+'._id';
				var query;
				
				if((triggerType == config.mongodb.triggerType_weekly) && (startDateYear != endDateYear)) {
					//to be done
				} else {
					  query = '[{"$unwind":"'+unwindvar+'"},{"$match":{"'+matchKey+'":{"$gte":'+startDayMonth+',"$lte":'+endDayMonth
					  +'}}},{"$group":{"_id":{"_id":"$_id","ldt":"$ldt"}}},{"$group":{"_id":{"result":"$_id.ldt"},"users":{"$sum":1}}}]';
				}
				var queryJson = JSON.parse(query);
				usersCollection.aggregate(queryJson,function(err, items) {
					if(err){
						printErrorMessage(err);
					}
					
					var resultLength = items.length;
					if(resultLength > 0){
						console.log(resultLength,' result found ');
						// find tablet/smart phone entry
						var beginsCollectionQueryResult = getGroupByQueryResult(items);
						var smartCount = beginsCollectionQueryResult.smartCount;
						var tabletCount = beginsCollectionQueryResult.tabletCount;
						
						var KeyFormat = dateFormat(startDate, "yyyymmdd");
						console.log('KeyFormat ', KeyFormat);
						var dashboardCollection = db.collection(config.mongodb.coll_dashboard);
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmartJson = updateQueryBuilder(triggerType, 'S', KeyFormat);
							var updateQueryJsonSmt = setQueryBuilder(smartCount);
							updateCollection(db, dashboardQuerySmartJson, updateQueryJsonSmt);
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTabletJson = updateQueryBuilder(triggerType, 'T', KeyFormat);
							var updateQueryJsonTab =setQueryBuilder(tabletCount);
							updateCollection(db, dashboardQueryTabletJson, updateQueryJsonTab);
						}
						console.log('all done...!');
					} else {
						console.log('no record found...!');
					}
					db.close();
				});
			} 
		}	
	});

} else {
	console.log('arguments required order is "mongodb url" " appkey" "type(Hourly/Daily/Weekly/Monthly/yearly)"');
}

function getStartDate(triggerType) {
	var startDate = new Date();
	var startDateYear = moment.utc(startDate).tz(appTZ).format('YYYY');
	var startDateMonth = moment.utc(startDate).tz(appTZ).format('MM');
	var startDateDay = moment.utc(startDate).tz(appTZ).format('DD');
	var startDateHour = moment.utc(startDate).tz(appTZ).format('HH');
	var startDateMinut = moment.utc(startDate).tz(appTZ).format('MM');
	var startDateSecond = moment.utc(startDate).tz(appTZ).format('SS');
	startDate = new Date(startDateYear, parseInt(startDateMonth)-1,startDateDay,startDateHour, startDateMinut, startDateSecond);
	if (triggerType == config.mongodb.triggerType_hourly) {
		//return new Date(startDate-60*60*1000);
		startDate.setHours(startDate.getHours()-1);
		startDate.setMinutes(0);
		return startDate;
	} else if (triggerType == config.mongodb.triggerType_daily) {
		//return new Date(startDate - (24 * 60 * 60 * 1000));
		startDate.setDate(startDate.getDate() - 1);
 		startDate.setHours(0,0,0,0);
 		return startDate;
	} else if (triggerType == config.mongodb.triggerType_weekly) {
		return new Date(startDate.setDate(startDate.getDate() - startDate.getDay()));
	} else if (triggerType == config.mongodb.triggerType_monthly) {
		return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
	} else if (triggerType == config.mongodb.triggerType_yearly) {
		return new Date(startDate.getFullYear(), 0, 1);
	}
}

function getGroupByQueryResult(items) {
	var smartCount;
	var tabletCount;
	for ( var i in items) {
		var count = items[i];
		if (count._id.result == 'S') {
			smartCount = count.users;
		} else if (count._id.result == 'T') {
			tabletCount = count.users;
		}
	}
	return {
		smartCount : smartCount,
		tabletCount : tabletCount
	};
}

function printErrorMessage(err) {
	var errMsg = common.getErrorMessageFrom(err);
	logger.error(errMsg);
	console.log('Error : ', err);
	return;
}

function checkDateDayLength(dateDay) {
	if (dateDay < 10) {
		return '0' + dateDay;
	}
	return dateDay;
}

function updateCollection(db, dashboardQuerySmartJson, updateQueryJsonSmt) {
	db.collection(config.mongodb.coll_dashboard).update(dashboardQuerySmartJson, updateQueryJsonSmt, {upsert : true}, 
			function(err, result) {
				if (err) {
					printErrorMessage(err);
				} else {
					callback();
				}
			});
}

function updateQueryBuilder(triggerType, deviceType, KeyFormat) {
	var updateQuery;
	KeyFormat = parseInt(KeyFormat);
	if (triggerType == config.mongodb.triggerType_hourly) {
		updateQuery = '{ "_id" : { "dt" : "' + deviceType + '", "key" :'+ KeyFormat + ', "ty": "H" }}';
	} else if (triggerType == config.mongodb.triggerType_daily) {
		updateQuery = '{ "_id" : { "dt" : "' + deviceType + '", "key" :' + KeyFormat + ', "ty": "D" }}';
	} else if (triggerType == config.mongodb.triggerType_weekly) {
		updateQuery = '{ "_id" : { "dt" : "' + deviceType + '", "key" :' + KeyFormat + ', "ty": "W" }}';
	} else if (triggerType == config.mongodb.triggerType_monthly) {
		updateQuery = '{ "_id" : { "dt" : "' + deviceType + '", "key" :' + KeyFormat + ', "ty": "M" }}';
	} else if (triggerType == config.mongodb.triggerType_yearly) {
		updateQuery = '{ "_id" : { "dt" : "' + deviceType + '", "key" :' + KeyFormat + ', "ty": "Y" }}';
	}
	return JSON.parse(updateQuery);
}

function setQueryBuilder(count) {
	return JSON.parse('{"$set":{"val.tuu":' + count + '}}');
}

function getTimezone(appKey) {
	for ( var i = 0, len = application.length; i < len; i++) {
		var key = application[i];
		if (key.app == appKey) {
			appTZ = key.TZ;
			break;
		}
	}
}

function getTimeFromZone(date, appTZ) {
	var tZTime = moment.utc(date).tz(appTZ).format();
	return new Date(tZTime);
}


function getUnixTime(timeType) {
	var date = new Date();
	if(timeType == 'C') {
		return Math.round(date.getTime() / 1000);
	} else if(timeType == 'P') {
		date.setHours(startDate.getHours()-1);
		date.setMinutes(0);
		return Math.round(date.getTime() / 1000);
	}
}