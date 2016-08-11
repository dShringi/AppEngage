var mongojs   	= require('mongojs');
var config    	= require('../../config/config');

module.exports.validateUser = function(req,res){
	var _userName = req.query["username"],_userPassword = req.query["password"];
	var db = mongojs(config.appengageConnString);

	db.collection(config.coll_appengageusers).find(
		{ $and:[{_id:_userName },{pass:_userPassword} ] }
		,function(err,result){
			if(!err){
				db.close();
				if(result.length!=0){
					return res.json({"msg":"Success","name":result[0].app_name});
				}
				else{
					return res.json({"msg":"Failed"});
				}
			}else{
				console.error(err);	
				return res.json({"Err Occured":"Internal"})
			}
	});
	
}
