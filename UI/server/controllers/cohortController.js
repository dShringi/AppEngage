var mongojs = require('mongojs');
var config  = require('../../config/config');
var logger  = require('../../config/log.js');
var common = require('../../commons/common.js');

module.exports.fetchCohorts = function(req,res){
  var akey = req.query["akey"];
  var type = req.query["type"];
  var db = mongojs(config.connectionstring+akey);
  var searchCohort = JSON.parse('{"_id.ty":"'+type+'"}');
  db.collection(config.coll_cohorts).find(searchCohort).sort({"_id.dt":1},function(err,resp){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      //db.close();
      var response = [];
      var jsonString;
      var jsonStringDate;
      var jsonStringUsers;
      var jsonStringPercentage;
      var percentage;
      var baseDivisor;
      for(var i=0;i<resp.length;i++){
        jsonString = "";
        jsonStringDate = '"date":"'+resp[i]._id.dt+'"';
        var value = resp[i].val;
        value.sort(SortByDate);
        jsonStringUsers = '"users":[';
        jsonStringPercentage = '"values":[';
        for(j=0;j<value.length;j++){
          if(j===0){baseDivisor = value[j].u}
          jsonStringUsers = jsonStringUsers + value[j].u + ',';
          if(baseDivisor === 0 || value[j].u === 0){
            percentage = 0;
          }
          else{
            percentage = (value[j].u/baseDivisor)*100;
          }
          jsonStringPercentage = jsonStringPercentage + percentage.toFixed(2) + ',';
        }
        jsonStringUsers = jsonStringUsers.substr(0,jsonStringUsers.length-1);
        jsonStringPercentage = jsonStringPercentage.substr(0,jsonStringPercentage.length-1);
        jsonStringUsers = jsonStringUsers + ']';
        jsonStringPercentage = jsonStringPercentage + ']';
        jsonString = '{' + jsonStringDate + ',' + jsonStringUsers + ',' + jsonStringPercentage + '}';
        response.push(JSON.parse(jsonString));
      }
      console.log(response);
      db.close();
      return res.json(response);
    }
  });
};

function SortByDate(x,y) {
  return ((x.dt == y.dt) ? 0 : ((x.dt > y.dt) ? 1 : -1 ));
}
