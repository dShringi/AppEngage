"use strict";

const mongojs     = require('mongojs');
const moment 		= require('moment');
const config      = require('../../config/config.js');
const logger 		= require('../../config/log.js');
const common 		= require('../../commons/common.js');

function eventSummary(startDate,endDate,aKey,eventKey,callback){
	const db = mongojs(config.connectionstring+aKey);
	const dateFormat=config.YYYYMMDD;

	var responseArray = [];
	var outArray = [];

	common.getAppTimeZone(aKey,function(err,appTZ){

		var startDateMoment = common.getStartDate(startDate,appTZ);
		var endDateMoment = common.getStartDate(endDate,appTZ);
		var startDateWithoutHour=String(startDateMoment);  				//get start date after timezone
		var endDateWithoutHour=String(endDateMoment);						//get start date after timezone
		var sdyear=startDateWithoutHour.substr(0, 4);
		var edyear=endDateWithoutHour.substr(0, 4);	//get start and end date year
		var yyyy=parseInt(sdyear);
		var	gteval=parseInt(parseInt(startDateWithoutHour.substr(4, 2))+startDateWithoutHour.substr(6, 2));
		var	lteval=parseInt(parseInt(endDateWithoutHour.substr(4, 2))+endDateWithoutHour.substr(6, 2));
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
			db.close();
			if(!err){
				let event_date;
				let outArrayElement;

				for(let i=0;i<result.length;i++){
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

				for(let i=moment(startDateMoment,dateFormat);i<=moment(endDateMoment,dateFormat);i=i.add(1,config.DAY)){
					outArrayElement = i.format(dateFormat);
					if(outArray[outArrayElement] == config.UNDEFINED || outArray[outArrayElement] == config.NULL){
						outArray[outArrayElement]={
							event_name:eventKey,
							event_date:outArrayElement,
							event_count:0,
							user_count:0
						};
						responseArray.push(outArray[outArrayElement]);
					}else{
						responseArray.push(outArray[outArrayElement]);
					}
				}
				callback(null,responseArray);
			}else{
				logger.error(common.getErrorMessageFrom(err));
				callback(err,null);
			}
		});
	});
}

module.exports.getEventSummary = function(req,res){
	const startDate = req.query.sd;
	const endDate = req.query.ed;
	const aKey = req.query.akey;
	const eventKey = req.query.en;
	eventSummary(startDate,endDate,aKey,eventKey,function(err,result){
		if(!err){
			res.json(result);
		}else{
			res.json(JSON.parse('[]'));
		}
	});
};

module.exports.getEventsComparison = function(req,res){
	const startDate = req.query.sd;
	const endDate = req.query.ed;
	const aKey = req.query.akey;
	const eventKey = req.query.en;
	const eventKeyArray = eventKey.split(",");

	let responseArray = [];
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
		});
	}
};

module.exports.getEventNames = function(req,res){
	const startDate = req.query.sd;
	const endDate = req.query.ed;
	const aKey = req.query.akey;
	const db = mongojs(config.connectionstring+aKey);

	common.getAppTimeZone(aKey,function(err,appTZ){
		const startDateWithoutHour=String(common.getStartDate(startDate,appTZ));  				//get start date after timezone
		const endDateWithoutHour=String(common.getStartDate(endDate,appTZ));						//get start date after timezone
		let edyear=endDateWithoutHour.substr(0, 4);	//get start and end date year
		const yyyy=parseInt(startDateWithoutHour.substr(0, 4));

		const	gteval=parseInt(parseInt(startDateWithoutHour.substr(4, 2))+startDateWithoutHour.substr(6, 2));
		const	lteval=parseInt(parseInt(endDateWithoutHour.substr(4, 2))+endDateWithoutHour.substr(6, 2));

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
						let eventKey = key._id;
						let unwindOperator = '$_'+eventKey+'._'+yyyy;
						let matchOperator = '{ "$and" : [ {"_'+eventKey+'._'+yyyy+'._id":{"$gte":'+gteval+'}},{"_'+eventKey+'._'+yyyy+'._id":{"$lte":'+lteval+'}}]}';
						let matchOperatorJSON = JSON.parse(matchOperator);
						let groupOperator = '{"_id" : "'+eventKey+'" ,"te" : {"$sum" : "$_'+eventKey+'._'+yyyy+'.te"}}';
						let groupOperatorJSON = JSON.parse(groupOperator);
						db.collection(config.coll_users).aggregate([
							{ $unwind:unwindOperator},
							{ $match: matchOperatorJSON},
							{ $group: groupOperatorJSON},
							{ $project: {_id:0,'key':'$_id','Total_Event_Count':'$te'}}
							],function(err,result){
								db.close();
								if(result.length === 0){
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
	});
};
