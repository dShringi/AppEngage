var mongojs = require('mongojs');
var dateFormat = require('dateformat');
var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');

module.exports.fetchCohorts = function(req,res){
  var akey = req.query["akey"];
  var type = req.query["type"];
  var db = mongojs(config.connectionstring+akey);
  var searchCohort = JSON.parse('{"_id.ty":"'+type+'"}');
  db.collection(config.coll_cohorts).find(searchCohort,function(err,resp){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      db.close();
      return res.json(JSON.parse(resp));
    }
  });
};
