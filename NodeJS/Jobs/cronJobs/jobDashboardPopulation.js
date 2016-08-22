// use this script to update dashboard collection
'use strict'
var mongodb = require('mongodb');
var dateFormat = require('dateformat');
var logger = require('./conf/log.js');
var config = require('./conf/config.js');
var common = require('./commons/common');

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

			var beginsCollection = db.collection('coll_begins');
		
			var endDate=new Date();
			var endDateUnixtime = Math.round(endDate.getTime() / 1000);

			var startDate;
			if(triggerTyep == 'Hourly' || triggerTyep == 'hourly') {
				startDate = new Date(endDate-60*60*1000);
			} else if (triggerTyep == 'Daily' || triggerTyep == 'daily') {
				startDate = new Date(endDate-(24*60*60*1000));
			}
			var startDateUnixtime = Math.round(startDate.getTime() / 1000);
			
			console.log('startDate : ', startDateUnixtime);
			console.log('endDateUnixtime : ', endDateUnixtime);
			
			//this query will form a implicit AND (no need to decleare explicit AND)
			var query = [{$match:{rtr:{$gte:startDateUnixtime,$lt:endDateUnixtime}}},{$group:{_id :{val:"$val.dt","val.did":"$val.did"}}},{$group:{_id:{f:'$_id.val'},"users":{$sum:1}}}];
			
			beginsCollection.aggregate(query,function(err, items) {
				var resultLength = items.length;
				
				// find tablet/smart phone entry
				var smartCount;
				var tabletCount;
				for (var i in items) {
					var result = items[i];
					if(result._id.f == 'S') {
						smartCount = result.users;
					} else if(result._id.f == 'T'){
						tabletCount = result.users;
					}
				}
			
				if(resultLength > 0){
					var now = new Date();
					var dashboardKey = dateFormat(now, "yyyymmddHH");
					console.log('key ' ,dashboardKey);
					var dashboardCollection = db.collection('coll_dashboard');
					
					
					//tablet Hourly collection update
					if(smartCount != null && smartCount > 0) {
						var dashboardQueryTablet = {$and:[{"_id.ty":"H"}, {"_id.dt" : "S"},{"_id.key":{$eq:dashboardKey}}]};
						dashboardCollection.update(dashboardQueryTablet, { $set:{"val.tuu":smartCount}},function( err, result ) {
							if ( err ) {
								var errMsg = common.getErrorMessageFrom(err);
								logger.error(errMsg);
							}
						});
					}
				
					//smart phone Hourly collection update
					if(tabletCount != null && tabletCount > 0) {
						var dashboardQuerySmart = {$and:[{"_id.ty":"H"}, {"_id.dt" : "T"},{"_id.key":{$eq:dashboardKey}}]};
						dashboardCollection.update(dashboardQuerySmart, { $set:{"val.tuu":tabletCount}},function( err, result ) {
							if ( err ) {
								var errMsg = common.getErrorMessageFrom(err);
								logger.error(errMsg);
							}
						});
					}
				} else {
					console.log('no record found...!');
				}
			db.close();
			});
		}
	});

} else {
	console.log('arguments required order is "url" " appkey" "type(Hourly/Daily)"');
}