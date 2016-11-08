"use strict";

const mongojs = require('mongojs');
const PropertiesReader = require('properties-reader');
const _ = require("underscore");
const config  = require('../../config/config');
const logger  = require('../../config/log.js');
const common = require('../../commons/common.js');
const properties = PropertiesReader(config.propfilepath + '/android_models.properties');

//fetch all platform
//http://52.206.121.100/appengage/audience/platform?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllPlatform = function(req,res){
	const akey = req.query.akey;
	const searchObject ='{"_id":"platform"}';
	let returnResponse=[];
	const db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject) ,function(err,resp){
		db.close();
		if(err){
			logger.error(common.getErrorMessageFrom(err));
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(let i=0;i<resp.length;i++){
				let mnuList = resp[i];
				for (let key in mnuList) {
					let val = mnuList[key];
					for (let oskey in val) {
						let resultList = val[oskey].key;
						if(resultList !== config.NULL && resultList !== config.UNDEFINED){
							if(resultList.toUpperCase() =='A') {
								returnResponse.push("Android");
							} else {
								returnResponse.push(resultList);
							}
						}
					}
				}
			}
			return res.json(returnResponse);
		}
	});
};

//fetch all  Manufacturer  from Platform
//http://52.206.121.100/appengage/audience/mnu/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchManufacturerFromPlatform = function(req,res){
	const platform = req.params.platform;
	const akey = req.query.akey;
	if(Boolean(platform)){
		const searchObject ='{"_id":"mnu"}';
		const projection = '{"'+platform+'":1}';
		let returnResponse=[];
		const db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			db.close();
			if(err){
				logger.error(common.getErrorMessageFrom(err));
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(let i=0;i<resp.length;i++){
					let mnuList = resp[i];
					  for (let key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
						  let val = mnuList[key];
						  for(let a=0;a<val.length;a++){
							let allList = val[a].key;
							if(allList !== config.NULL && allList !== config.UNDEFINED){
								returnResponse.push(val[a].key);
							}
						  }
						}
					  }
				}
				return res.json(returnResponse);
			}
		});
	}
};

//fetch All Manufacturer
//http://52.206.121.100/appengage/audience/mnu?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllManufacturer = function(req,res){
	const akey = req.query.akey;
	const searchObject ='{"_id":"mnu"}';
	let returnResponse=[];
	const db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject) ,function(err,resp){
		if(err){
			logger.error(common.getErrorMessageFrom(err));
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(let i=0;i<resp.length;i++){
				let mnuList = resp[i];
				for (let key in mnuList) {
					let val = mnuList[key];
					for (let oskey in val) {
						let resultList = val[oskey].key;
						if(resultList !== config.NULL && resultList !== config.UNDEFINED){
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
	const akey = req.query.akey;
	const searchObject ='{"_id":"osv"}';
	let returnResponse=[];
	const db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		db.close();
		if(err){
			logger.error(common.getErrorMessageFrom(err));
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(let i=0;i<resp.length;i++){
				let mnuList = resp[i];
				for (let key in mnuList) {
					let val = mnuList[key];
					for(let a=0;a<val.length;a++){
						let allList = val[a].key;
						if(allList !== config.NULL && allList!== config.UNDEFINED){
							returnResponse.push(val[a].key);
						}
					}
				}
			}
			return res.json(returnResponse);
		}
	});
};

//fetch all version from operating system
//http://52.206.121.100/appengage/audience/os/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchOSFromPlatform = function(req,res){
	const akey = req.query.akey;
	const platform = req.params.platform;
	if(Boolean(platform)){
		const searchObject ='{"_id":"osv"}';
		const projection = '{"'+platform+'":1}';
		let returnResponse=[];
		const db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			db.close();
			if(err){
				logger.error(common.getErrorMessageFrom(err));
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(let i=0;i<resp.length;i++){
					let mnuList = resp[i];
					for (let key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
							let val = mnuList[key];
							for(let a=0;a<val.length;a++){
								let allList = val[a].key;
								if(allList !== config.NULL && allList !== config.UNDEFINED){
									returnResponse.push(val[a].key);
								}
							}
						}
					}
				}
				return res.json(returnResponse);
			}
		});
	}
};

//fetch all device type
//http://52.206.121.100/appengage/audience/dt?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllDevicetype = function(req,res){
	let returnResponse=[];
	const akey = req.query.akey;
	const searchObject ='{"_id":"devType"}';
	const db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		db.close();
		if(err){
			logger.error(common.getErrorMessageFrom(err));
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(let i=0;i<resp.length;i++){
				let mnuList = resp[i];
				for (let key in mnuList) {
					let val = mnuList[key];
					for(let a=0;a<val.length;a++){
						let allList = val[a].key;
						if(allList !== config.NULL && allList !== config.UNDEFINED){
							if(allList.toUpperCase() == 'S'){
								returnResponse.push('Smart Phone');
							} else if(allList.toUpperCase() == 'T') {
								returnResponse.push('Tablet');
							} else {
								returnResponse.push(allList);
							}

						}
					}
				}
			}
			return res.json(getUniqueArray(returnResponse));
		}
	});
};

