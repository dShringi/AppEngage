var mongojs   	= require('mongojs');
var config    	= require('../../config/config');
var async 	= require('async');
var startdate ,enddate ,akey ;	
var mnustring,osvstring,totalstring,pfstring,finalstring,teststring1,teststring2,teststring3;
var db = mongojs(config.connectionstring+akey);

function AggregateCalulation(searchbyparam,callback){

var paramstring;
var t1=searchbyparam;
var db = mongojs(config.connectionstring+akey);
var grpvalue='$val.'+ searchbyparam;

//console.log('Aggregate');
db.collection(config.coll_crashes).aggregate([
	{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
	{ $group: {_id: grpvalue,Total: { $sum: 1 }}},
	{ $project: {_id: 0,t1: "$_id",Total: 1}}
	],function(err, result) {
	
	//console.log("result is :"+ result);
	//console.log(result.length);
		paramstring = '{"'+searchbyparam+'":[';
		for(var i=0;i<result.length;i++){
			paramstring = paramstring.concat('{"'+result[i].t1+'":'+result[i].Total+'},');
			
		}
		paramstring = paramstring.substr(0,paramstring.length-1).concat(']}');;
		//console.log("paramstring : " + paramstring);
		callback(paramstring);
}

);
//return paramstring;
}

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
mnustring,osvstring,totalstring,pfstring,finalstring;
var db = mongojs(config.connectionstring+akey);
async.series(
    	[	
	//Aggregate of Total Crashes
	function(callback) { //callback start
		//console.log('Aggregate Total');
		db.collection(config.coll_crashes).aggregate([
			{ $match: { $and: [ { 'val.rtc': { $gte: startdate, $lte: enddate } } ] } },
			{ $group: {_id : { mnu:{$sum:"$val.mnu"},osv:{$sum:"$val.osv"},pf:{$sum:"$val.pf"}}, Total : {$sum : 1}}},
			{ $project: {_id: 0,Total: 1} }
			],function(err, result) {
				
				//console.log("Total result:");
				console.log(result);
				if(!err){
					if(result.length!=0){
						totalstring='{"TotalCrashes":'+ result[0].Total + '}';
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
		teststring1=  AggregateCalulation("mnu",function(num){
		teststring1=num;
		callback(null);
		});
	},//callback end
	//Aggregate By Operating System Versions
	function(callback) { //callback start	
		
		
		teststring2= AggregateCalulation("osv",function(num){
		teststring2=num;
		callback(null);
		});
		},//callback end
	//Aggregate By Platform
	function(callback) { //callback start
		
		
		teststring3= AggregateCalulation("pf",function(num){
		teststring3=num;
		callback(null);
		});
		},
		
	function(callback) {
		finalstring='['+ totalstring + ',' + teststring1 + ','+ teststring2 + ',' + teststring3 +']'
		console.log(finalstring);	
		callback(null);
		},	
		
	function(callback) { //callback start
		db.close();
		return res.json(finalstring);
	}
]
);

}; //End of crashSummary Function


	

