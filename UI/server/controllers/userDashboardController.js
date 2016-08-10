var mongojs     = require('mongojs');
var config      = require('../../config/config.js');
var logger 		= require('../../config/log.js');
var common 		= require('../../commons/common.js');
var async       = require('async');


var startDate ,endDate ,akey ,searchBy;
var db = mongojs(config.connectionstring+akey);
var resultstring=[],resultstr="";
var searchParam,grpvalue,finaldetailstr,finalResponce;
var searchByArray=[];
var deviceNumber='"'+0+'"';

function aggregateCalulation(grpParam,callback){ // function to fetch userCountersounters by searchparameter
	
	var db = mongojs(config.connectionstring+akey);
			finaldetailstr="";
			var grpParamVal= grpParam;
			var startDateVal=Number(startDate);
			var endDateVal=Number(endDate);
			//console.log("searchParam: " + searchParam);
			//console.log("grp value:  "+grpParamVal); 
			
			db.collection(config.coll_users).aggregate([
			{ $match: { 'flog': { $gte: startDateVal }, 'llog': { $lte: endDateVal } }},
			{ $group: {_id : grpParamVal ,'users' :  {$sum : 1},'time' : {$sum : "$tts"}}},
			{ $project: {_id:1,users:1,time:1}}
			],function(err, result) {
				
				if(!err){
				
				if(result!=null && searchParam!='Notmatch'){
				for(var i=0;i<result.length;i++){
					resultstring[i] = (' {'+' "'+searchBy+'": "'+result[i]._id+'","users": "' +result[i].users + '","time": "' +result[i].time + ' }');
					
					resultstr+=resultstring[i].concat(',');
				}
				 resultstr = resultstr.substr(0,resultstr.length-1);
				 
				finaldetailstr='[ '+ resultstr + ']'
				console.log(finaldetailstr);
				callback(err,finaldetailstr);
				}else {
				db.close();
				callback('[]');
				}
				}
				else{
				logger.error(common.getErrorMessageFrom(err));
                 return;
				}
				
				}
				
		);
		
} // end of aggregateCalulation

module.exports.getUserDashboardCounters = function(req,res){

var db = mongojs(config.connectionstring+akey);
startDate = req.query["sd"],endDate = req.query["ed"],akey =req.query["akey"],searchBy=req.query["searchBy"];
var searchByArray=config.searchByModel;

async.waterfall(
    
	[	
	 function(callback) { //callback start
		for(i=0;i<searchByArray.length;i++){
	   if (searchByArray[i].name==searchBy){ searchParam=searchByArray[i].value;  break;} else { searchParam= 'Notmatch'; }
	   }
	  
	   callback(null);
	},
	
	
	 function(callback) { //callback start
		//console.log('Aggregate');
		finalResponce="";
		grpvalue='$'+searchParam;
		aggregateCalulation(grpvalue,function(err, res){
		if(!err){
		finalResponce=res;
		callback(null);
		}
		else {
		logger.error(common.getErrorMessageFrom(err));
        return;
		}
		});
	},
	
	
	function(callback) { //callback start
	db.close();
	return res.json(finalResponce);
	
	}
]);

}





