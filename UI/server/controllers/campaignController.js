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
  var sd = req.query["sd"];
  var ed = req.query["ed"];

  common.getAppTimeZone(akey,function(err,appTZ){
    var startDate = common.getStartDate(sd,appTZ);
    var endDate = common.getStartDate(ed,appTZ);
    var db = mongojs(config.connectionstring+akey);
    var searchObject = JSON.parse('{"$and":[{"startDate":{"$gte":'+startDate+'}},{"endDate":{"$lte":'+endDate+'}}]}');

    db.collection(config.coll_campaigns).find(searchObject,function(err,resp){
      db.close();
      if(err){
        logger.error(common.getErrorMessageFrom(err));
        return res.json(JSON.parse('{"msg":"Failure"}'));
      }else{
        return res.json(resp);
      }
    });

  });

};
