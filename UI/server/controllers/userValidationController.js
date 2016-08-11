var mongojs   	= require('mongojs');
var config    	= require('../../config/config');

module.exports.validateUser = function(req,res){
	var _userName = req.query["username"],_userPassword = req.query["password"];
	var db = mongojs(config.appengageConnString);

	db.collection(config.coll_appengageusers).find(
		{ $and:[{_id:_userName },{pass:_userPassword} ] }
		,function(err,result){
			console.log(result[0].app_name);
			console.error(err);		
			db.close();
			return res.json({"msg":"Success","name":result[0].app_name});
	});
	
}
