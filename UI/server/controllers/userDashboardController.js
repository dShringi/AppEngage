"use strict";

const mongojs     = require('mongojs');
const config      = require('../../config/config.js');
const logger 		= require('../../config/log.js');
const common 		= require('../../commons/common.js');
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader(config.propfilepath + '/android_models.properties');

var searchParam='Notmatch';
var arrPlatform = [];
var arrType=[];
var arrModel	= [];
var arrManufacturer = [];
var platform    = config.platform;
var type    	= config.type;
var model 		= config.model;
var manufacturer = config.manufacturer;


for(let i=0;i<platform.length;i++){
	arrPlatform[platform[i].shortpf] = platform[i].displaypf;
}

for(let i=0;i<type.length;i++){
	arrType[type[i].shortpf] = type[i].displaypf;
}

for(let i=0;i<model.length;i++){
	arrModel[model[i].shortpf] = model[i].displaypf;
}

for(let i=0;i<manufacturer.length;i++){
	arrManufacturer[manufacturer[i].shortpf] = manufacturer[i].displaypf;
}

function aggregateCalulation(akey,startYYYY,endYYYY,searchBy,searchParam,gtevalNumeric,ltevalNumeric,callback){ // function to fetch userCountersounter by searchparameter
	const db = mongojs(config.connectionstring+akey);
	let finaldetailstr="";
	let resultstring=[],resultstr="";
	const matchCon1='[{ "_'+ startYYYY +'" : { "$elemMatch":{ "$and" :[ { "_id": { "$gte": '+ gtevalNumeric +' }, "_id": { "$lte": '+ ltevalNumeric +' } }]}} }]';
	const matchJSON1=JSON.parse(matchCon1);
	const yearParam='$_'+startYYYY;
	const ttsKeyValue=yearParam+'.tts';
	const matchCon2='[{"_'+startYYYY+'._id":{"$gte":'+gtevalNumeric+'}},{"_'+startYYYY+'._id":{"$lte":'+ltevalNumeric+'}}]';
	const matchJSON2=JSON.parse(matchCon2);
	const grpParam1='{"dev":"$'+searchParam+'","did":"$_id"}';
	const grpParamJSON1 = JSON.parse(grpParam1);
	const grpParam2='{"_id":"$_id.dev","users": {"$sum": 1},"time": {"$sum":"$tts"}}';
	const grpParamJSON2 = JSON.parse(grpParam2);
	let modelVal;
	let typeVal;
	let platformVal;
	let manufacturerVal;

	db.collection(config.coll_users).aggregate([
		{ $match: { $and: matchJSON1 }},
		{ $unwind: yearParam},
		{ $match:{$and: matchJSON2 }},
		{ $group: {_id : grpParamJSON1,'tts' : {$sum : ttsKeyValue}}},
		{ $group: {_id:'$_id.dev',users: {$sum: 1},time: {$sum:'$tts'}}},
		{ $project: {_id:1,users:1,time:1}}
		],function(err, result) {
			db.close();
			if(!err){
				if(result.length !== 0 && searchParam!='Notmatch'){
					for(let i=0;i<result.length;i++){
						if(searchBy === 'platform'){
							platformVal = arrPlatform[result[i]._id];
							if(platformVal == config.UNDEFINED || platformVal == config.NULL || platformVal == config.EMPTYSTRING) platformVal = result[i]._id;
							resultstring[i] = (' {'+' "'+searchBy+'": "'+platformVal+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}else if(searchBy === 'type'){
							typeVal = arrType[result[i]._id];
							if(typeVal == config.UNDEFINED || typeVal == config.NULL || typeVal == config.EMPTYSTRING) typeVal = result[i]._id;
							resultstring[i] = (' {'+' "'+searchBy+'": "'+typeVal+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}else if(searchBy === 'model'){
							modelVal = properties.get(result[i]._id);
							if(modelVal == config.UNDEFINED || modelVal == config.NULL || modelVal == config.EMPTYSTRING) modelVal = result[i]._id;
							resultstring[i] = (' {'+' "'+searchBy+'": "'+modelVal+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}else if(searchBy === 'manufacturer'){
							manufacturerVal = arrManufacturer[result[i]._id];
							if(manufacturerVal == config.UNDEFINED || manufacturerVal == config.NULL || manufacturerVal == config.EMPTYSTRING) manufacturerVal = result[i]._id;
							resultstring[i] = (' {'+' "'+searchBy+'": "'+manufacturerVal+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}else{
							resultstring[i] = (' {'+' "'+searchBy+'": "'+result[i]._id+'","users": "' +result[i].users + '","time": "' +result[i].time + '"}');
						}
						resultstr+=resultstring[i].concat(',');
					}
					resultstr = resultstr.substr(0,resultstr.length-1);
					finaldetailstr='[ '+ resultstr + ']'
					callback(err,finaldetailstr);
				}else {
					callback(err,'[]');
				}
			}else {
				db.close();
				logger.error(common.getErrorMessageFrom(err));
				callback(err,'[]');
			}
		}
	);
} // end of aggregateCalulation function

module.exports.getUserDashboardCounters = function(req,res){
	const startDate = req.query.sd;
	const endDate = req.query.ed;
	const akey =req.query.akey;
	const searchBy=req.query.searchBy;

	const searchByArray=config.searchByModel;

	common.getAppTimeZone(akey,function(err,appTZ){
		const startDateWithoutHour=String(common.getStartDate(startDate,appTZ));  				//get start date after timezone
		const endDateWithoutHour=String(common.getStartDate(endDate,appTZ));						//get start date after timezone

		const startYYYY=parseInt(startDateWithoutHour.substr(0, 4));
		const endYYYY = parseInt(endDateWithoutHour.substr(0, 4));

		const gteval=parseInt(parseInt(startDateWithoutHour.substr(4, 2))+startDateWithoutHour.substr(6, 2));
		const	lteval=parseInt(parseInt(endDateWithoutHour.substr(4, 2))+endDateWithoutHour.substr(6, 2));

		for(let i=0;i<searchByArray.length;i++){
			if (searchByArray[i].name==searchBy){
				searchParam=searchByArray[i].value;
			}
		}

		aggregateCalulation(akey,startYYYY,endYYYY,searchBy,searchParam,gteval,lteval,function(err, result){
			if(!err){
				return res.json(result);
			}
			else {
				logger.error(common.getErrorMessageFrom(err));
				return res.json('[]');
			}
		});
	});
};
