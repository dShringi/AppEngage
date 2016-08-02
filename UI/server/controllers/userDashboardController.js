var mongojs     = require('mongojs');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var async       = require('async');

var sd ,ed ,akey ,searchBy;
var db = mongojs(config.connectionstring+akey);
var tempstring=[],tempstr="";
var searchParam,grpvalue,finaldetailstr,finaloutput;
var searchByArray=[];

function aggregateCalulation(grpParam,callback){ // function to fetch userCountersounters by searchparameter
	
	var db = mongojs(config.connectionstring+akey);
			finaldetailstr="";
			var grpParamVal= grpParam;
			var startDateVal=Number(sd);
			var endDateVal=Number(ed);
			//console.log("searchParam: " + searchParam);
			//console.log("grp value:  "+grpParamVal); 
			
			db.collection(config.coll_users).aggregate([
			{ $match: { 'flog': { $gte: startDateVal }, 'llog': { $lte: endDateVal } }},
			{ $group: {_id : grpParamVal ,'users' :  {$sum : 1},'time' : {$sum : "$tts"}}},
			{ $project: {_id:1,users:1,time:1}}
			],function(err, result) {
				
				
				if(result!=null && searchParam!='Notmatch'){
				for(var i=0;i<result.length;i++){
					tempstring[i] = (' {'+' "'+searchBy+'": "'+result[i]._id+'","users": "' +result[i].users + '","time": "' +result[i].time + ' }');
					
					tempstr+=tempstring[i].concat(',');
				}
				 tempstr = tempstr.substr(0,tempstr.length-1);
				 
				finaldetailstr='[ '+ tempstr + ']'
				console.log(finaldetailstr);
				callback(finaldetailstr);
				}else {
				//db.close();
				callback('[]');
				}
				}
				
		);
		
} // end of aggregateCalulation

module.exports.getUserDashboardCounters = function(req,res){

var db = mongojs(config.connectionstring+akey);
sd = req.query["sd"],ed = req.query["ed"],akey =req.query["akey"],searchBy=req.query["searchBy"];
searchByArray.push({name:'manufacturer',value:'lm'}); 
searchByArray.push({name:'devicetype',value:'ldt'}); 
searchByArray.push({name:'model',value:'lmod'}); 
searchByArray.push({name:'platform',value:'lpf'}); 
searchByArray.push({name:'osversion',value:'losv'}); 
searchByArray.push({name:'appvarsion',value:'lavn'}); 

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
		finaloutput="";
		grpvalue='$'+searchParam;
		aggregateCalulation(grpvalue,function(res){
		finaloutput=res;
		callback(null);
		});
	},
	
	function(callback) { //callback start
	db.close();
	return res.json(finaloutput);
	
	}
]);

}





