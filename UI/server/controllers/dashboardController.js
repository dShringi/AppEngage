"use strict";

var mongojs     = require('mongojs');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var logger 		= require('../../config/log.js');
var async       = require('async');

module.exports.dashboardRealTime = function(req,res){
	var startdate = req.query.sd;
	var enddate  = req.query.ed;
	var akey =req.query.akey;

	//Finding the extra seconds above rounding to 0.
	startdate = parseInt(startdate - startdate%10);
	enddate = parseInt(enddate - enddate%10);
	var db = mongojs(config.connectionstring+akey);
	if(startdate == enddate){
		db.collection(config.coll_activesessions).count(function(err,result){
			db.close();
			if(!err){
				return res.json('[{"Time":'+startdate+',"DeviceCount":'+result+'}]');
			}else{
				logger.error(common.getErrorMessageFrom(err));
			}
		});
	}else{
		let totalUsers=0;
		let outArray = [];
		let response = '';

		db.collection(config.coll_realtime).aggregate(
		{ $match:{_id:{$lt:startdate}}},
		{ $group:{_id:null,totalUsers:{$sum:"$val"}}}
		,function(err,result){
			db.close();
			if(!err){
				if(result.length !== 0){
					totalUsers=result[0].totalUsers;
				}
				for(let i=startdate;i<=enddate;i=i+10){
					outArray[i] = {
						totalUsers : 0
					};
				}
				db.collection(config.coll_realtime).find(
				{ '_id': {$gte: parseInt(startdate), $lte: parseInt(enddate)}}
				,function(err,result){
					if(!err){
						for(let i=0;i<result.length;i++){
							outArray[result[i]._id] = {
								totalUsers : result[i].val
							};
						}
						for(let i=startdate;i<=enddate;i=i+10){
							response+='{"Time":'+i+',"DeviceCount":'+(parseInt(outArray[i].totalUsers)+parseInt(totalUsers))+'},';
							totalUsers = (parseInt(totalUsers) + parseInt(outArray[i].totalUsers));
						}
						response = response.substr(0,response.length-1);
						return res.json('['+response+']');
					}else{
						logger.error(common.getErrorMessageFrom(err));
						return res.json('[]');
					}
				});
			}else{
				logger.error(common.getErrorMessageFrom(err));
				return res.json('[]');
			}
		});
	}
};

