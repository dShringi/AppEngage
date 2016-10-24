"use strict";

const mongojs = require('mongojs');
const moment = require('moment-timezone');
const dateFormat = require('dateformat');
const config  = require('../../config/config');
const logger  = require('../../config/log.js');
const common = require('../../commons/common.js');

module.exports.createCampaign = function(req,res){
	const akey = req.query.akey;
	let body = req.body;
	const schedule_type = body.schedule_type.toString();
	const cycle = body.cycle;
	const recursive = body.recursive;
	const trigger_time = body.trigger_time;
	const creationDate = body.creationDate;
	const db = mongojs(config.connectionstring+akey);

	common.getAppTimeZone(akey,function(err,appTZ){
		if(err){
			logger.error(common.getErrorMessageFrom(err));
			return res.json(JSON.parse('{"msg":"Failure"}'));
		}else{
			const currentTime = getTriggerTime(schedule_type.toUpperCase(), cycle, recursive, trigger_time, appTZ, creationDate);
			body.trigger_time = parseInt(dateFormat(currentTime, "yyyymmddHHMM"));
			body.creationDate = parseInt(dateFormat(getUtcCurrentTime(), "yyyymmdd"));
			body.startDate = parseInt(dateFormat(currentTime, "yyyymmdd"));
			if(body.endDate === config.NULL) {
				body.endDate = parseInt(dateFormat(currentTime, "yyyymmdd"));
			} else {
				body.endDate = parseInt(dateFormat(getLocalTimeWithoutHour(appTZ, body.endDate), "yyyymmdd"));
			}
			body.query = queryBuilder(body.query);
			db.collection(config.coll_campaigns).insert(body,function(err,resp){
				db.close();
				if(err){
					logger.error(common.getErrorMessageFrom(err));
					return res.json(JSON.parse('{"msg":"Failure"}'));
				}
				return res.json(JSON.parse('{"msg":"success"}'));
			});
		}
	});
};

module.exports.updateCampaign = function(req,res){
  const akey = req.query.akey;
  const campaignid = req.query.campaignid;
  const status = req.body.status;
  const db = mongojs(config.connectionstring+akey);
  db.collection(config.coll_campaigns).update({"_id":mongojs.ObjectID(campaignid)},{$set:{"status":status}},function(err,resp){
    db.close();
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      return res.json(JSON.parse('{"msg":"Success"}'));
    }
  });
};

module.exports.deleteCampaign = function(req,res){
  const akey = req.query.akey;
  const campaignid = req.query.campaignid;
  const db = mongojs(config.connectionstring+akey);
  db.collection(config.coll_campaigns).remove({"_id":mongojs.ObjectID(campaignid)},function(err,resp){
    db.close();
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      return res.json(JSON.parse('{"msg":"Success"}'));
    }
  });
};

module.exports.fetchAllCampaigns = function(req,res){
  const akey = req.query.akey;
  const sd = req.query.sd;
  const ed = req.query.ed;
  common.getAppTimeZone(akey,function(err,appTZ){
    const startDate = common.getStartDate(sd,appTZ);
    const endDate = common.getStartDate(ed,appTZ);
    const db = mongojs(config.connectionstring+akey);
    const searchObject = JSON.parse('{"$and":[{"startDate":{"$gte":'+startDate+'}},{"endDate":{"$lte":'+endDate+'}}]}');

    db.collection(config.coll_campaigns).find(searchObject,function(err,resp){
      db.close();
      if(err){
        logger.error(common.getErrorMessageFrom(err));
        return res.json(JSON.parse('{"msg":"Failure"}'));
      }else{
        return res.json(resp);
      }
    });
  });
};

function getTriggerTime(schedule_type, cycle, recursive, trigger_time,appTZ, creationDate){
	let returnDate;
	if(schedule_type == 'IMMEDIATE'){
		returnDate = getUtcCurrentTime();
		returnDate.setMinutes(returnDate.getMinutes()+2);
	} else if((schedule_type === 'SCHEDULED' && recursive === config.TRUE)) {
		const cycleArray = cycle.split('_');
		const cycleType = cycleArray[0].toString().toUpperCase();
		const givenHours = parseInt(trigger_time.toString().substring(8,10));
		const givenMinutes = parseInt(trigger_time.toString().substring(10,12));
		const conDateTime = creationDate.toString()+''+givenHours+''+givenMinutes;
		returnDate = getLocalTime(appTZ, conDateTime);
		switch(cycleType) {
				case 'DAILY': {
					const dayFlag = checkGreaterTime(returnDate);
					if(!dayFlag) {
						returnDate.setDate(returnDate.getDate() + 1);
					}
				}break;
				case 'ALTERNATE': {
					const dayFlag = checkGreaterTime(returnDate);
					if(!dayFlag) {
						returnDate.setDate(returnDate.getDate() + 2);
					}
				}break;
				case 'WEEKLY': {
					const weekDay = cycleArray[1].toString().toUpperCase();
					returnDate = getNextDayOfWeek(getNumberFromDay(weekDay),returnDate);
					const weekFlag = checkGreaterMonth(returnDate);
					if(!weekFlag){
						returnDate.setDate(returnDate.getDate()+7);
					}
				}break;
				case 'MONTHLY': {
					const monthFlag = checkGreaterMonth(returnDate);
					if(!monthFlag) {
						returnDate.setMonth(returnDate.getMonth() + 1);
					}
				}break;
		}
	} else if((schedule_type == 'SCHEDULED' && recursive === config.FALSE)) {
		returnDate = getLocalTime(appTZ, trigger_time);
	}
	return getUtcTime(returnDate);
}

