var mongojs     = require('mongojs');
var moment 		= require('moment-timezone');
var config      = require('../../config/config.js');
var logger 		= require('../../config/log.js');
var common 		= require('../../commons/common.js');
var async       = require('async');
var _ 			= require('underscore');

var appTZ 		= config.defaultAppTimeZone;
var startDate ,endDate ,akey ,searchBy;
var db = mongojs(config.connectionstring+akey);
var resultstring=[],resultstr="";
var startDateWithoutHour,endDateWithoutHour,sdmonth,edmonth,sdyear,edyear,yyyy;
var searchParam,grpvalue,finaldetailstr,finalResponce,YearValue,resultObject;
var searchByArray=[];
var deviceNumber='"'+0+'"';

function aggregateCalulation(grpParam,resulObjParam,yearParam,callback){ // function to fetch userCountersounter by searchparameter
	
		var db = mongojs(config.connectionstring+akey);
		finaldetailstr="";
		var grpParamVal= grpParam;
		var startDateVal=Number(startDate);
		var endDateVal=Number(endDate);
		var ttsKeyValue=yearParam+'.tts';
			
		db.collection(config.coll_users).aggregate([
			{ $match: { $and: [ { 'flog': { $gte: startDateVal }, 'llog': { $lte: endDateVal } },resulObjParam ]}},
			{$unwind: yearParam}, 
			{ $group: {_id : grpParamVal ,'users' :  {$sum : 1},'time' : {$sum : ttsKeyValue}}},
			{ $project: {_id:1,users:1,time:1}}
			],function(err, result) {
			
			
			
			if(!err){
				
				if(result!=null && searchParam!='Notmatch'){
					for(var i=0;i<result.length;i++){
						resultstring[i] = (' {'+' "'+searchBy+'": "'+result[i]._id+'","users": "' +result[i].users + '","time": "' +result[i].time + ' }');
					
						resultstr+=resultstring[i].concat(',');
					}
					resultstr = resultstr.substr(0,resultstr.length-1);
				 
					finaldetailstr='[ '+ resultstr + ']'
					console.log(finaldetailstr);
					callback(err,finaldetailstr);
				}else {
					db.close();
					callback('[]');
				}
			}
				else {
					logger.error(common.getErrorMessageFrom(err));
					return;
				}
				
				}
				
		);
		
} // end of aggregateCalulation function

module.exports.getUserDashboardCounters = function(req,res){

var db = mongojs(config.connectionstring+akey);
startDate = req.query["sd"],endDate = req.query["ed"],akey =req.query["akey"],searchBy=req.query["searchBy"];
var searchByArray=config.searchByModel;

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
	
	
		startDateWithoutHour=String(common.getStartDate(startDate,appTZ));  				//get start date after timezone
		endDateWithoutHour=String(common.getStartDate(endDate,appTZ));						//get start date after timezone
		sdmonth=startDateWithoutHour.substr(4, 2),edmonth=endDateWithoutHour.substr(4, 2);	//get start and end date month
		sdyear=startDateWithoutHour.substr(0, 4),edyear=endDateWithoutHour.substr(0, 4);	//get start and end date year
		yyyy=Number(sdyear);
		
		var sdmonthPart=parseInt(sdmonth),edmonthpart=parseInt(edmonth);
		var gteval=sdmonthPart+startDateWithoutHour.substr(6, 2),lteval=edmonthpart+endDateWithoutHour.substr(6, 2);
		var gtevalNumeric=parseInt(gteval),ltevalNumeric=parseInt(lteval);
		var keyVal='{ "_'+ yyyy +'" : { "$elemMatch":{ "$and" :[ { "_id": { "$gte": '+ gtevalNumeric +' }, "_id": { "$lte": '+ ltevalNumeric +' } }]}} }';
		//console.log(keyVal);
		resultObject=JSON.parse(keyVal);
		
		callback(null);
	}, //callback end
	
	 function(callback) { //callback start
		for(i=0;i<searchByArray.length;i++){
			
			if (searchByArray[i].name==searchBy){ searchParam=searchByArray[i].value;  break;} else { searchParam= 'Notmatch'; }
		}
			callback(null);
	},
	
	
	 function(callback) { //callback start
			//console.log('Aggregate');
			finalResponce="";
			grpvalue='$'+searchParam;
			YearValue='$_'+yyyy;
			aggregateCalulation(grpvalue,resultObject,YearValue,function(err, res){
			if(!err){
				finalResponce=res;
				callback(null);
			}
			else {
				logger.error(common.getErrorMessageFrom(err));
				return;
			}
			});
	 },
	
	function(callback) { //callback start
		db.close();
		return res.json(finalResponce);
	
	}
]);

}





