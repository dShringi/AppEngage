'use strict'

var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common');

var mongodb = require('mongodb');
var _ = require("underscore");
var ObjectID = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;

var url = config.mongodb.url+'/'+process.argv[2];

//to update all manufacturer 
MongoClient.connect(url, function (err, db) {
	if (err) {
		printErrorMessage(err);
		db.close();
	} else {
		var findQuery = '{}';
		var projection = '{"lmod":1,"lpf":1}';
		var campaignCollection = db.collection(config.mongodb.coll_users);
		campaignCollection.find(JSON.parse(findQuery),JSON.parse(projection)).toArray(function (err, result) {
			if (err) {
				printErrorMessage(err);
			} else if (result.length) {
				var updateFindQuery  = '{"_id" : "mnu"}';
				updateCollection(db,JSON.parse(updateFindQuery) , QueryBuilder(result, 'mnu'), config.mongodb.coll_audience);
			}
			db.close();
		});
	}
});

//to update all osversion 
MongoClient.connect(url, function (err, db) {
	if (err) {
		printErrorMessage(err);
		db.close();
	} else {
		var findQuery = '{}';
		var projection = '{"losv":1,"lpf":1}';
		var campaignCollection = db.collection(config.mongodb.coll_users);
		campaignCollection.find(JSON.parse(findQuery),JSON.parse(projection)).toArray(function (err, result) {
			if (err) {
				printErrorMessage(err);
			} else if (result.length) {
				var updateFindQuery  = '{"_id" : "osv"}';
				updateCollection(db,JSON.parse(updateFindQuery) , QueryBuilder(result, 'osv'), config.mongodb.coll_audience);
			}
			db.close();
		});
	}
});

//to update all models 
MongoClient.connect(url, function (err, db) {
	if (err) {
		printErrorMessage(err);
		db.close();
	} else {
		var findQuery = '{}';
		var projection = '{"lmod":1,"lpf":1}';
		var campaignCollection = db.collection(config.mongodb.coll_users);
		campaignCollection.find(JSON.parse(findQuery),JSON.parse(projection)).toArray(function (err, result) {
			if (err) {
				printErrorMessage(err);
			} else if (result.length) {
				var updateFindQuery  = '{"_id" : "model"}';
				updateCollection(db,JSON.parse(updateFindQuery) , QueryBuilder(result, 'model'), config.mongodb.coll_audience);
			}
			db.close();
		});
	}
});

//to update all device type 
MongoClient.connect(url, function (err, db) {
	if (err) {
		printErrorMessage(err);
		db.close();
	} else {
		var findQuery = '{}';
		var projection = '{"ldt":1,"lpf":1}';
		var campaignCollection = db.collection(config.mongodb.coll_users);
		campaignCollection.find(JSON.parse(findQuery),JSON.parse(projection)).toArray(function (err, result) {
			if (err) {
				printErrorMessage(err);
			} else if (result.length) {
				var updateFindQuery  = '{"_id" : "devType"}';
				updateCollection(db,JSON.parse(updateFindQuery) , QueryBuilder(result, 'devType'), config.mongodb.coll_audience);
			}
			db.close();
		});
	}
});

//to update all app version
MongoClient.connect(url, function (err, db) {
	if (err) {
		printErrorMessage(err);
		db.close();
	} else {
		var findQuery = '{}';
		var projection = '{"lavn":1,"lpf":1}';
		var campaignCollection = db.collection(config.mongodb.coll_users);
		campaignCollection.find(JSON.parse(findQuery),JSON.parse(projection)).toArray(function (err, result) {
			if (err) {
				printErrorMessage(err);
			} else if (result.length) {
				var updateFindQuery  = '{"_id" : "appversion"}';
				updateCollection(db,JSON.parse(updateFindQuery) , QueryBuilder(result, 'appversion'), config.mongodb.coll_audience);
			}
			db.close();
		});
	}
});

