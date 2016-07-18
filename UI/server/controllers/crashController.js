var mongojs   	= require('mongojs');
var config    	= require('../../config/config');
var async 	= require('async');

module.exports.crashDetail = function(req,res){

var startdate = req.query["sd"],enddate = req.query["ed"],akey =req.query["akey"];	
var finaldetailstr,tempstring=[],tempstr="";
//console.log(config.connectionstring+akey);
var db = mongojs(config.connectionstring+akey);
//console.log(db);
async.waterfall(
    	[	
	function(callback) { //callback start

		db.collection(config.coll_crashes).aggregate([
			{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
			{ $group: {_id : {rtc: "$val.rtc", av: "$val.av", osv:"$val.osv",pf:"$val.pf"}, Total : {$sum : 1}}},
			{ $project: {_id: 1,Total: 1 } }
			],function(err, result) {
				//console.log(result);
				if(result!=null){
				for(var i=0;i<result.length;i++){
					tempstring[i] = (' {'+' "dt": "'+result[i]._id.rtc+'","av": "' +result[i]._id.av + '","os": "' +result[i]._id.osv+'","pf":"' +result[i]._id.pf+'","totalCrashes": ' +result[i].Total +' }');
					tempstr+=tempstring[i].concat(',');
				}
				 tempstr = tempstr.substr(0,tempstr.length-1);
			//console.log(tempstr);
				finaldetailstr='[ '+ tempstr + ']'
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

}; //End of crashdetails Function


module.exports.crashCounters = function(req,res){

var startdate = req.query["sd"],enddate = req.query["ed"],akey =req.query["akey"];	
var mnustring,osvstring,totalstring,pfstring,finalstring;
//console.log(config.connectionstring+akey);
var db = mongojs(config.connectionstring+akey);
//console.log(db);
async.waterfall(
    	[	
	//Aggregate of Total Crashes
	function(callback) { //callback start
		//console.log('Aggregate Total');
		db.collection(config.coll_crashes).aggregate([
			{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } }, { 'val.akey' : akey } ] } },
			{ $group: {_id : { mnu:{$sum:"$val.mnu"},osv:{$sum:"$val.osv"},pf:{$sum:"$val.pf"}}, Total : {$sum : 1}}},
			{ $project: {_id: 0,Total: 1} }
			],function(err, result) {
				//console.log(err);
				//console.log("Total result:");
				//console.log(result);
				if(!err){
					if(result.length!=0){
						totalstring='{"TotalCrashes":'+ result[0].Total + '}';
					}
					else{
						db.close();
                                		return res.json('[]');
						//totalstring='{"TotalCrashes":0}'
					}
				}
				//console.log(totalstring);
				callback(null);
			});
	},//callback end
	//Aggregate by Manufacturers
	function(callback) { //callback start
		//console.log('Aggregate');
		db.collection(config.coll_crashes).aggregate([
			{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } }, { 'val.akey' : akey} ] } },
		  	{ $group: {_id: "$val.mnu",Total: { $sum: 1 }}},
		  	{ $project: {_id: 0,mnu: "$_id",Total: 1}}
			],function(err, result) {
				mnustring = '{"mnu":[';
				for(var i=0;i<result.length;i++){
					mnustring = mnustring.concat('{"'+result[i].mnu+'":'+result[i].Total+'},');
				}
				mnustring = mnustring.substr(0,mnustring.length-1).concat(']}');;
				//console.log(mnustring);
				callback(null);
			});
	},//callback end
	//Aggregate By Operating System Versions
	function(callback) { //callback start	
		db.collection(config.coll_crashes).aggregate([
			{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } }, { 'val.akey' : akey } ] } },
		  	{ $group: {_id: "$val.osv",Total: { $sum: 1 }}},
		  	{ $project: {_id: 0,osv: "$_id",Total: 1}}
			],function(err, result) {
				osvstring = '{"osv":[';
				for(var i=0;i<result.length;i++){
					osvstring = osvstring.concat('{"'+result[i].osv+'":'+result[i].Total+'},');
				}
				osvstring = osvstring.substr(0,osvstring.length-1).concat(']}');;
				//console.log(osvstring);
				callback(null);
			});
		},//callback end
	//Aggregate By Platform
	function(callback) { //callback start
		db.collection(config.coll_crashes).aggregate([
			{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } }, { 'val.akey' : akey } ] } },
		  	{ $group: {_id: "$val.pf",Total: { $sum: 1 }}},
		  	{ $project: {_id: 0,pf: "$_id",Total: 1}}
			],function(err, result) {
				pfstring = '{"pf":[';
				for(var i=0;i<result.length;i++){
					pfstring = pfstring.concat('{"'+result[i].pf+'":'+result[i].Total+'},');
				}
				pfstring = pfstring.substr(0,pfstring.length-1).concat(']}');;
				finalstring='['+ totalstring + ',' + osvstring + ','+ mnustring + ',' + pfstring +']'
				//console.log(finalstring);	
				callback(null);
			});
		},
	function(callback) { //callback start
		db.close();
		return res.json(finalstring);
	}
]
);

}; //End of crashSummary Function
