var mongojs = require('mongojs');
var moment = require('moment-timezone');
var dateFormat = require('dateformat');

var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');

module.exports.fetchAllManufacturer = function(req,res){
	var akey = req.query["akey"];
	
	var searchObject ='{"_id":"mnu"}';
	var returnResponse=[];
	var db = mongojs(config.connectionstring+akey);
	db.collection('coll_audience').find(JSON.parse(searchObject),function(err,resp){
		if(err){
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(var i=0;i<resp.length;i++){
				var mnuList = resp[i];
				returnResponse = Object.keys(mnuList);
				
			}
			var index = returnResponse.indexOf('_id');
			if (index > -1) {
				returnResponse.splice(index, 1);
			}
			return res.json(returnResponse);
		}
		db.close();
	});  
};

module.exports.fetchUserManufacturer = function(req,res){
	var mnuName = req.params.manufacturer;
	var akey = req.query["akey"];
	
	if(Boolean(mnuName)){
		var searchObject ='{"_id":"mnu"}';
		var projection = '{"'+mnuName+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection('coll_audience').find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					
					var mnuList = resp[i];
					  for (var key in mnuList) {
						if (mnuList.hasOwnProperty(mnuName)) {
						  var val = mnuList[key];
						  for(var a=0;a<val.length;a++){
							var allList = val[a].key;
							if(allList != null){
								returnResponse.push(val[a].key);
							}
						  }
						}
					  }
				}
				return res.json(returnResponse);
			}
			db.close();
		}); 
	}	
};

module.exports.fetchUserManufacturerAndVersion = function(req,res){
	var akey = req.query["akey"];
	var mnuName = req.params.manufacturer;
	
	if(Boolean(mnuName)){
		var searchObject ='{"_id":"osv"}';
		var projection = '{"'+mnuName+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection('coll_audience').find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					
					var mnuList = resp[i];
					  for (var key in mnuList) {
						if (mnuList.hasOwnProperty(mnuName)) {
						  var val = mnuList[key];
						  for(var a=0;a<val.length;a++){
							var allList = val[a].key;
							if(allList != null){
								returnResponse.push(val[a].key);
							}
						  }
						}
					  }
				}
				return res.json(returnResponse);
			}
			db.close();
		}); 
	}	
};