var mongojs     = require('mongojs');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var async       = require('async');

module.exports.getUserInsights = function(req,res){

var sd = req.query["sd"],ed = req.query["ed"],akey =req.query["akey"];
var t="D",diffDays;
var tempstring=[],tempstr="";
var startdate = new Date(0),enddate = new Date(0);
var tse=0,te=0,tuu=0,tnu=0,tts=0,tce=0,dType,dailyCount=0,weeklyCount=0,monthlyCount=0,yearlyCount=0,hourlyCount=0;
 startdate.setUTCSeconds(sd);
 enddate.setUTCSeconds(ed);

var dd = '0'.concat(startdate.getDate()).slice(-2),mm = '0'.concat(startdate.getMonth()+1).slice(-2),yyyy = startdate.getFullYear(),hh='0'.concat(startdate.getHours()).slice(-2);
sd = ''+yyyy+mm+dd+hh;
var sdForDays=''+yyyy+mm+dd;
var testsd = '0'.concat(startdate.getDate()).slice(-2);
var sdateparam=yyyy+"-"+mm+"-"+testsd;
var dd = '0'.concat(enddate.getDate()).slice(-2),mm = '0'.concat(enddate.getMonth()+1).slice(-2),yyyy = enddate.getFullYear(),hh='0'.concat(enddate.getHours()).slice(-2);
ed = ''+yyyy+mm+dd+hh;
var edForDays=''+yyyy+mm+dd;
var tested = '0'.concat(enddate.getDate()).slice(-2);
var edateparam=yyyy+"-"+mm+"-"+tested;

var db = mongojs(config.connectionstring+akey);
var typeListarray=[];
async.waterfall(
    [	
		
	function(callback){ //callback start
	
	diffDays=common.getDateDiffernce(sdateparam,edateparam);  //to find no of days between two dates
	callback(null);
	}, //callback end
	
	function(callback){ //callback start
	if(diffDays==0){ //for weekly fetch
	t="H";
	callback(null);
	} 
	
	else { 
	t="D";
	sd = sdForDays;
	ed = edForDays;
	callback(null);
	}
	}, //callback end
	
	
	function(callback) { //callback start
			
			//console.log("t value :" + t);
			db.collection(config.coll_dashboard).aggregate([
			{ $match: { $and: [{'_id.ty': t},{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }}]  } },
			{ $group: {_id :  "$_id.key", 'tuu' : {$sum : "$val.tuu"},'tts' : {$sum : "$val.tts"}}},
			{ $sort: {'_id': 1 } },
			{ $project: {_id:1,tuu:1,tts:1}}
			],function(err, result) {
			
				//console.log(result);
				if(result!=null){
				for(var i=0;i<result.length;i++){
					tempstring[i] = (' {'+' "date": "'+result[i]._id+'","tuu": "' +result[i].tuu + '","tts": "' +result[i].tts);
					
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

module.exports.getSessionInsights = function(req,res){

var sd = req.query["sd"],ed = req.query["ed"],akey =req.query["akey"];
var t="D",diffDays;
var tempstring=[],tempstr="";
var startdate = new Date(0),enddate = new Date(0);
var tse=0,te=0,tuu=0,tnu=0,tts=0,tce=0,dType,dailyCount=0,weeklyCount=0,monthlyCount=0,yearlyCount=0,hourlyCount=0;
 startdate.setUTCSeconds(sd);
 enddate.setUTCSeconds(ed);

var dd = '0'.concat(startdate.getDate()).slice(-2),mm = '0'.concat(startdate.getMonth()+1).slice(-2),yyyy = startdate.getFullYear(),hh='0'.concat(startdate.getHours()).slice(-2);
sd = ''+yyyy+mm+dd+hh;
var sdForDays=''+yyyy+mm+dd;
var testsd = '0'.concat(startdate.getDate()).slice(-2);
var sdateparam=yyyy+"-"+mm+"-"+testsd;
var dd = '0'.concat(enddate.getDate()).slice(-2),mm = '0'.concat(enddate.getMonth()+1).slice(-2),yyyy = enddate.getFullYear(),hh='0'.concat(enddate.getHours()).slice(-2);
ed = ''+yyyy+mm+dd+hh;
var edForDays=''+yyyy+mm+dd;
var tested = '0'.concat(enddate.getDate()).slice(-2);
var edateparam=yyyy+"-"+mm+"-"+tested;

var db = mongojs(config.connectionstring+akey);
var typeListarray=[];
async.waterfall(
    [	
		
	function(callback){ //callback start
	
	diffDays=common.getDateDiffernce(sdateparam,edateparam);  //to find no of days between two dates
	callback(null);
	}, //callback end
	
	function(callback){ //callback start
	if(diffDays==0){ //for weekly fetch
	t="H";
	callback(null);
	} 
	
	else { 
	t="D";
	sd = sdForDays;
	ed = edForDays;
	callback(null);
	}
	}, //callback end
	
	
	function(callback) { //callback start
			
			//console.log("t value :" + t);
			db.collection(config.coll_dashboard).aggregate([
			{ $match: { $and: [{'_id.ty': t},{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }}]  } },
			{ $group: {_id :  "$_id.key", 'tse' : {$sum : "$val.tse"},'tts' : {$sum : "$val.tts"}}},
			{ $sort: {'_id': 1 } },
			{ $project: {_id:1,tse:1,tts:1}}
			],function(err, result) {
			
				//console.log(result);
				if(result!=null){
				for(var i=0;i<result.length;i++){
					tempstring[i] = (' {'+' "date": "'+result[i]._id+'","tse": "' +result[i].tse + '","tts": "' +result[i].tts);
					
					tempstr+=tempstring[i].concat(',');
				}
				 tempstr = tempstr.substr(0,tempstr.length-1);
				 
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


module.exports.dashboardRealTime = function(req,res){

var startdate = req.query["sd"],enddate  = req.query["ed"],akey =req.query["akey"],response="";
//Finding the extra seconds above rounding to 0.
startdate = startdate - startdate%10;
enddate = enddate - enddate%10;
var db = mongojs(config.connectionstring+akey);
if(startdate == enddate){
	db.collection(config.coll_activesessions).count(function(err,result){
		if(!err){
			db.close();
			return res.json('[{"Time":'+startdate+',"DeviceCount":'+result+'}]');
			}
		}else{
		//TODO Error Logging mechanism
		db.close();
		console.log('Some Error Occured');
		}
	});
}else{
	db.collection(config.coll_realtime).find(
	{ '_id': {$gte: parseInt(startdate), $lte: parseInt(enddate)}}
	,function(err,result){
		if(!err){
			if(result.length==0){
				db.close();
				for(i=0;i<30;i++){
					response+='{"Time":'+startdate+',"DeviceCount":0},';
					startdate = startdate + 10;
				}
				response = response.substr(0,response.length-1);
				return res.json('['+response+']');
			}else{
				db.close();
				for(i=0;i<result.length;i++){
					response+='{"Time":'+result[i]._id+',"DeviceCount":'+result[i].val+'},'	
				}
				response = response.substr(0,response.length-1);
				return res.json('['+response+']');
			}
		}else{
                //TODO Error Logging mechanism
                console.log('Some Error Occured');
		}
		console.log(result)
		console.log(err)
		db.close();
		return res.json(result);	
	});
}
};

module.exports.dashboardCounters = function(req,res){


var sd = req.query["sd"],ed = req.query["ed"],akey =req.query["akey"],type=req.query["type"];	
var t="D",diffDays;
var startdate = new Date(0),enddate = new Date(0);
var tse=0,te=0,tuu=0,tnu=0,tts=0,tce=0,dType,dailyCount=0,weeklyCount=0,monthlyCount=0,yearlyCount=0;
startdate.setUTCSeconds(sd);
enddate.setUTCSeconds(ed);

var dd = '0'.concat(startdate.getDate()).slice(-2),mm = '0'.concat(startdate.getMonth()+1).slice(-2),yyyy = startdate.getFullYear();
sd = ''+yyyy+mm+dd;
var testsd = '0'.concat(startdate.getDate()).slice(-2);
var tempdatesd=yyyy+"-"+mm+"-"+testsd;
console.log("tempdatesd :" + tempdatesd);
var dd = '0'.concat(enddate.getDate()).slice(-2),mm = '0'.concat(enddate.getMonth()+1).slice(-2),yyyy = enddate.getFullYear();
ed = ''+yyyy+mm+dd;
var tested = '0'.concat(enddate.getDate()).slice(-2);
var tempdateed=yyyy+"-"+mm+"-"+tested;

var sdmonth = '0'.concat(startdate.getMonth()+1).slice(-2);  // fetch month of start date
var edmonth = '0'.concat(enddate.getMonth()+1).slice(-2);	 // fetch month of end date
var sdyear = startdate.getFullYear();						 // fetch Year of start date
var edyear = enddate.getFullYear();							 // fetch Year of end date
console.log("sd:" + sd);
console.log("ed:" + ed);

var db = mongojs(config.connectionstring+akey);
var typeListarray=[];
async.waterfall(
    [	
		
	function(callback) { //callback start
	//checking device type and assigning into typeListarray
	switch (type) { case "A" : typeListarray[0]="S";typeListarray[1]="T"; break; case "S" : typeListarray[0]="S"; break; case "T" : typeListarray[0]="T"; }
	//console.log(typeListarray);
	callback(null);
	},
	
	function(callback){ //callback start
	
	diffDays=common.getDateDiffernce(tempdatesd,tempdateed);  //to find no of days between two dates
	callback(null);
	}, //callback end
	
	function(callback){ //callback start
	if(diffDays<=7){ //for weekly fetch
	var weekFirstDateforStartDate=common.getWeekFirstdateForStartDate(tempdateed);    //find start date of week base on start date
	var weekFirstDateforEndDate=common.getWeekFirstdateForEndDate(tempdatesd);		 //find start date of week base on end date
	
	db.collection(config.coll_dashboard).count({$and: [{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }},{ "_id.ty": "W"}]},function(err, result) {
	if(!err){
	weeklyCount=result;		
	//console.log("weekly count: "+ weeklyCount);
	if (weeklyCount>=1 && weekFirstDateforStartDate==weekFirstDateforEndDate){t="W";} else {t="D";}
	//console.log("t value: " + t);
	callback(null);
	}
	});
	} 
	else if(diffDays>7 && sdmonth == edmonth )  { // checking for monthly started

	
	
	db.collection(config.coll_dashboard).count({$and: [{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }},{ "_id.ty": "M"}]},function(err, result) {
	if(!err){
	monthlyCount=result;		
	if (monthlyCount>=1 ){t="M";} else {t="D";}
	callback(null);
	}
	});		
	} 
	else if(diffDays>7 && sdmonth != edmonth && sdyear == edyear) {  // checking for year started
 
	db.collection(config.coll_dashboard).count({$and: [{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }},{ "_id.ty": "Y"}]},function(err, result) {
	if(!err){
	yearlyCount=result;		
	if (yearlyCount>=1 ){t="Y";} else {t="D";}
	callback(null);
	}
	});
	}  
	
	else { callback(null)}
	}, //callback end
	
	
	function(callback) { //callback start
		//console.log("final t value" + t);
		db.collection(config.coll_dashboard).aggregate([
			{ $match: { $and: [{'_id.ty': t},{'_id.dt':{$in:typeListarray}},{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }}]  } },
			{ $group: {_id : "$_id.key", 'tse' : {$sum : "$val.tse"},'te' : {$sum : "$val.te"},'tuu' : {$sum : "$val.tuu"},'tnu' : {$sum : "$val.tnu"},'tts' : {$sum : "$val.tts"},'tce' : {$sum : "$val.tce"}}},
			{ $project: {_id:0,tse:1,te:1,tuu:1,tnu:1,tts:1,tce:1}}
			],function(err, result) {
				console.log(result);
				if(!err){
					if(result.length!=0){
				//console.log(result[0]);
						for(var i=0;i<result.length;i++){
							tse+=result[i].tse;
							te+=result[i].te;
							tuu+=result[i].tuu;
							tnu+=result[i].tnu;
							tts+=result[i].tts;
							tce+=result[i].tce;
						}; 
						response = '[{"tse":'+tse+',"te":' +te+',"tuu":' +tuu+',"tnu":' +tnu+',"tts":' +tts+',"tce":' +tce+'}]';
						callback(null);
					}else{
						response='[]';
						callback(null);
					}
				}else{
					db.close();
					return res.json(err);
				}
		});
	
	
	},//callback end
	function(callback) { //callback start
	db.close();
	return res.json(response);
	
	}
]);

}
