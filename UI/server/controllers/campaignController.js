var mongojs = require('mongojs');
var dateFormat = require('dateformat');
var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');

module.exports.createCampaign = function(req,res){
  console.log(req.body);
  console.log(req.query["akey"]);
  //store it in mongodb.
  
	var body = req.body;
	var schedule_type = body.schedule_type;
	var cycle = body.cycle;
	var recursive = body.recursive;
	var trigger_time = body.trigger_time;
	var currentTime = getTriggerTime(schedule_type.toUpperCase(), cycle, recursive, trigger_time);
	body.trigger_time= parseInt(dateFormat(currentTime, "yyyymmddHHMM"));
  
  db.collection(config.coll_campaigns).insert(req.body,function(err,res){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }
	db.close();
  });
  
  return res.json(JSON.parse('{"msg":"success"}'));
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

function getTriggerTime(schedule_type, cycle, recursive, trigger_time){
	var returnDate = new Date();
	if(schedule_type == 'IMMEDIATE'){
		returnDate.setMinutes(returnDate.getMinutes()+1);
	} else if((schedule_type == 'SCHEDULED' && recursive == true)) {
		var cycleArray = cycle.split('_');
		var cycleType = cycleArray[0].toUpperCase();
		var givenHours = parseInt(trigger_time.toString().substring(8,10));
		var givenMinutes = parseInt(trigger_time.toString().substring(10,12));
		switch(cycleType) {
				case 'DAILY': {
					var dayFlag = checkGreaterTime(givenHours, givenMinutes);
					if(dayFlag) {
						returnDate.setHours(givenHours,givenMinutes);
					} else {
						returnDate.setDate(returnDate.getDate() + 1);
						returnDate.setHours(givenHours,givenMinutes);
					}
				}break; 
				case 'ALTERNATE': {
					var dayFlag = checkGreaterTime(givenHours, givenMinutes);
					if(dayFlag) {
						returnDate.setHours(givenHours,givenMinutes);
					} else {
						returnDate.setDate(returnDate.getDate() + 2);
						returnDate.setHours(givenHours,givenMinutes);
					}
				}break;
				case 'WEEKLY': {
					var weekDay = cycleArray[1].toUpperCase();
					returnDate = getNextDayOfWeek(getNumberFromDay(weekDay));
					var weekFlag = checkGreaterMonth(givenHours, givenMinutes,returnDate.getDate());
					if(weekFlag){
						returnDate.setHours(givenHours,givenMinutes);
					} else {
						returnDate.setDate(returnDate.getDate()+7);
						returnDate.setHours(givenHours,givenMinutes);
					}
				}break;
				case 'MONTHLY': {
					var givenDate = parseInt(cycleArray[1]);
					var monthFlag = checkGreaterMonth(givenHours,givenMinutes, givenDate);
					if(monthFlag) {
						returnDate.setDate(givenDate);
						returnDate.setHours(givenHours,givenMinutes);
					} else {
						returnDate.setMonth(returnDate.getMonth() + 1);
						returnDate.setDate(givenDate);
						returnDate.setHours(givenHours,givenMinutes);
					}
				}break;
		}
	}
	return returnDate; 
}

function getNumberFromDay(day) {
	if(day != null) {
		var upperCase = day.toUpperCase();
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

function getNextDayOfWeek(dayOfWeek) {
	var date = new Date();
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
}

function checkGreaterTime(givenHours, givenMinutes) {
	var date = new Date();
	var currentHours = date.getHours();
	var currentMinutes = date.getMinutes()+1;
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

function checkGreaterMonth(givenHours, givenMinutes, givenDate) {
	var date = new Date();
	var currentDate = date.getDate();
	var currentHours = date.getHours();
	var currentMinutes = date.getMinutes()+1;
	
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
