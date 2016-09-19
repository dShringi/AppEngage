var mongojs	= require('mongojs');
var config	= require('../../config/config');
var logger	= require('../../config/log.js');
var commons	= require('../../commons/common.js');

module.exports.registerUser	=	function(req,res){
	var data = req.body;
	var timeOut=data.app.to;
	var timeZone=data.app.tz;
	if(data.app!==config.UNDEFINED && data.user!==config.UNDEFINED && data.app!==config.NULL && data.user!==config.NULL){
		if(data.app.name!==config.UNDEFINED	||	data.app.name!==config.NULL){
			if(data.app.ctg!==config.UNDEFINED	||	data.app.ctg!==config.NULL){
				if(data.app.to===config.UNDEFINED	||	data.app.to===config.NULL	||	data.app.to===0){
					//default timeout of 2 hours i.e. 120 minutes i.e. 7200 seconds
					timeOut=config.applicationDefaultTimeout;
				}
				if(data.app.tz===config.UNDEFINED	||	data.app.tz===config.NULL	||	data.app.tz===config.EMPTYSTRING){
					timeZone=config.defaultAppTimeZone;
				}
				var db = mongojs(config.appengageConnString);
				var insertApp = JSON.parse('{"name":"'+data.app.name+'","desc":"'+data.app.desc+'","ctg":"'+data.app.ctg+'","tz":"'+timeZone+'","to":"'+timeOut+'"}');
				db.collection(config.coll_appengageapps).insert(insertApp,function onRegisterAppComplete(err,appresult){
					if(!err){
						console.log(appresult);
						var akey = appresult._id;
						db.collection(config.coll_appengageapps).update({"_id":mongojs.ObjectID(akey)},{$set:{akey:akey.toString()}},function(err,result){});
						var insertUser = JSON.parse('{"_id":"'+data.user.uname+'","pass":"'+data.user.pass+'","app_id":"'+akey.toString()+'","app_name":"'+data.app.name+'","fn":"'+data.user.fn+'","ln":"'+data.user.ln+'","email":"'+data.user.email+'","phone":"'+data.user.phone+'"}');
						db.collection(config.coll_appengageusers).insert(insertUser,function onRegisterUserComplete(err,userresult){
							db.close();
							if(!err){
								return res.json({"msg":"Success","akey":akey});
							}else{
								logger.error(common.getErrorMessageFrom(err));
								return res.json({"msg":"Failed on User Registration"});
							}
						});
					}
					else{
						db.close();
						logger.error(common.getErrorMessageFrom(err));
						return res.json({"msg":"Failed on App Registration"});
					}
				});
			}else{
			return res.json({"msg":"App Category Not Provided"});
			}
		}else{
			return res.json({"msg":"App Name Not Provided"});
		}
	}else{
		return res.json({"msg":"Incorrect App Data"});
	}
};

module.exports.validateUser = function(req,res){
	var userName = req.query.username;
	var userPassword = req.query.password;
	var db = mongojs(config.appengageConnString);
	if(db){
		db.collection(config.coll_appengageusers).find(
			{ $and:[{_id:userName},{pass:userPassword}]},function onValidateUserComplete(err,result){
				db.close();
				if(!err){
					if(result.length===1){
						return res.json({"msg":"Success","name":result[0].app_name});
					}
					else{
						return res.json({"msg":"Failed"});
					}
				}else{
					logger.error(common.getErrorMessageFrom(err));
					return res.json({"msg":"Failed"});
				}
		});
	}else{
		logger.error(common.getErrorMessageFrom(err));
		return res.json({"msg":"Failed"});
	}

};

module.exports.validateUserName = function(req,res){
	var userName = req.query.username;
	var db = mongojs(config.appengageConnString);

	if(db){
		db.collection(config.coll_appengageusers).find(
			{_id:userName},function onValidateUserNameComplete(err,result){
				db.close();
				if(!err){
					if(result.length===0){
						return res.json({"msg":"Success"});
					}
					else{
						return res.json({"msg":"Failed"});
					}
				}else{
					logger.error(common.getErrorMessageFrom(err));
					return res.json({"msg":"Failed"});
				}
		});
	}else{
		logger.error(common.getErrorMessageFrom(err));
		return res.json({"msg":"Failed"});
	}
};