function getNumberFromDay(day) {
	if(day !== config.NULL) {
		const upperCase = day.toString().toUpperCase();
		switch(upperCase) {
			case 'SUNDAY': {return 0;} break;
			case 'MONDAY': {return 1;} break;
			case 'TUESDAY': {return 2;} break;
			case 'WEDNESDAY': {return 3;} break;
			case 'THURSDAY': {return 4;} break;
			case 'FRIDAY': {return 5;} break;
			case 'SATURDAY': {return 6;} break;
		}
	}
}

function getNextDayOfWeek(dayOfWeek,date) {
    let resultDate = new Date(date.getTime());

    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
}

function checkGreaterTime(date) {
	const givenHours = date.getHours();
	const givenMinutes = date.getMinutes()+1;
	const currentUtcTime = getUtcCurrentTime();
	const currentHours = currentUtcTime.getHours();
	const currentMinutes = currentUtcTime.getMinutes();

	if(currentHours < givenHours) {
		return config.TRUE;
	} else if(currentHours > givenHours) {
		return config.FALSE;
	} else if(currentHours == givenHours) {
		if(currentMinutes < givenMinutes) {
			return config.TRUE;
		}
	}
	return config.FLASE;
}

function checkGreaterMonth(date) {

	const givenDate = date.getDate();
	const givenHours = date.getHours();
	const givenMinutes = date.getMinutes()+1;
	const currentUtcTime = getUtcCurrentTime();
	const currentDate = currentUtcTime.getDate();
	const currentHours = currentUtcTime.getHours();
	const currentMinutes = currentUtcTime.getMinutes();

	if(currentDate < givenDate){
		return config.TRUE;
	} else if(currentDate > givenDate) {
		return config.FLASE;
	} else if(currentDate == givenDate) {
		if(currentHours < givenHours) {
			return config.TRUE;
		} else if(currentHours > givenHours) {
			return config.FLASE;
		} else if(currentHours == givenHours) {
			if(currentMinutes < givenMinutes) {
				return config.TRUE;
			}
		}
	}
	return config.FLASE;
}

function getUtcCurrentTime(){
	let now = new Date();
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}

function getUtcTime(time){
	return new Date(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate(),  time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds());
}

function getLocalTime(appTZ, dateStr){
	const hours = dateStr.toString().substring(8,10);
	const minutes = dateStr.toString().substring(10,12);

	const year = dateStr.toString().substring(0,4);
	const month = dateStr.toString().substring(4,6);
	const day = dateStr.toString().substring(6,8);
	const strDate = ''+year+'-'+month+'-'+day+' '+hours+':'+minutes;
	const timezone = moment.tz(strDate, appTZ);

	const utcTimezone = timezone.clone().tz("UTC");
	return new Date(utcTimezone.format());
}

function getLocalTimeWithoutHour(appTZ, dateStr){

	const year = dateStr.toString().substring(0,4);
	const month = dateStr.toString().substring(4,6);
	const day = dateStr.toString().substring(6,8);
	const strDate = ''+year+'-'+month+'-'+day+' '+'00:00';
	const timezone = moment.tz(strDate, appTZ);
	const utcTimezone = timezone.clone().tz("UTC");
	return new Date(utcTimezone.format());
}
// find query logic
function queryBuilder(JsonData){
	let qryStr ='';
	try {
		for (let queryKey in JsonData) {
			let innerQuery = JsonData[queryKey];
			for (let innerKey in innerQuery) {
					qryStr+=formInnerArray(queryKey, innerQuery);
					break;
			}
		}
		let queryLength = qryStr.length;
		let charAtQry = qryStr.charAt(queryLength-1);
		if(charAtQry ==','){
			qryStr = qryStr.substring(0, queryLength - 1);
		}
		return JSON.parse('{'+qryStr+'}');
	}catch(err){
		logger.error(common.getErrorMessageFrom(err));
	}
}

function formInnerArray(ruleKey, query) {
	let StringQuery = '';
	let count =0;
	for (let queryKey in query) {
		var arrayElement = query[queryKey];

		//this if condition has to be removed after mapping element from UI
		if(ruleKey ==  'lpf' || ruleKey == 'ldt'){
			arrayElement = replaceQueryData(arrayElement);
		}

		if(count==0){
			StringQuery+= '"'+arrayElement+'"';
		} else {
			StringQuery+= ',"'+arrayElement+'"';
		}
		count++;
	}
	return '"'+ruleKey+'":{"***in":['+StringQuery+']},';
}

function replaceQueryData(querydata) {
	let returnstr;
	if(querydata !== config.NULL){
		switch(querydata) {
			case 'Tablet' :
				returnstr = 'T'; break;
			case 'Smart Phone' :
				returnstr = 'S'; break;
			case 'Android' :
				returnstr = 'A'; break;
			default :
				returnstr = querydata;
		}
	}
	return returnstr;
}
