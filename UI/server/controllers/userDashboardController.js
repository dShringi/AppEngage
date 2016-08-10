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
	/*
	 //added code for update
	 	function(callback) {
		var db = mongojs(config.connectionstring+akey);
		var startDate1 = "1470415571",endDate1 = "1470415726";
		var startdate = new Date(0),enddate = new Date(0);
		startdate.setUTCSeconds(startDate1);
		enddate.setUTCSeconds(endDate1);
		
		deviceNumber="212345678931";
		var  datePart= '0'.concat(startdate.getDate()).slice(-2),monthPart = startdate.getMonth();
		var yyyy = startdate.getFullYear();
		var yearVal=yyyy;
		var yearValKey='"_'+yyyy+'._id"';
		var yearValKeyFortse='"_'+yyyy+'.$.tse"';
		var yearValKeyFortts='"_'+yyyy+'.$.tts"';
		
		console.log("datePart : "+ datePart);
		console.log("monthPart : "+ monthPart);
		var monthdate=monthPart+datePart;
		console.log("combination of date month and date : "+ monthdate);
		console.log("year value:  " + yearVal);
		console.log("yearValKey:  " + yearValKey);
		console.log("yearValKeyFortse:  " + yearValKeyFortse);
		console.log("yearValKeyFortss:  " + yearValKeyFortts);
		console.log("device number : "+ deviceNumber);
		
		
		//var objopt=JSON.parse('{"_id":"212345678931","_2016":[{"_id":808}]}');
		//console.log("my output: "+objopt._id);
		//console.log("my output: "+objopt._2016[0]._id);
		
		
		
		db.collection(config.coll_usersTest).find().toArray(function(err, result) {
		var arr1=[];
		
		
		for (var i=0;i<result.length;i++)
		{
		arr1[i]=result[i];
		//console.log(arr1[i]);
		//console.log(result);
		}
		});
		
		//db.collection(config.coll_usersTest).update({"_id":"212345678909","_2009._id":808},{"$inc":{"_2009.$.tse":2,"_2009.$.tts":100}},function(err,res){
	
		//db.collection(config.coll_usersTest).update({"_id":"212345678931",yearValKey:808},{"$inc":{"_2016.$.tse":2,"_2016.$.tts":100}},function(err,res){
	
		  db.collection(config.coll_usersTest).update({"_id":"212345678931","_2016._id":808},{"$inc":{"_2016.$.tse":2,"_2016.$.tts":100}},function(err,res){
		  
		console.log(res);
		
		});
		
	
		callback(null);
	},
	*/
	//end of update code
	
	function(callback) { //callback start
	db.close();
	return res.json(finalResponce);
	
	}
]);

}





