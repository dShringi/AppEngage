var mongojs     = require('mongojs');
var moment 		= require('moment-timezone');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var logger 		= require('../../config/log.js');
var async       = require('async');
var _ 			= require('underscore');
var appTZ 		= config.defaultAppTimeZone;

module.exports.getUserInsights = function(req,res){

var startDate = req.query["sd"],endDate = req.query["ed"],akey =req.query["akey"];
var sdateparam,edateparam,startDateMoment,endDateMoment,startDateWithoutHour,endDateWithoutHour;
var type="D",inc=config.DAY,diffDays,dateFormat;
var resultstring=[],resultstr="",response;
var outArray = [];
var db = mongojs(config.connectionstring+akey);

async.waterfall(
    [	
	function(callback){ //callback start

		var application = config.appdetails;
		_.each(application,function(data){		
			if(data.app === akey){		
				appTZ = data.TZ;		
				return;		
			}		
		});		

		startDateWithoutHour=common.getStartDate(startDate,appTZ);  //get start moment date without hour.
		endDateWithoutHour=common.getStartDate(endDate,appTZ);	  //get end moment date without hour.
		
		diffDays=endDateWithoutHour-startDateWithoutHour;  //to find no of days between two dates

		if(diffDays==0){ //for weekly fetch
			type="H";
			inc=config.HOUR;
			dateFormat=config.YYYYMMDDHH;
			startDateMoment=common.getStartHour(startDate,appTZ);
			endDateMoment=common.getStartHour(endDate,appTZ);
			for(var i=moment(startDateMoment,dateFormat);i<=moment(endDateMoment,dateFormat);i=i.add(1,inc)){
				outArray[i.format(dateFormat)]={
					tuu:0,
					tts:0	
				};	
			};	
			callback(null);
		} else { 
			type="D";
			inc=config.DAY;
			dateFormat=config.YYYYMMDD;
			startDateMoment=startDateWithoutHour;
			endDateMoment=endDateWithoutHour;
			for(var i=moment(startDateMoment,dateFormat);i<=moment(endDateMoment,dateFormat);i=i.add(1,inc)){
				outArray[i.format(dateFormat)]={
					tuu:0,
					tts:0	
				};	
			};				
			callback(null);
		}
	}, //callback end
	function(callback) { //callback start
		//console.log("type value :" + type);
		db.collection(config.coll_dashboard).aggregate([
		{ $match: { $and: [{'_id.ty': type},{ '_id.key': { $gte: parseInt(startDateMoment), $lte: parseInt(endDateMoment) }}]  } },
		{ $group: {_id :  "$_id.key", 'tuu' : {$sum : "$val.tuu"},'tts' : {$sum : "$val.tts"}}},
		{ $sort: {'_id': 1 } },
		{ $project: {_id:1,tuu:1,tts:1}}
		],function(err, result) {
			if(!err){
				if(result!=null){

					for(var i=0;i<result.length;i++){
						outArray[result[i]._id]={
							tuu:result[i].tuu,
							tts:result[i].tts
						};
					}

					for(var j=moment(startDateMoment,dateFormat);j<=moment(endDateMoment,dateFormat);j=j.add(1,inc)){
						resultstr = resultstr + (' {'+' "date": "'+j.format(dateFormat)+'","tuu": "' +outArray[j.format(dateFormat)].tuu + '","tts": "' +outArray[j.format(dateFormat)].tts+'"},');						
					}					
			 			response = '[ ' + resultstr.substr(0,resultstr.length-1) + ']';
				}else{
					db.close();
					return res.json('[]');
				}
			}else{
				logger.error(common.getErrorMessageFrom(err));
				db.close();
				return res.json('[]');
			}
			callback(null);
		});
	
	},//callback end
	function(callback) { //callback start
		db.close();
		return res.json(response);
	}
]);

}

module.exports.getSessionInsights = function(req,res){

var startDate = req.query["sd"],endDate = req.query["ed"],akey =req.query["akey"];
var sdateparam,edateparam,startDateMoment,endDateMoment,startDateWithoutHour,endDateWithoutHour;
var type="D",inc=config.DAY,diffDays,dateFormat;
var resultstring=[],resultstr="",response;
var outArray = [];
var db = mongojs(config.connectionstring+akey);

async.waterfall(
    [	
	function(callback){ //callback start

		var application = config.appdetails;
		_.each(application,function(data){		
			if(data.app === akey){		
				appTZ = data.TZ;		
				return;		
			}		
		});		

		// code started
		startDateWithoutHour=common.getStartDate(startDate,appTZ);         //get start moment date without hour
		endDateWithoutHour=common.getStartDate(endDate,appTZ);			 //get end moment date without hour
		 
		diffDays=endDateWithoutHour-startDateWithoutHour;  //to find no of days between two dates

		if(diffDays==0){ //for weekly fetch
			type="H";
			inc=config.HOUR;
			dateFormat=config.YYYYMMDDHH;
			startDateMoment=common.getStartHour(startDate,appTZ);
			endDateMoment=common.getStartHour(endDate,appTZ);
			for(var i=moment(startDateMoment,dateFormat);i<=moment(endDateMoment,dateFormat);i=i.add(1,inc)){
				outArray[i.format(dateFormat)]={
					tse:0,
					tts:0	
				};	
			};
			callback(null);
		}else { 
			type="D";
			inc=config.DAY;
			dateFormat=config.YYYYMMDD;
			startDateMoment=startDateWithoutHour;
			endDateMoment=endDateWithoutHour;
			for(var i=moment(startDateMoment,dateFormat);i<=moment(endDateMoment,dateFormat);i=i.add(1,inc)){
				outArray[i.format(dateFormat)]={
					tse:0,
					tts:0	
				};	
			};			
			callback(null);
		}
	}, //callback end
	function(callback) { //callback start
		db.collection(config.coll_dashboard).aggregate([
		{ $match: { $and: [{'_id.ty': type},{ '_id.key': { $gte: parseInt(startDateMoment), $lte: parseInt(endDateMoment) }}]  } },
		{ $group: {_id :  "$_id.key", 'tse' : {$sum : "$val.tse"},'tts' : {$sum : "$val.tts"}}},
		{ $sort: {'_id': 1 } },
		{ $project: {_id:1,tse:1,tts:1}}
		],function(err, result) {		
			if(!err){
				if(result!=null){

					for(var i=0;i<result.length;i++){
						outArray[result[i]._id]={
							tse:result[i].tse,
							tts:result[i].tts
						};
					}

					for(var j=moment(startDateMoment,dateFormat);j<=moment(endDateMoment,dateFormat);j=j.add(1,inc)){
						resultstr = resultstr + (' {'+' "date": "'+j.format(dateFormat)+'","tse": "' +outArray[j.format(dateFormat)].tse + '","tts": "' +outArray[j.format(dateFormat)].tts+'"},');						
					}					
			 			response = '[ ' + resultstr.substr(0,resultstr.length-1) + ']';
				}else{
					db.close();
					return res.json('[]');
				}
			
			}else{
				db.close();	
				logger.error(common.getErrorMessageFrom(err));
             	return res.json('[]');
			}
			callback(null);
		});
	},//callback end
	function(callback) { //callback start
		db.close();
		return res.json(response);	
	}
]);
}