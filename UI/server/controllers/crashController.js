"use strict";

let mongojs   	= require('mongojs');
let config    	= require('../../config/config');
let async 		= require('async');
const platform    = config.platform;
let arrPlatform = [];

for(let i=0;i<platform.length;i++){
	arrPlatform[platform[i].shortpf] = platform[i].displaypf;
}

function aggregateCalulation(searchByParam,startdate,enddate,akey,callback){ // function to fetch result mnu,osv and pf .
	let paramString;
	let rowData=searchByParam;
	const db = mongojs(config.connectionstring+akey);
	const grpvalue='$val.'+ searchByParam;

	db.collection(config.coll_crashes).aggregate([
		{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
		{ $group: {_id: grpvalue,Total: { $sum: 1 }}},
		{ $project: {_id: 0,rowData: "$_id",Total: 1}}
		],function(err, result) {
			db.close();
			if(!err){
				paramString = '{"'+searchByParam+'":[';
				for(let i=0;i<result.length;i++){
					if(searchByParam != 'pf'){
						paramString = paramString.concat('{"'+result[i].rowData+'":'+result[i].Total+'},');
					}else{
						paramString = paramString.concat('{"'+arrPlatform[result[i].rowData]+'":'+result[i].Total+'},');
					}
				}
			paramString = paramString.substr(0,paramString.length-1).concat(']}');
			callback(paramString);
			}
		}
	);
} // end of aggregateCalulation

module.exports.crashDetail = function(req,res){

	let startdate = parseInt(req.query.sd),enddate = parseInt(req.query.ed),akey =req.query.akey;
	let finaldetailstr,tempstring=[];
	const db = mongojs(config.connectionstring+akey);

	db.collection(config.coll_crashes).aggregate([
		{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
		{ $group: {_id : {rtc: "$val.rtc", avn: "$val.avn", osv:"$val.osv",pf:"$val.pf"}, Total : {$sum : 1}}},
		{ $project: {_id: 1,Total: 1 } }
		],function(err, cData) {
			db.close();
			let result = [],intResult =[],_id,incId=0;
			if(cData){
				for(let i=0;i<cData.length;i++){
					let crashDateTime = new Date(0);
					crashDateTime.setUTCSeconds(cData[i]._id.rtc);
					let crashDate = new Date(crashDateTime.getFullYear(),crashDateTime.getMonth(),crashDateTime.getDate());
					cData[i]._id.rtc = parseInt(crashDate.getTime()/1000);
					_id = cData[i]._id.rtc+','+cData[i]._id.avn+','+cData[i]._id.osv+','+cData[i]._id.pf;
					if(intResult[_id] === config.UNDEFINED){
						intResult[_id] = {
							rtc		:cData[i]._id.rtc,
							avn 	:cData[i]._id.avn,
							osv 	:cData[i]._id.osv,
							pf 		:arrPlatform[cData[i]._id.pf],
							counter :incId
						};
						result[incId]	=	{
                          	rtc     :cData[i]._id.rtc,
                            avn     :cData[i]._id.avn,
                            osv     :cData[i]._id.osv,
                            pf      :arrPlatform[cData[i]._id.pf],
                            Total   :cData[i].Total
                          };
						incId++;
					}else{
						result[intResult[_id].counter].Total = result[intResult[_id].counter].Total + 1;
					}
				}
			}
			if(result!=config.NULL){
				let tempstr="";
				for(let i=0;i<result.length;i++){
					tempstring[i] = (' {'+' "dt": "'+result[i].rtc+'","avn": "' +result[i].avn + '","os": "' +result[i].osv+'","pf":"' +result[i].pf+'","totalCrashes": ' +result[i].Total +' }');
					tempstr+=tempstring[i].concat(',');
				}
			 	tempstr = tempstr.substr(0,tempstr.length-1);
				finaldetailstr='[ '+ tempstr + ']';
				return res.json(finaldetailstr);
			}else{
				return res.json('[]');
			}
	});
}; //End of crashdetails Function


module.exports.crashCounters = function(req,res){

	let startdate = parseInt(req.query.sd),enddate = parseInt(req.query.ed),akey =req.query.akey;
	let mnuString,osvString,totalString,pfString,finalString;
	const db = mongojs(config.connectionstring+akey);
	async.series(
	    	[
		//Aggregate of Total Crashes
		function(callback) { //callback start
			db.collection(config.coll_crashes).aggregate([
				{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
				{ $group: {_id : { mnu:{$sum:"$val.mnu"},osv:{$sum:"$val.osv"},pf:{$sum:"$val.pf"}}, Total : {$sum : 1}}},
				{ $project: {_id: 0,Total: 1} }
				],function(err, result) {
					db.close();
					if(!err){
						if(result.length!==0){
							totalString='{"TotalCrashes":'+ result[0].Total + '}';
						}
						else{
							db.close();
							return res.json('[]');
						}
					}
					callback(null);
				});
		},//callback end
		//Aggregate by Manufacturers
		function(callback) { //callback start
			aggregateCalulation("mnu",startdate,enddate,akey,(res)=>{
			mnuString=res;
			callback(null);
			});
		},//callback end
		//Aggregate By Operating System Versions
		function(callback) { //callback start
			aggregateCalulation("osv",startdate,enddate,akey,(res)=>{
			osvString=res;
			callback(null);
			});
			},//callback end
		//Aggregate By Platform
		function(callback) { //callback start
			aggregateCalulation("pf",startdate,enddate,akey,(res)=>{
			pfString=res;
			callback(null);
			});
			},
		function(callback) { // final string after fetching result from total,mnu,osv,pf
			finalString='['+ totalString + ',' + mnuString + ','+ osvString + ',' + pfString +']';
			callback(null);
			},
		function(callback) { //callback start
			return res.json(finalString);
		}
	]
	);

}; //End of crashSummary Function
