"use strict";

const mongojs = require('mongojs');
const config  = require('../../config/config');
const logger  = require('../../config/log.js');
const common = require('../../commons/common.js');

module.exports.fetchCohorts = function(req,res){
  const akey = req.query.akey;
  let type = req.query.type;
  //type = 'D';
  type = type.toUpperCase();
  const db = mongojs(config.connectionstring+akey);
  let searchCohort = JSON.parse('{"_id.ty":"'+type+'"}');
  db.collection(config.coll_cohorts).find(searchCohort).sort({"_id.dt":1},function(err,resp){
    db.close();
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      return res.json(JSON.parse('{"msg":"Failure"}'));
    }else{
      //db.close();
      let response = [];
      let jsonString;
      let jsonStringDate;
      let jsonStringUsers;
      let jsonStringPercentage;
      let percentage;
      let baseDivisor;
      for(let i=0;i<resp.length;i++){
        jsonString = "";
        jsonStringDate = '"date":"'+resp[i]._id.dt+'"';
        let value = resp[i].val;
        value.sort(SortByDate);
        jsonStringUsers = '"users":[';
        jsonStringPercentage = '"values":[';
        for(let j=0;j<value.length;j++){
          if(j===0){baseDivisor = value[j].u;}
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
      return res.json(response);
    }
  });
};

function SortByDate(x,y) {
  return ((x.dt == y.dt) ? 0 : ((x.dt > y.dt) ? 1 : -1 ));
}
