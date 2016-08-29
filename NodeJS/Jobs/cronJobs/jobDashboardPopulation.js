// use this script to update dashboard collection
'use strict'
var mongodb = require('mongodb');
var dateFormat = require('dateformat');
var logger = require('././Scripts/conf/log.js');
var config = require('././Scripts/conf/config.js');
var common = require('././Scripts/commons/common');
var moment = require('moment-timezone');

var MongoClient = mongodb.MongoClient;
var application = config.app.details;	
var url = process.argv[2];
var appKey =  process.argv[3];
var triggerTyep = process.argv[4].toLowerCase();
var appTZ = config.defaultAppTimeZone;


if (Boolean(url) && Boolean(appKey) && Boolean(triggerTyep)){
	MongoClient.connect(url, function (err, db) {
		if (err) {
			printErrorMessage(err);
		} else {
			console.log('Connection established to', url);
			getTimezone(appKey);
			var endDate=new Date();
			var endDateUnixtime = Math.round(endDate.getTime() / 1000);
			var endDateDay = endDate.getDate();
			var endDateMonth = endDate.getMonth()+1;
			var endDateYear = endDate.getFullYear();
			
			var startDate;
			// for hourly data
			if(triggerTyep == config.mongodb.triggerTyep_hourly) {
				startDate = getStartDate(triggerTyep);
				var beginsCollection = db.collection(config.mongodb.coll_begins);
				var startDateUnixtime = Math.round(startDate.getTime() / 1000);
				//this query will form a implicit AND (no need to decleare explicit AND)
				var query = '[{"$match":{"rtr":{"$gte":'+startDateUnixtime+',"$lt":'+endDateUnixtime+'}}},{"$group":{"_id":{"val":"$val.dt","val.did":"$val.did"}}},{"$group":{"_id":{"result":"$_id.val"},"users":{"$sum":1}}}]';
				console.log(query);
				beginsCollection.aggregate(JSON.parse(query),function(err, items) {
					if(err){
						printErrorMessage(err);
					}
					var resultLength = items.length;
					console.log(resultLength,' result found');
					if(resultLength > 0){
						// find tablet/smart phone entry
						var totalcount = getGroupByQueryResult(items);
						var smartCount = totalcount.smartCount;
						var tabletCount = totalcount.tabletCount;
						
						var KeyFormat = moment.utc(endDate).tz(appTZ).format('YYYYMMDDHH');
						console.log('KeyFormat ', KeyFormat);
						var dashboardCollection = db.collection(config.mongodb.coll_dashboard);
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							console.log('smartCount ', smartCount);
							var dashboardQuerySmartJson = updateQueryBuilder(triggerTyep, 'S', KeyFormat);
							var updateQueryJsonSmt = setQueryBuilder(smartCount);
							updateCollection(db, dashboardQuerySmartJson, updateQueryJsonSmt);
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
						console.log('tabletCount ', tabletCount);
							var dashboardQueryTabletJson = updateQueryBuilder(triggerTyep, 'T', KeyFormat);
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
				//utc time zone for start date
				startDate = getStartDate(triggerTyep);
				var startDateDay = startDate.getDate();
				startDateDay = checkDateDayLength(startDateDay);
				var startDateMonth = startDate.getMonth()+1;
				var startDateYear = startDate.getFullYear();
				
				endDateDay = checkDateDayLength(endDate.getDate());
				
				var usersCollection = db.collection(config.mongodb.coll_users);
				var endDayMonth = parseInt(''+endDateMonth+''+endDateDay);
				var startDayMonth = parseInt(''+startDateMonth+''+startDateDay);
				var unwindvar = '$_'+endDateYear;
				var matchKey = '_'+endDateYear+'._id';
				var query= '[{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lte":'+endDayMonth+'}}},{"$unwind": "'+unwindvar+'"},{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lte":'+endDayMonth+'}}},{"$group":{"_id":{"result" : "$ldt"},"users":{"$sum": 1}}}]';

				if((triggerTyep == config.mongodb.triggerTyep_weekly) && (startDateYear == endDateYear)) {
					query = '[{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lte":'+endDayMonth+'}}},{"$unwind": "'+unwindvar+'"},{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lte":'+endDayMonth+'}}},{"$group":{"_id":{"result" : "$ldt"},"users":{"$sum": 1}}}]';
					
				} else {
					//to be done
					query = '[{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lte":'+endDayMonth+'}}},{"$unwind": "'+unwindvar+'"},{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lte":'+endDayMonth+'}}},{"$group":{"_id":{"result" : "$ldt"},"users":{"$sum": 1}}}]';
				}
				
				
				var queryJson = JSON.parse(query);
				usersCollection.aggregate(queryJson,function(err, items) {
					if(err){
						printErrorMessage(err);
					}
					var resultLength = items.length;
					console.log(resultLength,' result found ');
					if(resultLength > 0){
					
						// find tablet/smart phone entry
						var totalcount = getGroupByQueryResult(items);
						var smartCount = totalcount.smartCount;
						var tabletCount = totalcount.tabletCount;
						
						var utcDate = "2014-10-19T10:31:59.0537721Z";
						
						var KeyFormat = moment.utc(utcDate).tz(appTZ).format('YYYYMMDD');
						var dashboardCollection = db.collection(config.mongodb.coll_dashboard);
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmartJson = updateQueryBuilder(triggerTyep, 'S', KeyFormat);
							var updateQueryJsonSmt = setQueryBuilder(smartCount);
							updateCollection(db, dashboardQuerySmartJson, updateQueryJsonSmt);
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTabletJson = JSON.parse(updateQueryBuilder(triggerTyep, 'T', KeyFormat));
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

function getStartDate(triggerTyep){
	var endDate = new Date();
	if(triggerTyep == 'Hourly' || triggerTyep == 'hourly'){
		//return new Date(endDate-60*60*1000);
		endDate.setDate(endDate.getDate() - 1);
		endDate.setHours(0,0,0,0);
		return endDate;
	} else if(triggerTyep == 'Daily' || triggerTyep == 'daily') {
		return new Date(endDate-(24*60*60*1000));
	} else if(triggerTyep == 'Weekly' || triggerTyep == 'weekly') {
		return new Date(endDate.setDate(endDate.getDate() - endDate.getDay()));
	} else if(triggerTyep == 'Monthly' || triggerTyep == 'monthly') {
		return new Date(endDate.getFullYear(), endDate.getMonth(), 1);
	} else if(triggerTyep == 'Yearly' || triggerTyep == 'yearly') {
		return new Date(endDate.getFullYear(),0, 1);
	}
}

function getGroupByQueryResult(items){
   var smartCount;
	var tabletCount;
	for (var i in items) {
		var count = items[i];
		if(count._id.result == 'S') {
			smartCount = count.users;
		} else if(count._id.result == 'T'){
			tabletCount = count.users;
		}
	}      
    return {
        smartCount: smartCount, 
        tabletCount: tabletCount
    };  
}

function printErrorMessage(err){
	var errMsg = common.getErrorMessageFrom(err);
    logger.error(errMsg);
	console.log('Error : ', err);
	return;
}

function checkDateDayLength(date) {
	if(date < 10) {
		return '0'+date;
	}
	return date;
}

function updateCollection(db, dashboardQuerySmartJson, updateQueryJsonSmt ) {
   db.collection('coll_dashboard').update(dashboardQuerySmartJson, updateQueryJsonSmt,{upsert:true},function( err, result ) {
		if ( err ) {
			printErrorMessage(err);
		}
	});
}

function updateQueryBuilder(triggerTyep, deviceType, KeyFormat) {
	var result;
	if(triggerTyep == 'hourly'){
		result = '{ "_id" : { "dt" : "'+deviceType+'", "key" :'+parseInt(KeyFormat.toString())+', "ty": "H" }}'
	}else if(triggerTyep == 'daily') {
		result =  '{ "_id" : { "dt" : "'+deviceType+'", "key" :'+parseInt(KeyFormat.toString())+', "ty": "D" }}'
	} else if(triggerTyep == 'weekly'){
		result =  '{ "_id" : { "dt" : "'+deviceType+'", "key" :'+parseInt(KeyFormat.toString())+', "ty": "W" }}'
	}else if(triggerTyep == 'monthly') {
		result =  '{ "_id" : { "dt" : "'+deviceType+'", "key" :'+parseInt(KeyFormat.toString())+', "ty": "M" }}'
	} else if (triggerTyep == 'yearly'){
		result =  '{ "_id" : { "dt" : "'+deviceType+'", "key" :'+parseInt(KeyFormat.toString())+', "ty": "Y" }}'
	}
	return JSON.parse(result);
}

function setQueryBuilder(count) {
	return JSON.parse('{"$set":{"val.tuu":'+count+'}}');
}

function getCurrentUtcDate(){
	var now = new Date(); 
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}

function getUtcDateFor(now){
	//var now = new Date(date); 
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}

function getTimezone(appKey) {
	//for(var i in application) {
	for (var i = 0, len = application.length; i < len; i++) {
	var key = application[i];
		if(key.app == appKey) {
			appTZ = key.TZ;	
			console.log(key.app+' : '+ appTZ );
			break;
		}
	}
}

