var mongojs     = require('mongojs');
var moment 		= require('moment');
var config      = require('../../config/config.js');
var logger 		= require('../../config/log.js');
var common 		= require('../../commons/common.js');
var _ 			= require('underscore');

function eventSummary(startDate,endDate,aKey,eventKey,callback){
	var db = mongojs(config.connectionstring+aKey);
	var application = config.appdetails;
	var responseArray = [];
	var outArrayElement
	var outArray = [];
	var dateFormat=config.YYYYMMDD;

	_.each(application,function(data){
		if(data.app === aKey){
			appTZ = data.TZ;
			return;
		}
	});

	var startDateMoment = common.getStartDate(startDate,appTZ);
	var endDateMoment = common.getStartDate(endDate,appTZ);
	var startDateWithoutHour=String(startDateMoment);  				//get start date after timezone
	var endDateWithoutHour=String(endDateMoment);						//get start date after timezone
	var sdmonth=startDateWithoutHour.substr(4, 2),edmonth=endDateWithoutHour.substr(4, 2);	//get start and end date month
	var sdyear=startDateWithoutHour.substr(0, 4),edyear=endDateWithoutHour.substr(0, 4);	//get start and end date year
	var yyyy=parseInt(sdyear);
	var	gteval=parseInt(parseInt(sdmonth)+startDateWithoutHour.substr(6, 2));
	var	lteval=parseInt(parseInt(edmonth)+endDateWithoutHour.substr(6, 2));

	var unwindOperator = '$_'+eventKey+'._'+yyyy;
	var matchOperator = '{ "$and" : [ {"_'+eventKey+'._'+yyyy+'._id":{"$gte":'+gteval+'}},{"_'+eventKey+'._'+yyyy+'._id":{"$lte":'+lteval+'}}]}';
	var matchOperatorJSON = JSON.parse(matchOperator);
	var groupOperator = '{"_id" : "$_'+eventKey+'._'+yyyy+'._id" ,"event_count" : {"$sum" : "$_'+eventKey+'._'+yyyy+'.te"},"user_count":{"$addToSet":"$_id"}}';
	var groupOperatorJSON = JSON.parse(groupOperator);

	db.collection(config.coll_users).aggregate([
	{ $unwind: unwindOperator},
	{ $match: matchOperatorJSON},
	{ $group: groupOperatorJSON}
	],function(err,result){
		if(!err){
			var event_date;

			for(i=0;i<result.length;i++){
				if(result[i]._id.toString().length == 3){
					event_date = moment(yyyy.toString() + '0'+result[i]._id.toString(),dateFormat);
				}else{
					event_date = moment(yyyy.toString() + result[i]._id.toString(),dateFormat);
				}

				outArray[event_date.format(dateFormat)]={
					event_name:eventKey,
					event_date:event_date.format(dateFormat),
					event_count:result[i].event_count,
					user_count:result[i].user_count.length
				};

			}

			for(var i=moment(startDateMoment,dateFormat);i<=moment(endDateMoment,dateFormat);i=i.add(1,config.DAY)){
				outArrayElement = i.format(dateFormat);
				if(outArray[outArrayElement] == config.UNDEFINED || outArray[outArrayElement] == config.NULL){
					outArray[outArrayElement]={
						event_name:eventKey,
						event_date:outArrayElement,
						event_count:0,
						user_count:0
					}
					responseArray.push(outArray[outArrayElement]);
				}else{
					responseArray.push(outArray[outArrayElement]);
				}
			};

			db.close();
			callback(null,responseArray);
		}else{
			db.close();
			logger.error(common.getErrorMessageFrom(err));
			callback(err,null);;
		}
	});
}

module.exports.getEventSummary = function(req,res){
	var startDate = req.query["sd"];
	var endDate = req.query["ed"];
	var aKey = req.query["akey"];
	var eventKey = req.query["en"];
	eventSummary(startDate,endDate,aKey,eventKey,function(err,result){
		if(!err){
			res.json(result);
		}else{
			res.json(JSON.parse('[]'));
		}
	});
}