//to update all platform
MongoClient.connect(url, function (err, db) {
	if (err) {
		printErrorMessage(err);
		db.close();
	} else {
		var findQuery = '{}';
		var projection = '{"lpf":1}';
		var campaignCollection = db.collection(config.mongodb.coll_users);
		campaignCollection.find(JSON.parse(findQuery),JSON.parse(projection)).toArray(function (err, result) {
			if (err) {
				printErrorMessage(err);
			} else if (result.length) {
				var updateFindQuery  = '{"_id" : "platform"}';
				updateCollection(db,JSON.parse(updateFindQuery) , QueryBuilder(result, 'platform'), config.mongodb.coll_audience);
			}
			db.close();
		});
	}
});

function QueryBuilder(result, dbKey){
	var resultStr ='';
	var iOS = [];
	var android = [];
	var window = [];
	
	for(var key in result){
		if(dbKey == 'mnu'){
			if(result[key].lpf == 'iOS'){
				var pushString = '{"key":"'+result[key].lmod+'"}';
				iOS.push(pushString);
			} else if(result[key].lpf == 'A'){
				var pushString = '{"key":"'+result[key].lmod+'"}';
				android.push(pushString);
			}else if(result[key].lpf == 'window'){
				var pushString = '{"key":"'+result[key].lmod+'"}';
				window.push(pushString);
			}
		} else if(dbKey == 'osv'){
			if(result[key].lpf == 'iOS'){
				var pushString = '{"key":"'+result[key].losv+'"}';
				iOS.push(pushString);
			} else if(result[key].lpf == 'A'){
				var pushString = '{"key":"'+result[key].losv+'"}';
				android.push(pushString);
			}else if(result[key].lpf == 'window'){
				var pushString = '{"key":"'+result[key].losv+'"}';
				window.push(pushString);
			}
		} else if(dbKey == 'model'){
			if(result[key].lpf == 'iOS'){
				var pushString = '{"key":"'+result[key].lmod+'"}';
				iOS.push(pushString);
			} else if(result[key].lpf == 'A'){
				var pushString = '{"key":"'+result[key].lmod+'"}';
				android.push(pushString);
			}else if(result[key].lpf == 'window'){
				var pushString = '{"key":"'+result[key].lmod+'"}';
				window.push(pushString);
			}
		} else if(dbKey == 'devType'){
			if(result[key].lpf == 'iOS'){
				var pushString = '{"key":"'+result[key].ldt+'"}';
				iOS.push(pushString);
			} else if(result[key].lpf == 'A'){
				var pushString = '{"key":"'+result[key].ldt+'"}';
				android.push(pushString);
			}else if(result[key].lpf == 'window'){
				var pushString = '{"key":"'+result[key].ldt+'"}';
				window.push(pushString);
			}
		} else if(dbKey == 'appversion'){
			if(result[key].lpf == 'iOS'){
				var pushString = '{"key":"'+result[key].lavn+'"}';
				iOS.push(pushString);
			} else if(result[key].lpf == 'A'){
				var pushString = '{"key":"'+result[key].lavn+'"}';
				android.push(pushString);
			}else if(result[key].lpf == 'window'){
				var pushString = '{"key":"'+result[key].lavn+'"}';
				window.push(pushString);
			}
		} else if(dbKey == 'platform'){
		
			var pushString = '{"key":"'+result[key].lpf+'"}';
			iOS.push(pushString);
			
		}
	}
	iOS = getUniqueArray(iOS);
	android = getUniqueArray(android);
	window = getUniqueArray(window);
	
	if(dbKey != 'platform') {
		var query = '{"iOS":['+iOS+'],"Android":['+android+']}';
	} else {
		query = '{"platform":['+iOS+']}';
	}
	return JSON.parse(query);
}

function getUniqueArray(array){
	var uniqueList = _.uniq(array, function(item) { 
		return item;	
	});
	return uniqueList;
}

function updateCollection(db, findQuery, updateQuery, collection) {
	db.collection(collection).update(findQuery, updateQuery, {upsert : true}, 
		function(err, result) {
			if (err) {
				printErrorMessage(err);
			}
		});
}

function printErrorMessage(err){
	var errMsg = common.getErrorMessageFrom(err);
	logger.error(errMsg);
	console.log('err  ',err);
	return;
}