//fetch all device type from platform
//http://52.206.121.100/appengage/audience/dt/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchDevicetypeFromPlatform = function(req,res){
	const akey = req.query.akey;
	const platform = req.params.platform;
	if(Boolean(platform)){
		const searchObject ='{"_id":"devType"}';
		const projection = '{"'+platform+'":1}';
		let returnResponse=[];
		const db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			db.close();
			if(err){
				logger.error(common.getErrorMessageFrom(err));
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(let i=0;i<resp.length;i++){
					let mnuList = resp[i];
					for (let key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
							let val = mnuList[key];
							for(let a=0;a<val.length;a++){
								let allList = val[a].key;
								if(allList !== config.NULL && allList !== config.UNDEFINED){
									if(allList.toUpperCase() == 'S'){
										returnResponse.push('Smart Phone');
									} else if(allList.toUpperCase() == 'T') {
										returnResponse.push('Tablet');
									} else {
										returnResponse.push(allList);
									}
								}
							}
						}
					}
				}
				return res.json(getUniqueArray(returnResponse));
			}
		});
	}
};

//fetch all model
//http://52.206.121.100/appengage/audience/model?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllModel = function(req,res){
	const akey = req.query.akey;
	const searchObject ='{"_id":"model"}';
	let returnResponse=[];
	const db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		db.close();
		if(err){
			logger.error(common.getErrorMessageFrom(err));
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(let i=0;i<resp.length;i++){
				let mnuList = resp[i];
				for (let key in mnuList) {
					let val = mnuList[key];
					for(let a=0;a<val.length;a++){
						let allList = val[a].key;
						if(allList !== config.NULL){
							let modelMappedName = properties.get(allList);
							if(modelMappedName !== config.NULL && modelMappedName !== config.UNDEFINED) {
								let pushObject = {};
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
	});
};

//fetch all model from operating system
//http://52.206.121.100/appengage/audience/model/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchModelFromPlatform = function(req,res){
	const akey = req.query.akey;
	const platform = req.params.platform;
	if(Boolean(platform)){
		const searchObject ='{"_id":"model"}';
		const projection = '{"'+platform+'":1}';
		let returnResponse=[];
		const db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			db.close();
			if(err){
				logger.error(common.getErrorMessageFrom(err));
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(let i=0;i<resp.length;i++){
					let mnuList = resp[i];
					for (let key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
							let val = mnuList[key];
							for(let a=0;a<val.length;a++){
								let allList = val[a].key;
								if(allList !== config.NULL){
									let modelMappedName = properties.get(allList);
									if(modelMappedName !== config.NULL && modelMappedName !== config.UNDEFINED) {
										let pushObject = {};
										pushObject['cn'] = allList;
										pushObject['an'] = modelMappedName;
										returnResponse.push(pushObject);
									}
								}
							}
						}
					}
				}
				return res.json(returnResponse);
			}
		});
	}
};

//fetch all model
//http://52.206.121.100/appengage/audience/appversion?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAllAppversion = function(req,res){
	const akey = req.query.akey;
	const searchObject ='{"_id":"appversion"}';
	let returnResponse=[];
	const db = mongojs(config.connectionstring+akey);
	db.collection(config.coll_audience).find(JSON.parse(searchObject),function(err,resp){
		db.close();
		if(err){
			logger.error(common.getErrorMessageFrom(err));
			return res.json(JSON.parse('{"msg":"error is there"}'));
		}else{
			for(let i=0;i<resp.length;i++){
				let mnuList = resp[i];
				for (let key in mnuList) {
					let val = mnuList[key];
					for(let a=0;a<val.length;a++){
						let allList = val[a].key;
						if(allList !== config.NULL && allList !== config.UNDEFINED){
							let listVal = val[a].key;
								returnResponse.push(listVal);
						}
					}
				}
			}
			return res.json(getUniqueArray(returnResponse));
		}
	});
};

//fetch all model from operating system
//http://52.206.121.100/appengage/audience/appversion/platform/iOS?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1
module.exports.fetchAppversionFromPlatform = function(req,res){
	const akey = req.query.akey;
	const platform = req.params.platform;
	if(Boolean(platform)){
		const searchObject ='{"_id":"appversion"}';
		const projection = '{"'+platform+'":1}';
		let returnResponse=[];
		const db = mongojs(config.connectionstring+akey);
		db.collection(config.coll_audience).find(JSON.parse(searchObject), JSON.parse(projection) ,function(err,resp){
			if(err){
				logger.error(common.getErrorMessageFrom(err));
				return res.json(JSON.parse('{"msg":"error is there"}'));
			}else{
				for(let i=0;i<resp.length;i++){
					let mnuList = resp[i];
					for (let key in mnuList) {
						if (mnuList.hasOwnProperty(platform)) {
							let val = mnuList[key];
							for(let a=0;a<val.length;a++){
								let allList = val[a].key;
								if(allList !== config.NULL && allList !== config.UNDEFINED){
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

function getUniqueArray(array){
	let uniqueList = _.uniq(array, function(item) {
		return item;
	});
	return uniqueList;
}