module.exports.getEventsComparison = function(req,res){
	var startDate = req.query["sd"];
	var endDate = req.query["ed"];
	var aKey = req.query["akey"];
	var eventKey = req.query["en"];
	var eventKeyArray = eventKey.split(",");

	var responseArray = [];
	var onComplete = function(responseArray) {
		res.json(responseArray);
	};

	var tasksToGo = eventKeyArray.length;
	if (tasksToGo === 0) {
		onComplete(responseArray);
	}else{
		eventKeyArray.forEach(function(key){
			eventSummary(startDate,endDate,aKey,key,function(err,result){
				if(!err){
					responseArray.push(result);
					if (--tasksToGo === 0) {
						onComplete(responseArray);
					}
				}else{
					tasksToGo = tasksToGo - 1;
					logger.error(common.getErrorMessageFrom(err));
				}
			});
		})
	}
}

module.exports.getEventNames = function(req,res){
	var startDate = req.query["sd"];
	var endDate = req.query["ed"];
	var aKey = req.query["akey"];
	var db = mongojs(config.connectionstring+aKey);
	var application = config.appdetails;

	_.each(application,function(data){
		if(data.app === aKey){
			appTZ = data.TZ;
			return;
		}
	});

	var startDateWithoutHour=String(common.getStartDate(startDate,appTZ));  				//get start date after timezone
	var endDateWithoutHour=String(common.getStartDate(endDate,appTZ));						//get start date after timezone
	var sdmonth=startDateWithoutHour.substr(4, 2),edmonth=endDateWithoutHour.substr(4, 2);	//get start and end date month
	var sdyear=startDateWithoutHour.substr(0, 4),edyear=endDateWithoutHour.substr(0, 4);	//get start and end date year
	var yyyy=parseInt(sdyear);

	var	gteval=parseInt(parseInt(sdmonth)+startDateWithoutHour.substr(6, 2));
	var	lteval=parseInt(parseInt(edmonth)+endDateWithoutHour.substr(6, 2));

	db.collection(config.coll_eventnames).find(function(err,doc){
		if(!err){
			var responseArray = [];
			var onComplete = function(responseArray) {
				db.close();
				res.json(responseArray);
			};
			var tasksToGo = doc.length;
			if (tasksToGo === 0) {
				onComplete(responseArray);
			} else {
				doc.forEach(function(key){
					var eventKey = key._id;
					var unwindOperator = '$_'+eventKey+'._'+yyyy;
					var matchOperator = '{ "$and" : [ {"_'+eventKey+'._'+yyyy+'._id":{"$gte":'+gteval+'}},{"_'+eventKey+'._'+yyyy+'._id":{"$lte":'+lteval+'}}]}';
					var matchOperatorJSON = JSON.parse(matchOperator);
					var groupOperator = '{"_id" : "'+eventKey+'" ,"te" : {"$sum" : "$_'+eventKey+'._'+yyyy+'.te"}}';
					var groupOperatorJSON = JSON.parse(groupOperator);
					db.collection(config.coll_users).aggregate([
						{ $unwind:unwindOperator},
						{ $match: matchOperatorJSON},
						{ $group: groupOperatorJSON},
						{ $project: {_id:0,'key':'$_id','Total_Event_Count':'$te'}}
						],function(err,result){
							if(result.length==0){
								responseArray.push(JSON.parse('{"key":"'+eventKey+'","Total_Event_Count":'+0+'}'));
							}else{
								responseArray.push(result[0]);
							}
						if (--tasksToGo === 0) {
							onComplete(responseArray);
						}
					});
				});
			}
		}else{
			db.close();
			logger.error(common.getErrorMessageFrom(err));
			res.json(JSON.parse('[]'));
		}
	});
};
