var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var moment = require('moment-timezone');
var mongojs = require('mongojs');
var common = {};

(function(common){

	common.getErrorMessageFrom = function(err) {
		var errorMessage = '';
    		if (err.errors) {
        		for (var prop in err.errors) {
        			if(err.errors.hasOwnProperty(prop)) {
            			errorMessage += err.errors[prop].message + ' '
        			}
        		}
    		} else {
        		errorMessage = err.message;
    		}
		return errorMessage;
	}

	common.hasValue = function(dataKeys,dataValues){
		var msgStatus = true;
		for(var i=0;i<dataValues.length;i++){
			//console.log(dataValues[i]);
			if(dataValues[i] === undefined || dataValues[i] === null){
                logger.info("Data empty for attribute : "+dataKeys[i]);
				msgStatus = false;
			}
		}
		return msgStatus;
	};

    common.getIP = function(req){
        var ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.info.remoteAddress || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : '');
        return ip.split(',')[0];
    };

    common.getStartYear = function(rtr,appTZ){
        var eventdate = moment.tz(rtr*1000,appTZ).format();
        return parseInt(''+eventdate.substring(0,4)+'0101');
    };

    common.getStartMonth = function(rtr,appTZ){
        var eventdate = moment.tz(rtr*1000,appTZ).format();
        return parseInt(''+eventdate.substring(0,4)+eventdate.substring(5,7)+'01');
    };

    common.getStartDate = function(rtr,appTZ){
        var eventdate = moment.tz(rtr*1000,appTZ).format();
        return parseInt(''+eventdate.substring(0,4)+eventdate.substring(5,7)+eventdate.substring(8,10));
    };

    common.getStartHour = function(rtr,appTZ){
        var eventdate = moment.tz(rtr*1000,appTZ).format();
        return parseInt(''+eventdate.substring(0,4)+eventdate.substring(5,7)+eventdate.substring(8,10)+eventdate.substring(11,13));
    };


	common.getStartWeek = function(rtr,appTZ){
		var eventdate 	= moment.tz(rtr*1000,appTZ).format();
		var ndate	= new Date(Date.UTC(eventdate.substring(0,4),parseInt(eventdate.substring(5,7))-1,eventdate.substring(8,10)));
		var weekdate	= new Date(ndate);
		var weekday	= new Date(weekdate.setDate(ndate.getDate() - ndate.getDay()));
		return parseInt(''+weekday.getFullYear()+('0'.concat(weekday.getMonth()+1).slice(-2))+('0'.concat(weekday.getDate()).slice(-2)));
	};

    common.getAppTimeZone = function(appID,callback){
        var db = mongojs(config.mongodb.appengage);
        db.collection(config.mongodb.coll_appengageapps).find({"akey":appID},function(err,result){
            db.close();
            if(err){
                callback(err,null);
            }else{
                callback(null,result[0].tz);
            }
        });
    };

}(common));

module.exports = common;
