var logger = require('../config/log.js');
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
		
				var current = new Date(sdate);     // get current date    
				var weekstart = current.getDate() - current.getDay() ; 
				var sundaystart = new Date(current.setDate(weekstart));  
				var weekfirstdate = new Date(sundaystart).toISOString().slice(0,10); 
				//console.log("weekfirstdate for startdate : "+ weekfirstdate);
				return weekfirstdate;
		};
		
		common.getWeekFirstdateForEndDate=function(edate){ //find first date of week of end date
		
				var current = new Date(edate);     // get current date    
				var weekstart = current.getDate() - current.getDay() ; 
				var sundaystart = new Date(current.setDate(weekstart));  
				var weekfirstdate = new Date(sundaystart).toISOString().slice(0,10); 
				//console.log("weekfirstdate for end date :"+ weekfirstdate);
				return weekfirstdate;
		};
		
		 common.getStartYear = function(rtr,appTZ){
				var eventdate = moment.tz(rtr*1000,appTZ).format();
				return parseInt(''+eventdate.substring(0,4));
        };

		
		common.getStartMonth = function(rtr,appTZ){
                var eventdate = moment.tz(rtr*1000,appTZ).format();
                return parseInt(''+eventdate.substring(5,7));
				
        };

		 common.getStartDate = function(rtr,appTZ){
                var eventdate = moment.tz(rtr*1000,appTZ).format();
                return parseInt(''+eventdate.substring(0,4)+eventdate.substring(5,7)+eventdate.substring(8,10));		
        };
		/*
		common.getStartHour = function(rtr,appTZ){
                var eventdate = moment.tz(rtr*1000,appTZ).format();
                return parseInt(''+eventdate.substring(11,13));
        };
		*/
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


}(common));

module.exports = common;