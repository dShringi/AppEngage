var logger = require('../conf/log.js');
var moment = require('moment-timezone');
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
		return ''+eventdate.substring(0,4)+'0101';
		/*
		var eventDate = new Date(0);
		eventDate.setUTCSeconds(rtr);
            	year = eventDate.getFullYear();
            	return ''+year+'0101';
		*/
        };

	common.getStartMonth = function(rtr,appTZ){
                var eventdate = moment.tz(rtr*1000,appTZ).format();
                return ''+eventdate.substring(0,4)+eventdate.substring(5,7)+'01';
		/*
            	var eventDate = new Date(0);
		eventDate.setUTCSeconds(rtr);
            	year = eventDate.getFullYear();
		month = '0'.concat(eventDate.getMonth()+1).slice(-2);
            	return ''+year+month+'01';
		*/
        };

        common.getStartDate = function(rtr,appTZ){
                var eventdate = moment.tz(rtr*1000,appTZ).format();
                return ''+eventdate.substring(0,4)+eventdate.substring(5,7)+eventdate.substring(8,10);		
		/*
            	var eventDate = new Date(0);
		eventDate.setUTCSeconds(rtr);
            	year = eventDate.getFullYear();
            	month = '0'.concat(eventDate.getMonth()+1).slice(-2);
		date = '0'.concat(eventDate.getDate()+1).slice(-2);
            	return ''+year+month+date;
		*/
        };

        common.getStartHour = function(rtr,appTZ){
                var eventdate = moment.tz(rtr*1000,appTZ).format();
                return ''+eventdate.substring(0,4)+eventdate.substring(5,7)+eventdate.substring(8,10)+eventdate.substring(11,13);
		/*
                var eventDate = new Date(0);
                eventDate.setUTCSeconds(rtr);
                year = eventDate.getFullYear();
                month = '0'.concat(eventDate.getMonth()+1).slice(-2);
                date = '0'.concat(eventDate.getDate()+1).slice(-2);
		hour = '0'.concat(eventDate.getHours()+1).slice(-2);
            	return ''+year+month+date+hour;
		*/
        };


	common.getStartWeek = function(rtr,appTZ){
            	var eventDate = new Date(0);
            	eventDate.setUTCSeconds(rtr);
            	var weekdate = new Date(eventDate);
            	var weekbegin = eventDate.getDate() - eventDate.getDay();
            	var weekday = new Date(weekdate.setDate(weekbegin));		
            	return ''+weekday.getFullYear()+('0'.concat(weekday.getMonth()+1).slice(-2))+('0'.concat(weekdate.getDate()).slice(-2));
	   };

}(common));

module.exports = common;
