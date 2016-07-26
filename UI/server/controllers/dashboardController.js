var mongojs     = require('mongojs');
var config      = require('../../config/config');
var common 		= require('../../commons/common.js');
var async       = require('async');

module.exports.dashboardRealTime = function(req,res){

var startdate = req.query["sd"],enddate  = req.query["ed"],akey =req.query["akey"],response="";
//Finding the extra seconds above rounding to 0.
startdate = startdate - startdate%10;
enddate = enddate - enddate%10;
var db = mongojs(config.connectionstring+akey);
if(startdate == enddate){
	db.collection(config.coll_realtime).find({
        "_id":parseInt(startdate)
	},function(err,result){
		if(!err){
			if(result.length==0){
				db.close();
				return res.json('[{"Time":'+startdate+',"DeviceCount":0}]');
			}else{
				db.close();
				return res.json('[{"Time":'+startdate+',"DeviceCount":'+result[0].val+'}]');
			}
		}else{
		//TODO Error Logging mechanism
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