module.exports.dashboardCounters = function(req,res){
	var startDateParam=req.query.sd;
	var endDateParam=req.query.ed;
	var akey =req.query.akey;
	var typeOfDevice=req.query.type;
	var tse=0;
	var te=0;
	var tnu=0;
	var tts=0;
	var tce=0;
	var weeklyCount=0;
	var monthlyCount=0;
	var yearlyCount=0;
	var sdateparam;
	var edateparam;
	var sdmonth;
	var edmonth;
	var sdyear;
	var edyear;
	var distinctUsers;
	var type="D";
	var diffDays;
	var startdateMoment;
	var endDateMoment;
	var startDateWithoutHour;
	var endDateWithoutHour;
	const db = mongojs(config.connectionstring+akey);
	var typeListarray=[];
	var response = '';
	async.waterfall([
		function(callback) { //callback start
			common.getAppTimeZone(akey,function(err,appTZ){
				//checking device type and assigning into typeListarray
				switch (typeOfDevice) {
					case "A" :
						typeListarray[0]="S";
						typeListarray[1]="T";
					break;
					case "S" :
						typeListarray[0]="S";
					break;
					case "T" :
						typeListarray[0]="T";
				}
				startDateWithoutHour=String(common.getStartDate(startDateParam,appTZ));  		//get start moment date
				endDateWithoutHour=String(common.getStartDate(endDateParam,appTZ));			//get end moment date
				startdateMoment=Number(startDateWithoutHour);
				endDateMoment=Number(endDateWithoutHour);
				sdateparam=startDateWithoutHour.substr(0, 4)+"-"+startDateWithoutHour.substr(4, 2)+"-"+startDateWithoutHour.substr(6, 2);
				edateparam=endDateWithoutHour.substr(0, 4)+"-"+endDateWithoutHour.substr(4, 2)+"-"+endDateWithoutHour.substr(6, 2);
				sdmonth=startDateWithoutHour.substr(4, 2);										//get start date month
				edmonth=endDateWithoutHour.substr(4, 2);										//get end date month
				sdyear=startDateWithoutHour.substr(0, 4);										//get start date year
				edyear=endDateWithoutHour.substr(0, 4);										//get end date year
/*
				diffDays=common.getDateDiffernce(sdateparam,edateparam);  //to find no of days between two dates
				if(diffDays<=7){ //for weekly fetch
					var weekFirstDateforStartDate=common.getWeekFirstdateForStartDate(sdateparam);    //find start date of week base on start date
					var weekFirstDateforEndDate=common.getWeekFirstdateForEndDate(edateparam);		 //find start date of week base on end date
					db.collection(config.coll_dashboard).count({$and: [{ '_id.key': { $gte: parseInt(startdateMoment), $lte: parseInt(endDateMoment) }},{ "_id.ty": "W"}]},function(err, result) {
						if(!err){
							weeklyCount=result;
							//console.log("weekly count: "+ weeklyCount);
								if (weeklyCount>=1 && weekFirstDateforStartDate==weekFirstDateforEndDate){type="W";} else {type="D";}
									//console.log("type value: " + type);
									callback(null);
						}
					});
				}
				else if(diffDays>7 && sdmonth == edmonth )  { // checking for monthly started
					db.collection(config.coll_dashboard).count({$and: [{ '_id.key': { $gte: parseInt(startdateMoment), $lte: parseInt(endDateMoment) }},{ "_id.ty": "M"}]},function(err, result) {
						if(!err){
							monthlyCount=result;
								if (monthlyCount>=1 ){type="M";} else {type="D";}
									callback(null);
						}
					});
				}
				else if(diffDays>7 && sdmonth != edmonth && sdyear == edyear) {  // checking for year started
					db.collection(config.coll_dashboard).count({$and: [{ '_id.key': { $gte: parseInt(startdateMoment), $lte: parseInt(endDateMoment) }},{ "_id.ty": "Y"}]},function(err, result) {
						if(!err){
							yearlyCount=result;
								if (yearlyCount>=1 ){type="Y";} else {type="D";}
									callback(null);
						}
					});
				}
				else {
					callback(null);
				}
*/
			});
		}, //callback end
		function(callback) { //callback start
			//find distinct no of users
				let gteval=parseInt(parseInt(sdmonth)+startDateWithoutHour.substr(6, 2));
				let lteval=parseInt(parseInt(edmonth)+endDateWithoutHour.substr(6, 2));

				let startYYYY = parseInt(sdyear);
				let endYYYY = parseInt(edyear);
				let keyVal='{"$and":[{ "_'+startYYYY+'._id": { "$gte": '+ gteval +' }},{"_'+endYYYY+'._id": { "$lte": '+ lteval +' }},{"ldt":{"$in":["'+typeListarray.toString().replace(',','","')+'"]}}]}';
				let resultObject=JSON.parse(keyVal);
				db.collection(config.coll_users).count(resultObject,function(err,res){
					distinctUsers=res;
					callback(null);
				});
		}, //callback end
		function(callback) { //callback start
			//console.log("final type value" + type);
			db.collection(config.coll_dashboard).aggregate([
				{ $match: { $and: [{'_id.ty': type},{'_id.dt':{$in:typeListarray}},{ '_id.key': { $gte: parseInt(startdateMoment), $lte: parseInt(endDateMoment) }}]  } },
				{ $group: {_id : "$_id.key", 'tse' : {$sum : "$val.tse"},'te' : {$sum : "$val.te"},'tnu' : {$sum : "$val.tnu"},'tts' : {$sum : "$val.tts"},'tce' : {$sum : "$val.tce"}}},
				{ $project: {_id:0,tse:1,te:1,tuu:1,tnu:1,tts:1,tce:1}}
				],function(err, result) {
					db.close();
					if(!err){
						if(result.length!==0){
							for(let i=0;i<result.length;i++){
								tse+=result[i].tse;
								te+=result[i].te;
								tnu+=result[i].tnu;
								tts+=result[i].tts;
								tce+=result[i].tce;
							}
							response = '[{"tse":'+tse+',"te":' +te+',"tuu":' +distinctUsers+',"tnu":' +tnu+',"tts":' +tts+',"tce":' +tce+'}]';
							callback(null);
						}else{
							response='[]';
							callback(null);
						}
					}else{
						logger.error(common.getErrorMessageFrom(err));
						return;
					}
			});
		},//callback end
		function(callback) { //callback start
			return res.json(response);
		}
	]);
};
