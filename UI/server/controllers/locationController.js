//TODO 
//https://github.com/felixge/node-style-guide
//
var mongojs     = require('mongojs');
var config      = require('../../config/config.js');
var logger 		= require('../../config/log.js');
var common 		= require('../../commons/common.js');
var _ 			= require('underscore');

function aggregateCalulation(akey,yyyy,gtevalNumeric,ltevalNumeric,callback){
	//Variables Declaration
	var db = mongojs(config.connectionstring+akey);
	var finaldetailstr="";
	var resultstring=[]
	var resultstr="";
	var matchCon1='[{ "_'+ yyyy +'" : { "$elemMatch":{ "$and" :[ { "_id": { "$gte": '+ gtevalNumeric +' }, "_id": { "$lte": '+ ltevalNumeric +' } }]}} }]';
	var matchJSON1=JSON.parse(matchCon1);
	var yearParam='$_'+yyyy;
	var ttsKeyValue=yearParam+'.tts';
	var matchCon2='[{"_'+yyyy+'._id":{"$gte":'+gtevalNumeric+'}},{"_'+yyyy+'._id":{"$lte":'+ltevalNumeric+'}}]';
	var matchJSON2=JSON.parse(matchCon2);		
	var grpParam1='{"city":"$lcty","lat":"$llat","long":"$llong","did":"$_id"}';
	var grpParamJSON1 = JSON.parse(grpParam1);
	var grpParam2='{"_id":{"city":"$_id.city","lat":"$_id.lat","long":"$_id.long"}}';
	var grpParamJSON2 = JSON.parse(grpParam2);

	//TODO Currently only start year is handled. Needed to handle the end year as well.
	//Pending logic to limit on flog and llog.
	//Perform query on User collection to find unique users and timespent across the city.
	db.collection(config.coll_users).aggregate([
		{ $match: { $and: matchJSON1 }},
		{ $unwind: yearParam},
		{ $match:{$and: matchJSON2 }},
		{ $group: {_id : grpParamJSON1,'tts' : {$sum : ttsKeyValue}}},
		{ $group: {_id: grpParamJSON2,users: {$sum: 1},time: {$sum:'$tts'}}},			
		{ $project: {_id:1,users:1,time:1}}
		],function(err, result) {
		if(!err){
			if(result.length != 0){
				var city,lat,long,users,time;
				for(var i=0;i<result.length;i++){

					if(result[i]._id._id.city == config.UNDEFINED || result[i]._id._id.city == config.NULL || result[i]._id._id.city == config.EMPTYSTRING){
						city = "Unknown";
						lat = 0;
						long = 0;
					}else{
						city = result[i]._id._id.city;
						if(result[i]._id._id.lat == config.UNDEFINED || result[i]._id._id.lat == config.NULL){
							lat = 0;
							long = 0;
						}else{
							lat = result[i]._id._id.lat;
							long = result[i]._id._id.long;								
						}
					}

					if(result[i].users == config.UNDEFINED || result[i].users == config.NULL){
						users = 0;
					}else{
						users = result[i].users;
					}

					if(result[i].time == config.UNDEFINED || result[i].time == config.NULL){
						time = 0;
					}else{
						time = result[i].time;
					}						
					resultstring[i] = (' {'+' "city": "'+city+'","lat": "' +lat + '","long": "' +long + '","users": "' +users + '","time": "' +time + '"}');
					resultstr+=resultstring[i].concat(',');
				}
				resultstr = resultstr.substr(0,resultstr.length-1);
				finaldetailstr='[ '+ resultstr + ']'
				db.close();
				callback(err,finaldetailstr);
			}else {
				db.close();
				callback(err,'[]');
			}
		}else {
			db.close();
			logger.error(common.getErrorMessageFrom(err));
			callback(err,'[]');
		}		
	});
} // end of aggregateCalulation function

module.exports.getLocationCounters = function(req,res){

	var startDate 	=	req.query["sd"]
	var endDate 	=	req.query["ed"]
	var aKey		=	req.query["akey"];
	var appTZ 		=	config.defaultAppTimeZone;	
	var startDateWithoutHour;
	var endDateWithoutHour
	var sdMonth;
	var edMonth;
	var sdYear;
	var gteVal;
	var lteVal;

	//TODO Fetch from database instead of config
	var application = config.appdetails;

	//Finding the TimeZone for the application
	_.each(application,function(data){
		if(data.app === aKey){
			appTZ = data.TZ;
			return;
		}
	});

	//Preparing the StartMonth and StartDate from the incoming dates.
	startDateWithoutHour=String(common.getStartDate(startDate,appTZ));  				//get start date after timezone
	endDateWithoutHour=String(common.getStartDate(endDate,appTZ));						//get start date after timezone
	sdMonth=startDateWithoutHour.substr(4, 2),edMonth=endDateWithoutHour.substr(4, 2);	//get start and end date month
	sdYear=parseInt(startDateWithoutHour.substr(0, 4));	//get start and end date year
	gteVal=parseInt(sdMonth+startDateWithoutHour.substr(6, 2)),
	lteVal=parseInt(edMonth+endDateWithoutHour.substr(6, 2));

	//Function to perform the MongoDB query and return the response.
	aggregateCalulation(aKey,sdYear,gteVal,lteVal,function onComplete(err, result){
		if(!err){
			return res.json(result);			
		}
		else {
			logger.error(common.getErrorMessageFrom(err));
			return res.json('[]');;
		}
	});
}