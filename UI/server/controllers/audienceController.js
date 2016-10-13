var mongojs = require('mongojs');
var moment = require('moment-timezone');
var dateFormat = require('dateformat');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader(config.propfilepath + '/android_models.properties');

var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');

//fetch all platform
//http://52.206.121.100/appengage/audience/platform?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllPlatform = function(req,res){
	var akey = req.query["akey"];
	var searchObject ='{"_id":"platform"}';
	var returnResponse=[];
	var db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject) ,function(err,resp){
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

//fetch all  Manufacturer  from Platform
//http://52.206.121.100/appengage/audience/mnu/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchManufacturerFromPlatform = function(req,res){
	var platform = req.params.platform;
	var akey = req.query["akey"];
	
	if(Boolean(platform)){
		var searchObject ='{"_id":"mnu"}';
		var projection = '{"'+platform+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					var mnuList = resp[i];
					  for (var key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
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
//http://52.206.121.100/appengage/audience/mnu?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllManufacturer = function(req,res){
	var akey = req.query["akey"];
	var searchObject ='{"_id":"mnu"}';
	var returnResponse=[];
	var db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject) ,function(err,resp){
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


//fetch all operating system
//http://52.206.121.100/appengage/audience/os?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllOS = function(req,res){
	var akey = req.query["akey"];
	var searchObject ='{"_id":"osv"}';
	var returnResponse=[];
	var db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		if(err){
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(var i=0;i<resp.length;i++){
				var mnuList = resp[i];
				for (var key in mnuList) {
					var val = mnuList[key];
					for(var a=0;a<val.length;a++){
						var allList = val[a].key;
						if(allList != null){
							returnResponse.push(val[a].key);
						}
					}
				}
			}
			return res.json(returnResponse);
		}
		db.close();
	}); 
};


//fetch all version from operating system
//http://52.206.121.100/appengage/audience/os/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchOSFromPlatform = function(req,res){
	var akey = req.query["akey"];
	var platform = req.params.platform;
	if(Boolean(platform)){
		var searchObject ='{"_id":"osv"}';
		var projection = '{"'+platform+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					var mnuList = resp[i];
					for (var key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
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

//fetch all device type
//http://52.206.121.100/appengage/audience/dt?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1

module.exports.fetchAllDevicetype = function(req,res){
	var returnResponse=[];
	var akey = req.query["akey"];
	var searchObject ='{"_id":"devType"}';
	var db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		if(err){
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(var i=0;i<resp.length;i++){
				var mnuList = resp[i];
				for (var key in mnuList) {
					var val = mnuList[key];
					for(var a=0;a<val.length;a++){
						var allList = val[a].key;
						if(allList != null){
							returnResponse.push(allList);
						}
					}
				}
			}
			return res.json(returnResponse);
		}
		db.close();
	}); 
};


//fetch all device type from platform
//http://52.206.121.100/appengage/audience/dt/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchDevicetypeFromPlatform = function(req,res){
	var akey = req.query["akey"];
	var platform = req.params.platform;
	if(Boolean(platform)){
		var searchObject ='{"_id":"devType"}';
		var projection = '{"'+platform+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					var mnuList = resp[i];
					for (var key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
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

//fetch all model
//http://52.206.121.100/appengage/audience/model?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllModel = function(req,res){
	var akey = req.query["akey"];
	var searchObject ='{"_id":"model"}';
	var returnResponse=[];
	var db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		if(err){
			return res.json(JSON.parse('{"msg":"error is there"}'));
			db.close();
		}else{
			for(var i=0;i<resp.length;i++){
				var mnuList = resp[i];
				for (var key in mnuList) {
					var val = mnuList[key];
					for(var a=0;a<val.length;a++){
						var allList = val[a].key;
						if(allList != null){
							var modelMappedName = properties.get(allList);
							var pushObject = {};
							pushObject['cn'] = allList;
							pushObject['an'] = modelMappedName;
							returnResponse.push(pushObject);
						}
					}
				}
			}
			return res.json(returnResponse);
		}
		db.close();
	}); 
};


//fetch all model from operating system
//http://52.206.121.100/appengage/audience/model/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchModelFromPlatform = function(req,res){
	var akey = req.query["akey"];
	var platform = req.params.platform;
	if(Boolean(platform)){
		var searchObject ='{"_id":"model"}';
		var projection = '{"'+platform+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					var mnuList = resp[i];
					for (var key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
							var val = mnuList[key];
							for(var a=0;a<val.length;a++){
								var allList = val[a].key;
								if(allList != null){
									//returnResponse.push(allList);
									var modelMappedName = properties.get(allList);
									var pushObject = {};
									pushObject['cn'] = allList;
									pushObject['an'] = modelMappedName;
									returnResponse.push(pushObject);
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


//fetch all model
//http://52.206.121.100/appengage/audience/appversion?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllAppversion = function(req,res){
	var akey = req.query["akey"];
	var searchObject ='{"_id":"appversion"}';
	var returnResponse=[];
	var db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		if(err){
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(var i=0;i<resp.length;i++){
				var mnuList = resp[i];
				for (var key in mnuList) {
					var val = mnuList[key];
					for(var a=0;a<val.length;a++){
						var allList = val[a].key;
						if(allList != null){
							var listVal = val[a].key;
								returnResponse.push(listVal);
						}
					}
				}
			}
			return res.json(returnResponse);
		}
		db.close();
	}); 
};


//fetch all model from operating system
//http://52.206.121.100/appengage/audience/appversion/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAppversionFromPlatform = function(req,res){
	var akey = req.query["akey"];
	var platform = req.params.platform;
	if(Boolean(platform)){
		var searchObject ='{"_id":"appversion"}';
		var projection = '{"'+platform+'":1}';
		var returnResponse=[];
		var db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(var i=0;i<resp.length;i++){
					var mnuList = resp[i];
					for (var key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
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
/*
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function uniqBy(a, key) {
    var seen = new Set();
    return a.filter(item => {
        var k = key(item);
        return seen.has(k) ? false : seen.add(k);
    });
}
*/