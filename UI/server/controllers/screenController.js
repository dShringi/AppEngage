//http://52.206.121.100/appengage/fetchScreenStats?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1&ed=1477472283&sd=1474966683&type=Tablet
"use strict";

const mongojs = require('mongojs');
const config  = require('../../config/config');
const logger  = require('../../config/log.js');
const common = require('../../commons/common.js');

module.exports.fetchScreenStats = function(req,res){

  const startDateEpoch = req.query.sd;
  const endDateEpoch = req.query.ed;
  const aKey = req.query.akey;
  const dt = (req.query.type==='Tablet') ? "T":"S";
  const pf = (req.query.platform==='Android') ? "A":"iOS";
  const db = mongojs(config.connectionstring+aKey);

  common.getAppTimeZone(aKey,function(err,appTZ){

    const startDate = common.getStartDate(startDateEpoch,appTZ);
    const endDate = common.getStartDate(endDateEpoch,appTZ);

    db.collection(config.coll_screennames).find(JSON.parse('{"_id.dt":"'+dt+'","_id.pf":"'+pf+'"}'),function(err,screennames){
      if(screennames.length!==0 && !err){
        let jsonResponse = [];
        for(let i=0;i<screennames.length;i++){
          jsonResponse[screennames[i]._id.aname] ={
            alt : screennames[i]._id.aname,
            name : screennames[i].name,
            path : screennames[i].path,
            ts : 0,
            noc : 0,
            tts : 0,
            nuu : 10
          };
        }

        db.collection(config.coll_screenmetrics).aggregate([
        {$match:{$and:[{"_id.key":{$gte:startDate}},{"_id.key":{$lte:endDate}},{"_id.dt":dt},{"_id.pf":pf}]}},
        {$group:{_id:"$_id.act",ts:{$sum:"$val.tse"},noc:{$sum:"$val.tce"},tts:{$sum:"$val.tts"}}}
          ],function(err,resp){
            db.close();
            if(!err){
              for(let j=0;j<resp.length;j++){
                jsonResponse[resp[j]._id] ={
                  ts : resp[j].ts,
                  noc : resp[j].noc,
                  tts : resp[j].tts,
                  nuu : 10,
                  alt : jsonResponse[resp[j]._id].alt,
                  name : jsonResponse[resp[j]._id].name,
                  path : jsonResponse[resp[j]._id].path,
                };
              }

              let response = [];
              for(let k=0;k<screennames.length;k++){
                response[k] = jsonResponse[screennames[k]._id.aname];
              }

              return res.json(response);
            }else{
              logger.error(common.getErrorMessageFrom(err));
              return res.json(JSON.parse('[]'));
            }
        });
      }else{
              if(err)
              logger.error(common.getErrorMessageFrom(err));
              return res.json(JSON.parse('[]'));
      }
    });
  });
};
