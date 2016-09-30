var mongojs = require('mongojs');
var moment = require('moment-timezone');
var dateFormat = require('dateformat');
var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');

//mapping key need to be configured in db
var map = new Object();
map['mnu'] = 'lm';
map['dt'] = 'ldt';
map['model'] = 'lmod';

map['appversion'] = 'lavn';
map['platform'] = 'lpf';
map['os'] = 'losv';
map['lcty'] = 'lcty';

module.exports.createCampaign = function(req,res){
  console.log(req.body);
  console.log(req.query["akey"]);
  //store it in mongodb.
	var akey = req.query["akey"];
	var body = req.body;
	var schedule_type = body.schedule_type.toString();
	var cycle = body.cycle;
	var recursive = body.recursive;
	var trigger_time = body.trigger_time;
	var creationDate = body.creationDate;
	
	common.getAppTimeZone(akey,function(err,appTZ){
	
		var currentTime = getTriggerTime(schedule_type.toUpperCase(), cycle, recursive, trigger_time, appTZ, creationDate);
		
		body.trigger_time = parseInt(dateFormat(currentTime, "yyyymmddHHMM"));
		body.creationDate = parseInt(dateFormat(getUtcCurrentTime(), "yyyymmdd"));
		body.startDate = parseInt(dateFormat(currentTime, "yyyymmdd"));
		if(body.endDate == null) {
			body.endDate = parseInt(dateFormat(currentTime, "yyyymmdd"));
		} else {
			body.endDate = parseInt(dateFormat(getLocalTimeWithoutHour(appTZ, body.endDate), "yyyymmdd"));
		}
		
		body.query = queryBuilder(body.query);
		console.log('body.query    '+body.query)
		
		var db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_campaigns).insert(req.body,function(err,resp){
			if(err){
				logger.error(common.getErrorMessageFrom(err));
				return res.json(JSON.parse('{"msg":"Failure"}'));
			}
			db.close();
			return res.json(JSON.parse('{"msg":"success"}'));
		  });
		  
	});
};

module.exports.updateCampaign = function(req,res){
  var akey = req.query["akey"];
  var campaignid = req.query["campaignid"];
  var status = req.body.status;
  var db = mongojs(config.connectionstring+akey);
  db.collection(config.coll_campaigns).update({"_id":mongojs.ObjectID(campaignid)},{$set:{"status":status}},function(err,resp){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      db.close();
      return res.json(JSON.parse('{"msg":"Success"}'));
    }
  });
};

module.exports.deleteCampaign = function(req,res){
  var akey = req.query["akey"];
  var campaignid = req.query["campaignid"];
  var db = mongojs(config.connectionstring+akey);
  db.collection(config.coll_campaigns).remove({"_id":mongojs.ObjectID(campaignid)},function(err,resp){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      console.log(err);
      console.log(resp);
      db.close();
      return res.json(JSON.parse('{"msg":"Success"}'));
    }
  });
};

