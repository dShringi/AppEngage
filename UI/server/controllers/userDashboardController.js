var mongojs     = require('mongojs');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var async       = require('async');

module.exports.getUserDashboardCounters = function(req,res){

var db = mongojs(config.connectionstring+akey);
var sd = req.query["sd"],ed = req.query["ed"],akey =req.query["akey"],searchBy=req.query["searchBy"];
var tempstring=[],tempstr="";
var searchParam;
var searchByArray=[];
searchByArray.push({name:'manufacturer',value:'lm'}); 
searchByArray.push({name:'devicetype',value:'ldt'}); 
searchByArray.push({name:'model',value:'lmod'}); 
searchByArray.push({name:'platform',value:'lpf'}); 
searchByArray.push({name:'osversion',value:'losv'}); 
searchByArray.push({name:'appvarsion',value:'lavn'}); 


	for(i=0;i<searchByArray.length;i++){
	   console.log("name:- "  + searchByArray[i].name + " value:- "  + searchByArray[i].value );
	   if (searchByArray[i].name==searchBy){ searchParam=searchByArray[i].value;} else { searchParam= 'Notmatch'; }
	   }


async.waterfall(
    [	
		
	function(callback) { //callback start
			
			
			console.log("sd date: " + sd);
			console.log("ed date: " + ed);
			console.log("searchBy: " + searchBy);
			console.log("searchParam: " + searchParam);
			var grpvalue='$.'+ searchParam;
			
			db.collection(config.coll_users).aggregate([
		
			{ $match: { 'flog': { $gte: sd },  'llog': { $lte: ed } }},
			{ $group: {_id :  grpvalue ,'users' :  {$sum : 1},'time' : {$sum : "$tts"}}},
			{ $project: {_id:1,users:1,time:1}}
			],function(err, result) {
			
				//console.log(result);
				if(result!=null){
				for(var i=0;i<result.length;i++){
					tempstring[i] = (' {'+' "'+searchParam+'": "'+result[i]._id+'","users": "' +result[i].users + '","time": "' +result[i].time);
					
					tempstr+=tempstring[i].concat(',');
				}
				 tempstr = tempstr.substr(0,tempstr.length-1);
				 //console.log(tempstr);
				finaldetailstr='[ '+ tempstr + ']'
				console.log(finaldetailstr);
				}else{
				db.close();
				return res.json('[]');
				}
				callback(null);
		});
		
	},//callback end
	function(callback) { //callback start
	db.close();
	return res.json(finaldetailstr);
	
	}
]);

}





