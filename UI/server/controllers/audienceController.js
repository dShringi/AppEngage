var mongojs = require('mongojs');
var moment = require('moment-timezone');
var dateFormat = require('dateformat');

var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');


//fetch all Operating system
//http://52.206.121.100/appengage/audience/os
module.exports.fetchAllOperatingSystem = function(req,res){
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

//fetch all specified operating system Manufacturer
//http://52.206.121.100/appengage/audience/mnu/<iOS>
module.exports.fetchOSManufacturer = function(req,res){
	var os = req.params.os;
	var akey = req.query["akey"];
	
	if(Boolean(os)){
		var searchObject ='{"_id":"mnu"}';
		var projection = '{"'+os+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection('coll_audience').find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					var mnuList = resp[i];
					  for (var key in mnuList) {
						if (mnuList.hasOwnProperty(os)) {
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
//fetch all version from operating system
//http://localhost:3001/appengage/audience/osv/iOS/version
module.exports.fetchVersionFromOS = function(req,res){
	var akey = req.query["akey"];
	var os = req.params.os;
	if(Boolean(os)){
		var searchObject ='{"_id":"osv"}';
		var projection = '{"'+os+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection('coll_audience').find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					var mnuList = resp[i];
					for (var key in mnuList) {
						if (mnuList.hasOwnProperty(os)) {
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

//fetch All Manufacturer
//http://52.206.121.100/appengage/audience/mnu
module.exports.fetchAllManufacturer = function(req,res){
	var akey = req.query["akey"];
	var searchObject ='{"_id":"mnu"}';
	var returnResponse=[];
	var db = mongojs(config.connectionstring+akey);
	db.collection('coll_audience').find(JSON.parse(searchObject) ,function(err,resp){
		if(err){
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(var i=0;i<resp.length;i++){
				var mnuList = resp[i];
				for (var key in mnuList) {
					var val = mnuList[key];
					for (var oskey in val) {
						var resultList = val[oskey].key;
						if(resultList != null){
							returnResponse.push(resultList);
						}
					}
				}
			}
			return res.json(returnResponse);
		}
		db.close();
	}); 
};