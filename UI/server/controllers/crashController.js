var mongojs   	= require('mongojs');
var config    	= require('../../config/config');
var async 	= require('async');
var startdate ,enddate ,akey ;	
var mnuString,osvString,totalString,pfString,finalString;
var db = mongojs(config.connectionstring+akey);

function aggregateCalulation(searchByParam,callback){ // function to fetch result mnu,osv and pf .

var paramString;
var rowData=searchByParam;
var db = mongojs(config.connectionstring+akey);
var grpvalue='$val.'+ searchByParam;

//console.log('Aggregate');
db.collection(config.coll_crashes).aggregate([
	{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
	{ $group: {_id: grpvalue,Total: { $sum: 1 }}},
	{ $project: {_id: 0,rowData: "$_id",Total: 1}}
	],function(err, result) {
		
		paramString = '{"'+searchByParam+'":[';
		for(var i=0;i<result.length;i++){
			paramString = paramString.concat('{"'+result[i].rowData+'":'+result[i].Total+'},');
			
		}
		paramString = paramString.substr(0,paramString.length-1).concat(']}');;
		callback(paramString);
}
);
} // end of aggregateCalulation

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

startdate = req.query["sd"],enddate = req.query["ed"],akey =req.query["akey"];	
mnuString,osvString,totalString,pfString,finalString;
var db = mongojs(config.connectionstring+akey);
async.series(
    	[	
	//Aggregate of Total Crashes
	function(callback) { //callback start
		
		db.collection(config.coll_crashes).aggregate([
			{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
			{ $group: {_id : { mnu:{$sum:"$val.mnu"},osv:{$sum:"$val.osv"},pf:{$sum:"$val.pf"}}, Total : {$sum : 1}}},
			{ $project: {_id: 0,Total: 1} }
			],function(err, result) {
				
				console.log(result);
				if(!err){
					if(result.length!=0){
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
		//console.log('Aggregate');
		aggregateCalulation("mnu",function(res){
		mnuString=res;
		callback(null);
		});
	},//callback end
	//Aggregate By Operating System Versions
	function(callback) { //callback start	
		
		
		aggregateCalulation("osv",function(res){
		osvString=res;
		callback(null);
		});
		},//callback end
	//Aggregate By Platform
	function(callback) { //callback start
		
		
		aggregateCalulation("pf",function(res){
		pfString=res;
		callback(null);
		});
		},
		
	function(callback) { // final string after fetching result from total,mnu,osv,pf 
		finalString='['+ totalString + ',' + mnuString + ','+ osvString + ',' + pfString +']'
		console.log(finalString);	
		callback(null);
		},	
		
	function(callback) { //callback start
		db.close();
		return res.json(finalString);
	}
]
);

}; //End of crashSummary Function


	

