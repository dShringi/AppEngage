var mongojs = require('mongojs');
var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');

module.exports.createCampaign = function(req,res){
  console.log(req.body);
  console.log(req.query["akey"]);
  //store it in mongodb.
  return res.json(JSON.parse('{"msg":"success"}'));
};

module.exports.updateCampaign = function(req,res){
  var akey = req.query["akey"];
  var campaignid = req.query["campaignid"];
  var status = req.body.status;
  var db = mongojs(config.connectionstring+akey);
  db.collection(config.coll_campaigns).update({"_id":mongojs.ObjectID(campaignid)},{$set:{"status":status}},function(err,resp){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      db.close();
      return res.json(JSON.parse('{"msg":"Success"}'));
    }
  });
};

module.exports.deleteCampaign = function(req,res){
  var akey = req.query["akey"];
  var campaignid = req.query["campaignid"];
  var db = mongojs(config.connectionstring+akey);
  db.collection(config.coll_campaigns).remove({"_id":mongojs.ObjectID(campaignid)},function(err,resp){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      console.log(err);
      console.log(resp);
      db.close();
      return res.json(JSON.parse('{"msg":"Success"}'));
    }
  });
};

module.exports.fetchAllCampaigns = function(req,res){
  var akey = req.query["akey"];
  var db = mongojs(config.connectionstring+akey);
  db.collection(config.coll_campaigns).find({},function(err,resp){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      db.close();
      return res.json(resp);
    }
  });
};