module.exports.fetchAllCampaigns = function(req,res){
  var akey = req.query["akey"];
  var sd = req.query["sd"];
  var ed = req.query["ed"];

  common.getAppTimeZone(akey,function(err,appTZ){
    var startDate = common.getStartDate(sd,appTZ);
    var endDate = common.getStartDate(ed,appTZ);
    var db = mongojs(config.connectionstring+akey);
    var searchObject = JSON.parse('{"$and":[{"startDate":{"$gte":'+startDate+'}},{"endDate":{"$lte":'+endDate+'}}]}');

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
	var returnDate;
	if(schedule_type == 'IMMEDIATE'){
		returnDate = getUtcCurrentTime();
		returnDate.setMinutes(returnDate.getMinutes()+2);
	} else if((schedule_type == 'SCHEDULED' && recursive == true)) {
		var cycleArray = cycle.split('_');
		var cycleType = cycleArray[0].toString().toUpperCase();
		var givenHours = parseInt(trigger_time.toString().substring(8,10));
		var givenMinutes = parseInt(trigger_time.toString().substring(10,12));
		var conDateTime = creationDate.toString()+''+givenHours+''+givenMinutes;
		returnDate = getLocalTime(appTZ, conDateTime);
		switch(cycleType) {
				case 'DAILY': {
					var dayFlag = checkGreaterTime(returnDate);
					console.log(dayFlag);
					if(!dayFlag) {
						returnDate.setDate(returnDate.getDate() + 1);
					}
				}break; 
				case 'ALTERNATE': {
					console.log('came here');
					var dayFlag = checkGreaterTime(returnDate);
					if(!dayFlag) {
						returnDate.setDate(returnDate.getDate() + 2);
					}
				}break;
				case 'WEEKLY': {
					var weekDay = cycleArray[1].toString().toUpperCase();
					returnDate = getNextDayOfWeek(getNumberFromDay(weekDay),returnDate);
					var weekFlag = checkGreaterMonth(returnDate);
					if(!weekFlag){
						returnDate.setDate(returnDate.getDate()+7);
					}
				}break;
				case 'MONTHLY': {
					var givenDate = parseInt(cycleArray[1]);
					var monthFlag = checkGreaterMonth(returnDate);
					if(!monthFlag) {
						returnDate.setMonth(returnDate.getMonth() + 1);
					}
				}break;
		}
	} else if((schedule_type == 'SCHEDULED' && recursive == false)) {
		returnDate = getLocalTime(appTZ, trigger_time);
	}
	return getUtcTime(returnDate); 
}

function getNumberFromDay(day) {
	if(day != null) {
		var upperCase = day.toString().toUpperCase();
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
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
}

function checkGreaterTime(date) {
	var givenHours = date.getHours();
	var givenMinutes = date.getMinutes()+1;
	
	var currentUtcTime = getUtcCurrentTime();
	var currentHours = currentUtcTime.getHours();
	var currentMinutes = currentUtcTime.getMinutes();	
	if(currentHours < givenHours) {
		return true;
	} else if(currentHours > givenHours) {
		return false;
	} else if(currentHours == givenHours) {
		if(currentMinutes < givenMinutes) {
			return true;
		}
	}
	return false;
}

function checkGreaterMonth(date) {

	var givenDate = date.getDate();
	var givenHours = date.getHours();
	var givenMinutes = date.getMinutes()+1;
	
	var currentUtcTime = getUtcCurrentTime();
	var currentDate = currentUtcTime.getDate();
	var currentHours = currentUtcTime.getHours();
	var currentMinutes = currentUtcTime.getMinutes();
	
	if(currentDate < givenDate){
		return true;
	} else if(currentDate > givenDate) {
		return false;
	} else if(currentDate == givenDate) {
		if(currentHours < givenHours) {
			return true;
		} else if(currentHours > givenHours) {
			return false;
		} else if(currentHours == givenHours) {
			if(currentMinutes < givenMinutes) {
				return true;
			}
		}
	}
	return false;
}

function getUtcCurrentTime(){
	var now = new Date(); 
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}

function getUtcTime(time){ 
	return new Date(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate(),  time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds());
}

function getLocalTime(appTZ, dateStr){
	var hours = dateStr.toString().substring(8,10);
	var minutes = dateStr.toString().substring(10,12);
	
	var year = dateStr.toString().substring(0,4);
	var month = dateStr.toString().substring(4,6);
	var day = dateStr.toString().substring(6,8);
	var strDate = ''+year+'-'+month+'-'+day+' '+hours+':'+minutes;
	var timezone = moment.tz(strDate, appTZ);
	
	var utcTimezone = timezone.clone().tz("UTC");
	return new Date(utcTimezone.format());
}

function getLocalTimeWithoutHour(appTZ, dateStr){
	
	var year = dateStr.toString().substring(0,4);
	var month = dateStr.toString().substring(4,6);
	var day = dateStr.toString().substring(6,8);
	var hourminut = 00;
	var strDate = ''+year+'-'+month+'-'+day+' '+'00:00';
	var timezone = moment.tz(strDate, appTZ);
	var utcTimezone = timezone.clone().tz("UTC");
	return new Date(utcTimezone.format());
}
// find query logic
function queryBuilder(JsonData){
	var count =0;
	var qryStr ='';
	try {
		for (var queryKey in JsonData) {
			var innerQuery = JsonData[queryKey];
			for (var innerKey in innerQuery) {
				var ruleKey = getMapping(queryKey);
				if(innerQuery.length >1){
					qryStr+=formInnerArray(ruleKey, innerQuery);
					break;
				} else {
					if(count==0){
						qryStr+='"'+ruleKey+'":'+'"'+innerQuery[innerKey]+'"';
					} else {
						qryStr+=',"'+ruleKey+'":'+'"'+innerQuery[innerKey]+'"';						
					}
					count++;
				}
			}
		}	
		var queryLength = qryStr.length;
		var charAtQry = qryStr.charAt(queryLength-1);
		if(charAtQry ==','){
			qryStr = qryStr.substring(0, queryLength - 1);
		} 
		return JSON.parse('{'+qryStr+'}');
	}catch(err){
		logger.error(common.getErrorMessageFrom(err));
	}
}

function getMapping(k) {
    return map[k];
}

function formInnerArray(ruleKey, query) {
	var StringQuery = '';
	var count =0; 
	for (var queryKey in query) {
		var hello = query[queryKey];
		if(count==0){
			StringQuery+= '"'+hello+'"';
		} else {
			StringQuery+= ',"'+hello+'"';
		}
		count++;
	}
	return '"'+ruleKey+'":{"in":['+StringQuery+']},';
}