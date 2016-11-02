"use strict";

const logger = require('../config/log.js');
const config = require('../config/config.js');
const moment = require('moment-timezone');
const mongojs = require('mongojs');
var common = {};

(function(common){

  common.getAppTimeZone = function(appID,callback){
    var db = mongojs(config.appengageConnString);
    db.collection(config.coll_appengageapps).find({"akey":appID},function(err,result){
      db.close();
      if(err){
          callback(err,null);
      }else{
          callback(null,result[0].tz);
      }
    });
  };

		common.getErrorMessageFrom = function(err) {
		var errorMessage = '';
    		if (err.errors) {
        		for (var prop in err.errors) {
            			if(err.errors.hasOwnProperty(prop)) {
                			errorMessage += err.errors[prop].message + ' ';
            			}
        		}
    		} else {
        		errorMessage = err.message;
    		}

		return errorMessage;
		};

		common.getDateDiffernce=function(sdate,edate){  //find difference between two dates

				var newStartDate = new Date(sdate);
				var newEndDate = new Date(edate);
				var timeDiff = Math.abs(newEndDate.getTime() - newStartDate.getTime());
				var diffDay = Math.ceil(timeDiff / (1000 * 3600 * 24));
				console.log("day difference: " + diffDay);
				return diffDay;

		};

		common.getWeekFirstdateForStartDate=function(sdate){ //find first date of week of start date
			let current = new Date(sdate);     // get current date
			let weekstart = current.getDate() - current.getDay() ;
			let sundaystart = new Date(current.setDate(weekstart));
			let weekfirstdate = new Date(sundaystart).toISOString().slice(0,10);
			return weekfirstdate;
		};

		common.getWeekFirstdateForEndDate=function(edate){ //find first date of week of end date
			let current = new Date(edate);     // get current date
			let weekstart = current.getDate() - current.getDay() ;
			let sundaystart = new Date(current.setDate(weekstart));
			let weekfirstdate = new Date(sundaystart).toISOString().slice(0,10);
			return weekfirstdate;
		};

		common.getStartYear = function(rtr,appTZ){
  		let eventdate = moment.tz(rtr*1000,appTZ).format();
  		return parseInt(''+eventdate.substring(0,4));
    };


		common.getStartMonth = function(rtr,appTZ){
      let eventdate = moment.tz(rtr*1000,appTZ).format();
      return parseInt(''+eventdate.substring(5,7));
    };

		common.getStartDate = function(rtr,appTZ){
      let eventdate = moment.tz(rtr*1000,appTZ).format();
      return parseInt(''+eventdate.substring(0,4)+eventdate.substring(5,7)+eventdate.substring(8,10));
    };

		common.getStartHour = function(rtr,appTZ){
      let eventdate = moment.tz(rtr*1000,appTZ).format();
      return parseInt(''+eventdate.substring(0,4)+eventdate.substring(5,7)+eventdate.substring(8,10)+eventdate.substring(11,13));
    };



		common.getStartWeek = function(rtr,appTZ){
				let eventdate 	= moment.tz(rtr*1000,appTZ).format();
				let ndate	= new Date(Date.UTC(eventdate.substring(0,4),parseInt(eventdate.substring(5,7))-1,eventdate.substring(8,10)));
				let weekdate	= new Date(ndate);
				let weekday	= new Date(weekdate.setDate(ndate.getDate() - ndate.getDay()));
				return parseInt(''+weekday.getFullYear()+('0'.concat(weekday.getMonth()+1).slice(-2))+('0'.concat(weekday.getDate()).slice(-2)));
	};


}(common));

module.exports = common;
