var mongojs     = require('mongojs');
var config      = require('../../config/config.js');
var logger 		= require('../../config/log.js');
var common 		= require('../../commons/common.js');
var _ 			= require('underscore');
var appTZ 		= config.defaultAppTimeZone;
var searchParam='Notmatch';
var arrPlatform = [],arrType=[];
var arrModel	= [];
var platform    = config.platform;
var type    	= config.type;
var model 		= config.model
var startDate ,endDate ,akey;

for(i=0;i<platform.length;i++){
	arrPlatform[platform[i].shortpf] = platform[i].displaypf;
}

for(i=0;i<type.length;i++){
	arrType[type[i].shortpf] = type[i].displaypf;
}

for(i=0;i<model.length;i++){
	arrModel[model[i].shortpf] = model[i].displaypf;
}

function aggregateCalulation(akey,yyyy,searchBy,searchParam,gtevalNumeric,ltevalNumeric,callback){ // function to fetch userCountersounter by searchparameter
		var db = mongojs(config.connectionstring+akey);
		var finaldetailstr="";
		var resultstring=[],resultstr="";
		var matchCon1='[{ "_'+ yyyy +'" : { "$elemMatch":{ "$and" :[ { "_id": { "$gte": '+ gtevalNumeric +' }, "_id": { "$lte": '+ ltevalNumeric +' } }]}} }]';
		var matchJSON1=JSON.parse(matchCon1);
		var yearParam='$_'+yyyy;
		var ttsKeyValue=yearParam+'.tts';
		var matchCon2='[{"_'+yyyy+'._id":{"$gte":'+gtevalNumeric+'}},{"_'+yyyy+'._id":{"$lte":'+ltevalNumeric+'}}]';
		var matchJSON2=JSON.parse(matchCon2);		
		var grpParam1='{"dev":"$'+searchParam+'","did":"$_id"}';
		var grpParamJSON1 = JSON.parse(grpParam1);
		var grpParam2='{"_id":"$_id.dev","users": {"$sum": 1},"time": {"$sum":"$tts"}}';
		var grpParamJSON2 = JSON.parse(grpParam2);
		var modelVal,typeVal,platformVal;	

		db.collection(config.coll_users).aggregate([
			{ $match: { $and: matchJSON1 }},
			{ $unwind: yearParam},
			{ $match:{$and: matchJSON2 }},
			{ $group: {_id : grpParamJSON1,'tts' : {$sum : ttsKeyValue}}},
			{ $group: {_id:'$_id.dev',users: {$sum: 1},time: {$sum:'$tts'}}},			
			{ $project: {_id:1,users:1,time:1}}
			],function(err, result) {
			if(!err){
				if(result.length != 0 && searchParam!='Notmatch'){
					for(var i=0;i<result.length;i++){
						if(searchBy === 'platform'){
							platformVal = arrModel[result[i]._id];
							if(platformVal == config.UNDEFINED || platformVal == config.NULL || platformVal == config.EMPTYSTRING) platformVal = result[i]._id;
							resultstring[i] = (' {'+' "'+searchBy+'": "'+platformVal+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}else if(searchBy === 'type'){
							typeVal = arrModel[result[i]._id];
							if(typeVal == config.UNDEFINED || typeVal == config.NULL || typeVal == config.EMPTYSTRING) typeVal = result[i]._id;
							resultstring[i] = (' {'+' "'+searchBy+'": "'+typeVal+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}else if(searchBy === 'model'){
							modelVal = arrModel[result[i]._id];
							if(modelVal == config.UNDEFINED || modelVal == config.NULL || modelVal == config.EMPTYSTRING) modelVal = result[i]._id;
							resultstring[i] = (' {'+' "'+searchBy+'": "'+modelVal+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}else{
							resultstring[i] = (' {'+' "'+searchBy+'": "'+result[i]._id+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}
						resultstr+=resultstring[i].concat(',');
					}
					resultstr = resultstr.substr(0,resultstr.length-1);
					finaldetailstr='[ '+ resultstr + ']'
					db.close();
					callback(err,finaldetailstr);
				}else {
					db.close();
					callback(err,'[]');
				}
			}else {
				db.close();
				logger.error(common.getErrorMessageFrom(err));
				callback(err,'[]');
			}		
		}	
	);
} // end of aggregateCalulation function

module.exports.getUserDashboardCounters = function(req,res){

	var startDate = req.query["sd"],endDate = req.query["ed"],akey =req.query["akey"],searchBy=req.query["searchBy"];
	var searchByArray=config.searchByModel;
	var startDateWithoutHour,endDateWithoutHour,sdmonth,edmonth,sdyear,edyear,yyyy;

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
	yyyy=parseInt(sdyear);
	
	var gteval=parseInt(parseInt(sdmonth)+startDateWithoutHour.substr(6, 2)),
		lteval=parseInt(parseInt(edmonth)+endDateWithoutHour.substr(6, 2));

	for(i=0;i<searchByArray.length;i++){
		if (searchByArray[i].name==searchBy){
			searchParam=searchByArray[i].value;  
		}
	}

	aggregateCalulation(akey,yyyy,searchBy,searchParam,gteval,lteval,function(err, result){
		if(!err){
			return res.json(result);			
		}
		else {
			logger.error(common.getErrorMessageFrom(err));
			return res.json('[]');;
		}
	});
}