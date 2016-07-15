var mongojs     = require('mongojs');
var config      = require('../../config/config');
var async       = require('async');

module.exports.dashboardCounters = function(req,res){

var sd = req.query["sd"],ed = req.query["ed"],akey =req.query["akey"],type=req.query["type"];	
var t="D";
//console.log(config.connectionstring+akey);
var startdate = new Date(0),enddate = new Date(0);
var tse=0,te=0,tuu=0,tnu=0,tts=0,tce=0,dType;

startdate.setUTCSeconds(sd);
enddate.setUTCSeconds(ed);

var dd = startdate.getDate(),mm = '0'.concat(startdate.getMonth()+1).slice(-2),yyyy = startdate.getFullYear();
sd = ''+yyyy+mm+dd;
var dd = enddate.getDate(),mm = '0'.concat(enddate.getMonth()+1).slice(-2),yyyy = enddate.getFullYear();
ed = ''+yyyy+mm+dd;

var db = mongojs(config.connectionstring+akey);
async.waterfall(
    	[	
	function(callback) { //callback start
	if(type!="A"){
		db.collection(config.coll_dashboard).aggregate([
			{ $match: { $and: [{'_id.ty': t},{'_id.dt':{$in:[type]}},{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }}]  } },
			{ $group: {_id : "$_id.key", 'tse' : {$sum : "$val.tse"},'te' : {$sum : "$val.te"},'tuu' : {$sum : "$val.tuu"},'tnu' : {$sum : "$val.tnu"},'tts' : {$sum : "$val.tts"},'tce' : {$sum : "$val.tce"}}},
			{ $project: {_id:0,tse:1,te:1,tuu:1,tnu:1,tts:1,tce:1}}
			],function(err, result) {
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
						response = '[{"tse":'+tse+',"img": "01.png"},{"te":' +te+',"img": "02.png"},{"tuu":' +tuu+',"img": "03.png"},{"tnu":' +tnu+',"img": "04.png"},{"tts":' +tts+',"img": "05.png"},{"tce":' +tce+',"img": "06.png"}]';
						callback(null);
					}else{
						response='[]';
						callback(null);
					}
				}
		});
	}
	else{
                db.collection(config.coll_dashboard).aggregate([
                        { $match: { $and: [{'_id.ty': t},{'_id.dt':{$in:["S","T"]}},{ '_id.key': { $gte: parseInt(sd), $lte: parseInt(ed) }}]  } },
                        { $group: {_id : "$_id.key", 'tse' : {$sum : "$val.tse"},'te' : {$sum : "$val.te"},'tuu' : {$sum : "$val.tuu"},'tnu' : {$sum : "$val.tnu"},'tts' : {$sum : "$val.tts"},'tce' : {$sum : "$val.tce"}}},
                        { $project: {_id:0,tse:1,te:1,tuu:1,tnu:1,tts:1,tce:1}}
                        ],function(err, result) {
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
                                                response = '[{"tse":'+tse+',"img": "01.png"},{"te":' +te+',"img": "02.png"},{"tuu":' +tuu+',"img": "03.png"},{"tnu":' +tnu+',"img": "04.png"},{"tts":' +tts+',"img": "05.png"},{"tce":' +tce+',"img": "06.png"}]';
                                                callback(null);
                                        }else{
                                                response='[]';
                                                callback(null);
                                        }
                                }
                });
	}
	},//callback end
	function(callback) { //callback start
	db.close();
	return res.json(response);
	
	}
]);

}
