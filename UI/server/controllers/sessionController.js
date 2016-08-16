var mongojs     = require('mongojs');
var moment 		= require('moment-timezone');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var logger 		= require('../../config/log.js');
var async       = require('async');
var _ 			= require('underscore');
var appTZ 		= 'Asia/Kolkata';

module.exports.getUserInsights = function(req,res){

var startDate = req.query["sd"],endDate = req.query["ed"],akey =req.query["akey"];
var sdateparam,edateparam,startDateMoment,endDateMoment,startDateWithoutHour,endDateWithoutHour;
var type="D",diffDays;
var resultstring=[],resultstr="";
var db = mongojs(config.connectionstring+akey);

console.log("inside");

async.waterfall(
    [	
	function(callback){ //callback start
	
		var application = config.appdetails;		//fetching timezone
		_.each(application,function(data){
			if(data.app === akey){
				appTZ = data.TZ;
				return;
			}
	});
	
	
	 startDateWithoutHour=String(common.getStartDate(startDate,appTZ));  //get start moment date without hour.
	 endDateWithoutHour=String(common.getStartDate(endDate,appTZ));	  //get end moment date without hour.
	 
	 sdateparam=startDateWithoutHour.substr(0, 4)+"-"+startDateWithoutHour.substr(4, 2)+"-"+startDateWithoutHour.substr(6, 2);
	 edateparam=endDateWithoutHour.substr(0, 4)+"-"+endDateWithoutHour.substr(4, 2)+"-"+endDateWithoutHour.substr(6, 2);
	
	 diffDays=common.getDateDiffernce(sdateparam,edateparam);  //to find no of days between two dates
	callback(null);
	}, //callback end
	
	function(callback){ //callback start
		if(diffDays==0){ //for weekly fetch
			type="H";
			startDateMoment=String(common.getStartHour(startDate,appTZ));
			endDateMoment=String(common.getStartHour(endDate,appTZ));
			callback(null);
		} else { 
			type="D";
			startDateMoment=startDateWithoutHour;
			endDateMoment=endDateWithoutHour;
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
			
				//console.log(result);
				if(result!=null){
					for(var i=0;i<result.length;i++){
						resultstring[i] = (' {'+' "date": "'+result[i]._id+'","tuu": "' +result[i].tuu + '","tts": "' +result[i].tts);
						resultstr+=resultstring[i].concat(',');
				
					}
					resultstr = resultstr.substr(0,resultstr.length-1);
					 //console.log(resultstr);
					finaldetailstr='[ '+ resultstr + ']'
					console.log(finaldetailstr);
				}else{
				db.close();
				return res.json('[]');
					}
				}else{
					logger.error(common.getErrorMessageFrom(err));
					 return;
					}
				callback(null);
			});
		
	},//callback end
	function(callback) { //callback start
		db.close();
		return res.json(finaldetailstr);
	}
]);

}

module.exports.getSessionInsights = function(req,res){

var startDate = req.query["sd"],endDate = req.query["ed"],akey =req.query["akey"];
var sdateparam,edateparam,startDateMoment,endDateMoment,startDateWithoutHour,endDateWithoutHour;
var type="D",diffDays;
var resultstring=[],resultstr="";
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
	startDateWithoutHour=String(common.getStartDate(startDate,appTZ));         //get start moment date without hour
	endDateWithoutHour=String(common.getStartDate(endDate,appTZ));			 //get end moment date without hour
	 
	sdateparam=startDateWithoutHour.substr(0, 4)+"-"+startDateWithoutHour.substr(4, 2)+"-"+startDateWithoutHour.substr(6, 2);
	edateparam=endDateWithoutHour.substr(0, 4)+"-"+endDateWithoutHour.substr(4, 2)+"-"+endDateWithoutHour.substr(6, 2);
	
	diffDays=common.getDateDiffernce(sdateparam,edateparam);  //to find no of days between two dates

	callback(null);
	}, //callback end
	
	function(callback){ //callback start
		if(diffDays==0){ //for weekly fetch
			type="H";
			startDateMoment=String(common.getStartHour(startDate,appTZ));
			endDateMoment=String(common.getStartHour(endDate,appTZ));
			callback(null);
		}else { 
			type="D";
			startDateMoment=startDateWithoutHour;
			endDateMoment=endDateWithoutHour;
			callback(null);
		}
	}, //callback end
	
	function(callback) { //callback start	
		//console.log("type value :" + type);
		db.collection(config.coll_dashboard).aggregate([
		{ $match: { $and: [{'_id.ty': type},{ '_id.key': { $gte: parseInt(startDateMoment), $lte: parseInt(endDateMoment) }}]  } },
		{ $group: {_id :  "$_id.key", 'tse' : {$sum : "$val.tse"},'tts' : {$sum : "$val.tts"}}},
		{ $sort: {'_id': 1 } },
		{ $project: {_id:1,tse:1,tts:1}}
		],function(err, result) {		
			if(!err){
			//console.log(result);
				if(result!=null){
					for(var i=0;i<result.length;i++){
						resultstring[i] = (' {'+' "date": "'+result[i]._id+'","tse": "' +result[i].tse + '","tts": "' +result[i].tts);					
						resultstr+=resultstring[i].concat(',');
					}

			 		resultstr = resultstr.substr(0,resultstr.length-1);
					finaldetailstr='[ '+ resultstr + ']'
					//console.log(finaldetailstr);
				}else{
					db.close();
					return res.json('[]');
				}
			
			}else{
				logger.error(common.getErrorMessageFrom(err));
             	return;
			}
			callback(null);
		});
	},//callback end
	function(callback) { //callback start
		db.close();
		return res.json(finaldetailstr);	
	}
]);


}





