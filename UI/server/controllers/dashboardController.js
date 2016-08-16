var mongojs     = require('mongojs');
var moment 		= require('moment-timezone');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var logger 		= require('../../config/log.js');
var async       = require('async');
var _ 			= require('underscore');
var appTZ 		= 'Asia/Kolkata';


module.exports.dashboardRealTime = function(req,res){

var startdate = req.query["sd"],enddate  = req.query["ed"],akey =req.query["akey"],response="";
//Finding the extra seconds above rounding to 0.
startdate = startdate - startdate%10;
enddate = enddate - enddate%10;
var db = mongojs(config.connectionstring+akey);
if(startdate == enddate){
	db.collection(config.coll_activesessions).count(function(err,result){
		if(!err){
			db.close();
			return res.json('[{"Time":'+startdate+',"DeviceCount":'+result+'}]');
		}else{
		//TODO Error Logging mechanism
			db.close();
			console.log('Some Error Occured');
		}
	});
}else{
	db.collection(config.coll_realtime).find(
	{ '_id': {$gte: parseInt(startdate), $lte: parseInt(enddate)}}
	,function(err,result){
		if(!err){
			if(result.length==0){
				db.close();
				for(i=0;i<30;i++){
					response+='{"Time":'+startdate+',"DeviceCount":0},';
					startdate = startdate + 10;
				}
				response = response.substr(0,response.length-1);
				return res.json('['+response+']');
			}else{
				db.close();
				for(i=0;i<result.length;i++){
					response+='{"Time":'+result[i]._id+',"DeviceCount":'+result[i].val+'},'	
				}
				response = response.substr(0,response.length-1);
				return res.json('['+response+']');
			}
		}else{
                //TODO Error Logging mechanism
                console.log('Some Error Occured');
		}
		console.log(result)
		console.log(err)
		db.close();
		return res.json(result);	
	});
}
};

module.exports.dashboardCounters = function(req,res){


var sDate = req.query["sd"],eDate = req.query["ed"],akey =req.query["akey"],typeOfDevice=req.query["type"];	
var tse=0,te=0,tuu=0,tnu=0,tts=0,tce=0,weeklyCount=0,monthlyCount=0,yearlyCount=0;
var startDateParam=sDate,endDateParam=eDate,sdateparam,edateparam,sdmonth,edmonth,sdyear,edyear,gteval,lteval,distinctUsers;
var type="D",diffDays;
var startdateMoment,endDateMoment;
var startDateWithoutHour,endDateWithoutHour;
var db = mongojs(config.connectionstring+akey);
var typeListarray=[];
async.waterfall(
    [	
		
	function(callback) { //callback start
		//checking device type and assigning into typeListarray
		switch (typeOfDevice) { case "A" : typeListarray[0]="S";typeListarray[1]="T"; break; case "S" : typeListarray[0]="S"; break; case "T" : typeListarray[0]="T"; }
		console.log(typeListarray);
		callback(null);
	},
	
	function(callback){ //callback start
	
		var application = config.appdetails;

		_.each(application,function(data){
			if(data.app === akey){
				appTZ = data.TZ;
				return;
			}
	});
	
	
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
		 
		diffDays=common.getDateDiffernce(sdateparam,edateparam);  //to find no of days between two dates
		callback(null);
	}, //callback end
	
	function(callback){ //callback start
		if(diffDays<=7){ //for weekly fetch
			var weekFirstDateforStartDate=common.getWeekFirstdateForStartDate(sdateparam);    //find start date of week base on start date
			var weekFirstDateforEndDate=common.getWeekFirstdateForEndDate(edateparam);		 //find start date of week base on end date
	
			db.collection(config.coll_dashboard).count({$and: [{ '_id.key': { $gte: parseInt(startdateMoment), $lte: parseInt(endDateMoment) }},{ "_id.ty": "W"}]},function(err, result) {
				if(!err){
					weeklyCount=result;		
					console.log("weekly count: "+ weeklyCount);
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
	
		else { callback(null)}
	}, //callback end
	
	function(callback) { //callback start
		//find distinct no of users
	
			var sdmonthPart=parseInt(sdmonth),edmonthpart=parseInt(edmonth);
			gteval=sdmonthPart+startDateWithoutHour.substr(6, 2);
			lteval=edmonthpart+endDateWithoutHour.substr(6, 2);
			
			var gtevalNumeric=parseInt(gteval),ltevalNumeric=parseInt(lteval),yyyy=Number(sdyear);
			var keyVal='{ "_'+ yyyy +'" : { "$elemMatch": { "_id": { "$gte": '+ gtevalNumeric +' }, "_id": { "$lte": '+ ltevalNumeric +' } } } }';
			console.log(keyVal);
			var resultObject=JSON.parse(keyVal);
			
			db.collection(config.coll_users).count(resultObject,function(err,res){
			distinctUsers=res;
			//console.log(distinctUsers);
			});
			
	callback(null);
	}, //callback end
	
	function(callback) { //callback start
		//console.log("final type value" + type);
		db.collection(config.coll_dashboard).aggregate([
			{ $match: { $and: [{'_id.ty': type},{'_id.dt':{$in:typeListarray}},{ '_id.key': { $gte: parseInt(startdateMoment), $lte: parseInt(endDateMoment) }}]  } },
			{ $group: {_id : "$_id.key", 'tse' : {$sum : "$val.tse"},'te' : {$sum : "$val.te"},'tnu' : {$sum : "$val.tnu"},'tts' : {$sum : "$val.tts"},'tce' : {$sum : "$val.tce"}}},
			{ $project: {_id:0,tse:1,te:1,tuu:1,tnu:1,tts:1,tce:1}}
			],function(err, result) {
				//console.log(result);
				if(!err){
					if(result.length!=0){
				//console.log(result[0]);
						for(var i=0;i<result.length;i++){
							tse+=result[i].tse;
							te+=result[i].te;
							//tuu+=result[i].tuu;
							tnu+=result[i].tnu;
							tts+=result[i].tts;
							tce+=result[i].tce;
						}; 
						response = '[{"tse":'+tse+',"te":' +te+',"tuu":' +distinctUsers+',"tnu":' +tnu+',"tts":' +tts+',"tce":' +tce+'}]';
						console.log(response);
						callback(null);
					}else{
						response='[]';
						callback(null);
					}
				}else{
					db.close();
					logger.error(common.getErrorMessageFrom(err));
					return;
					//return res.json(err);
				}
		});
	
	
	},//callback end
	function(callback) { //callback start
		db.close();
		return res.json(response);
	
	}
]);

}
