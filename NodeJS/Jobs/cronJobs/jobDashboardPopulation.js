// use this script to update dashboard collection
'use strict'
var mongodb = require('mongodb');
var dateFormat = require('dateformat');
var logger = require('././Scripts/conf/log.js');
var config = require('././Scripts/conf/config.js');
var common = require('././Scripts/commons/common');


var MongoClient = mongodb.MongoClient;

var url = process.argv[2];
var appKey =  process.argv[3];
var triggerTyep = process.argv[4];

if (Boolean(url) && Boolean(appKey) && Boolean(triggerTyep)){
	MongoClient.connect(url, function (err, db) {
		if (err) {
			var errMsg = common.getErrorMessageFrom(err);
            logger.error(errMsg);
			
		} else {
			console.log('Connection established to', url);
			
			var endDate=new Date();
			var endDateUnixtime = Math.round(endDate.getTime() / 1000);
			var endDateDay = endDate.getDate();
			var endDateMonth = endDate.getMonth()+1;
			var endDateYear = endDate.getFullYear();
			
			var startDate;
			if(triggerTyep == 'Hourly' || triggerTyep == 'hourly') {
				startDate = new Date(endDate-60*60*1000);
				var beginsCollection = db.collection('coll_begins');
				
				var startDateUnixtime = Math.round(startDate.getTime() / 1000);
				//this query will form a implicit AND (no need to decleare explicit AND)
				var query = [{$match:{rtr:{$gte:startDateUnixtime,$lt:endDateUnixtime}}},{$group:{_id :{val:"$val.dt","val.did":"$val.did"}}},{$group:{_id:{result:'$_id.val'},"users":{$sum:1}}}];
				beginsCollection.aggregate(query,function(err, items) {
					if(err){
						var errMsg = common.getErrorMessageFrom(err);
						logger.error(errMsg);
					}
					var resultLength = items.length;
					if(resultLength > 0){
						// find tablet/smart phone entry
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
					
						var KeyFormat = dateFormat(endDate, "yyyymmddHH");
						var dashboardCollection = db.collection('coll_dashboard');
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmart = '{"$and":[{"_id.ty":"H"}, {"_id.dt" : "S"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQuerySmartJson = JSON.parse(dashboardQuerySmart);
							//var updateSmt = '{"$set":{"val.tuu":'+smartCount+'}}';
							//var updateQueryJsonSmt = JSON.parse(updateSmt);
							var updateSmt = {};
							updateSmt["val.tuu"]=smartCount;
							dashboardCollection.update(dashboardQuerySmart, updateSmt,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTablet = '{"$and":[{"_id.ty":"H"}, {"_id.dt" : "T"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQueryTabletJson = JSON.parse(dashboardQueryTablet);
							//var updateTab = '{"$set":{"val.tuu":'+tabletCount+'}}';
							//var updateQueryJsonTab = JSON.parse(updateTab);
							var updateTab = {};
							updateTab['val.tuu']=tabletCount;
							dashboardCollection.update(dashboardQueryTablet, updateTab ,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
						console.log('all done...!');
					} else {
						console.log('no record found...!');
					}
					db.close();
				});
			} else if (triggerTyep == 'Daily' || triggerTyep == 'daily') {
				startDate = new Date(endDate-(24*60*60*1000));
				var startDateDay = startDate.getDate();
				if(startDateDay < 10) {
					startDateDay = '0'+startDateDay;
				}
				if(endDateDay < 10) {
					endDateDay = '0'+endDateDay;
				}
				
				var startDateMonth = startDate.getMonth()+1;
				var startDateYear = startDate.getFullYear();
				
				var usersCollection = db.collection('coll_users');
				var endDayMonth = parseInt(''+endDateMonth+''+endDateDay);
				var startDayMonth = parseInt(''+startDateMonth+''+startDateDay);
				var unwindvar = '$_'+endDateYear;
				var matchKey = '_'+endDateYear+'._id';
				
				var query = [{"$match":{"_2016._id" : {"$gte":startDayMonth,"$lt":endDayMonth}}},{"$unwind": unwindvar},{"$group":{"_id":{"result" : "$ldt"},"users":{"$sum": 1}}}];
				//var query = '[{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lt":'+endDayMonth+'}}},{"$unwind": "'+unwindvar+'"},{"$group":{"_id":{"ldt" : "$ldt"},"users":{"$sum": 1}}}]';
				
				usersCollection.aggregate(query,function(err, items) {
					if(err){
						var errMsg = common.getErrorMessageFrom(err);
						logger.error(errMsg);
					}
					var resultLength = items.length;
					if(resultLength > 0){
						// find tablet/smart phone entry
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
						
						var KeyFormat = dateFormat(endDate, "yyyymmdd");
						var dashboardCollection = db.collection('coll_dashboard');
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmart = '{"$and":[{"_id.ty":"D"}, {"_id.dt" : "S"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQuerySmartJson = JSON.parse(dashboardQuerySmart);
							//var updateSmt = '{"$set":{"val.tuu":'+smartCount+'}}';
							//var updateQueryJsonSmt = JSON.parse(updateSmt);
							var updateSmt = {};
							updateSmt['val.tuu']=smartCount;
							dashboardCollection.update(dashboardQuerySmart, updateSmt,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTablet = '{"$and":[{"_id.ty":"D"}, {"_id.dt" : "T"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQueryTabletJson = JSON.parse(dashboardQueryTablet);
							//var updateTab = '{"$set":{"val.tuu":'+tabletCount+'}}';
							//var updateQueryJsonTab = JSON.parse(updateTab);
							var updateTab = {};
							updateTab['val.tuu']=tabletCount;
							dashboardCollection.update(dashboardQueryTablet, updateTab ,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
						console.log('all done...!');
					} else {
						console.log('no record found...!');
					}
					db.close();
				});
			} else if(triggerTyep == 'Weekly' || triggerTyep == 'weekly'){
			
				startDate = new Date();
				startDate.setDate(startDate.getDate() - 7);
				var startDateDay = startDate.getDate();
				if(startDateDay < 10) {
					startDateDay = '0'+startDateDay;
				}
				if(endDateDay < 10) {
					endDateDay = '0'+endDateDay;
				}
				
				
				var startDateMonth = startDate.getMonth()+1;
				var startDateYear = startDate.getFullYear();
				
				var usersCollection = db.collection('coll_users');
				var endDayMonth = parseInt(''+endDateMonth+''+endDateDay);
				var startDayMonth = parseInt(''+startDateMonth+''+startDateDay);
				var unwindvar = '$_'+endDateYear;
				var matchKey = '_'+endDateYear+'._id';
				
				var query = [{"$match":{"_2016._id" : {"$gte":startDayMonth,"$lt":endDayMonth}}},{"$unwind": unwindvar},{"$group":{"_id":{"result" : "$ldt"},"users":{"$sum": 1}}}];
				//var query = '[{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lt":'+endDayMonth+'}}},{"$unwind": "'+unwindvar+'"},{"$group":{"_id":{"ldt" : "$ldt"},"users":{"$sum": 1}}}]';
				
				usersCollection.aggregate(query,function(err, items) {
					if(err){
						var errMsg = common.getErrorMessageFrom(err);
						logger.error(errMsg);
					}
					var resultLength = items.length;
					if(resultLength > 0){
						// find tablet/smart phone entry
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
						
						var KeyFormat = dateFormat(endDate, "yyyymmddHH");
						var dashboardCollection = db.collection('coll_dashboard');
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmart = '{"$and":[{"_id.ty":"W"}, {"_id.dt" : "S"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQuerySmartJson = JSON.parse(dashboardQuerySmart);
							//var updateSmt = '{"$set":{"val.tuu":'+smartCount+'}}';
							//var updateQueryJsonSmt = JSON.parse(updateSmt);
							var updateSmt = {};
							updateSmt['val.tuu']=smartCount;
							dashboardCollection.update(dashboardQuerySmart, updateSmt,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTablet = '{"$and":[{"_id.ty":"W"}, {"_id.dt" : "T"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQueryTabletJson = JSON.parse(dashboardQueryTablet);
							//var updateTab = '{"$set":{"val.tuu":'+tabletCount+'}}';
							//var updateQueryJsonTab = JSON.parse(updateTab);
							var updateTab = {};
							updateTab['val.tuu']=tabletCount;
							dashboardCollection.update(dashboardQueryTablet, updateTab ,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
						console.log('all done...!');
					} else {
						console.log('no record found...!');
					}
					db.close();
				});
			
			} else if(triggerTyep == 'Monthly' || triggerTyep == 'monthly'){
				startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
				var startDateDay = startDate.getDate();
				
				if(startDateDay < 10) {
					startDateDay = '0'+startDateDay;
				}
				if(endDateDay < 10) {
					endDateDay = '0'+endDateDay;
				}
				var startDateMonth = startDate.getMonth()+1;
				var startDateYear = startDate.getFullYear();
				
				var usersCollection = db.collection('coll_users');
				var endDayMonth = parseInt(''+endDateMonth+''+endDateDay);
				var startDayMonth = parseInt(''+startDateMonth+''+startDateDay);
				var unwindvar = '$_'+endDateYear;
				var matchKey = '_'+endDateYear+'._id';
				
				var query = [{"$match":{"_2016._id" : {"$gte":startDayMonth,"$lt":endDayMonth}}},{"$unwind": unwindvar},{"$group":{"_id":{"result" : "$ldt"},"users":{"$sum": 1}}}];
				//var query = '[{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lt":'+endDayMonth+'}}},{"$unwind": "'+unwindvar+'"},{"$group":{"_id":{"ldt" : "$ldt"},"users":{"$sum": 1}}}]';
				
				usersCollection.aggregate(query,function(err, items) {
					if(err){
						var errMsg = common.getErrorMessageFrom(err);
						logger.error(errMsg);
					}
					var resultLength = items.length;
					if(resultLength > 0){
						// find tablet/smart phone entry
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
						
						var KeyFormat = dateFormat(endDate, "yyyymmddHH");
						var dashboardCollection = db.collection('coll_dashboard');
					
						//smart Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmart = '{"$and":[{"_id.ty":"M"}, {"_id.dt" : "S"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQuerySmartJson = JSON.parse(dashboardQuerySmart);
							//var updateSmt = '{"$set":{"val.tuu":'+smartCount+'}}';
							//var updateQueryJsonSmt = JSON.parse(updateSmt);
							var updateSmt = {};
							updateSmt['val.tuu']=smartCount;
							dashboardCollection.update(dashboardQuerySmart, updateSmt,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
				
						//tablet phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTablet = '{"$and":[{"_id.ty":"M"}, {"_id.dt" : "T"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQueryTabletJson = JSON.parse(dashboardQueryTablet);
							//var updateTab = '{"$set":{"val.tuu":'+tabletCount+'}}';
							//var updateQueryJsonTab = JSON.parse(updateTab);
							var updateTab = {};
							updateTab['val.tuu']=tabletCount;
							dashboardCollection.update(dashboardQueryTablet, updateTab ,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
						console.log('all done...!');
					} else {
						console.log('no record found...!');
					}
					db.close();
				});
			
			}else if(triggerTyep == 'Yearly' || triggerTyep == 'yearly'){
				startDate = new Date(endDate.getFullYear(),0, 1);
				var startDateDay = startDate.getDate();
				
				if(startDateDay < 10) {
					startDateDay = '0'+startDateDay;
				}
				if(endDateDay < 10) {
					endDateDay = '0'+endDateDay;
				}
				var startDateMonth = startDate.getMonth()+1;
				var startDateYear = startDate.getFullYear();
				
				var usersCollection = db.collection('coll_users');
				var endDayMonth = parseInt(''+endDateMonth+''+endDateDay);
				var startDayMonth = parseInt(''+startDateMonth+''+startDateDay);
				var unwindvar = '$_'+endDateYear;
				var matchKey = '_'+endDateYear+'._id';
				
				var query = [{"$match":{"_2016._id" : {"$gte":startDayMonth,"$lt":endDayMonth}}},{"$unwind": unwindvar},{"$group":{"_id":{"result" : "$ldt"},"users":{"$sum": 1}}}];
				//var query = '[{"$match":{"'+matchKey+'" : {"$gte":'+startDayMonth+',"$lt":'+endDayMonth+'}}},{"$unwind": "'+unwindvar+'"},{"$group":{"_id":{"ldt" : "$ldt"},"users":{"$sum": 1}}}]';
				
				usersCollection.aggregate(query,function(err, items) {
					if(err){
						var errMsg = common.getErrorMessageFrom(err);
						logger.error(errMsg);
					}
					var resultLength = items.length;
					if(resultLength > 0){
						// find tablet/smart phone entry
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
						
						var KeyFormat = dateFormat(endDate, "yyyymmddHH");
						var dashboardCollection = db.collection('coll_dashboard');
					
						//tablet Hourly collection update
						if(smartCount != null && smartCount > 0) {
							var dashboardQuerySmart = '{"$and":[{"_id.ty":"M"}, {"_id.dt" : "S"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQuerySmartJson = JSON.parse(dashboardQuerySmart);
							//var updateSmt = '{"$set":{"val.tuu":'+smartCount+'}}';
							//var updateQueryJsonSmt = JSON.parse(updateSmt);
							var updateSmt = {};
							updateSmt['val.tuu']=smartCount;
							dashboardCollection.update(dashboardQuerySmart, updateSmt,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
						}
				
						//smart phone Hourly collection update
						if(tabletCount != null && tabletCount > 0) {
							var dashboardQueryTablet = '{"$and":[{"_id.ty":"Y"}, {"_id.dt" : "Y"},{"_id.key":{"$eq":'+parseInt(KeyFormat.toString())+'}}]}';
							var dashboardQueryTabletJson = JSON.parse(dashboardQueryTablet);
							//var updateTab = '{"$set":{"val.tuu":'+tabletCount+'}}';
							//var updateQueryJsonTab = JSON.parse(updateTab);
							var updateTab = {};
							updateTab['val.tuu']=tabletCount;
							dashboardCollection.update(dashboardQueryTablet, updateTab ,function( err, result ) {
								if ( err ) {
									var errMsg = common.getErrorMessageFrom(err);
									logger.error(errMsg);
								}
							});
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
