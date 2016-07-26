var common = {};

(function(common){


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
		
		


}(common));

module.exports = common;