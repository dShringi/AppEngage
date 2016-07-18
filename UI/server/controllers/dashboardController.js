var mongojs     = require('mongojs');
var config      = require('../../config/config');
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
	}
	},//callback end
	function(callback) { //callback start
	db.close();
	return res.json(response);
	
	}
]);

}
