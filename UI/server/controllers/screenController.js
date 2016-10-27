//http://52.206.121.100/appengage/fetchScreenStats?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1&ed=1477472283&sd=1474966683&type=Tablet
"use strict";

const mongojs = require('mongojs');
const config  = require('../../config/config');
const logger  = require('../../config/log.js');
const common = require('../../commons/common.js');

function getUniqiueUsers(status,screenName,startYYYY,endYYYY,startMMDD,endMMDD,db,dt,pf,callback){
  let matchOperator;
  if(status === 0){
    matchOperator = JSON.parse('{"$and":[{"'+screenName+'._'+startYYYY+'._id":{"$gte":'+startMMDD+'}},{"'+screenName+'._'+startYYYY+'._id":{"$lte":'+endMMDD+'}},{"dt":"'+dt+'"},{"pf":"'+pf+'"}]}');
  }
  else{
    matchOperator = JSON.parse('{"$and":[{"$or":[{"'+screenName+'._'+startYYYY+'._id":{"$gte":'+startMMDD+'}},{"'+screenName+'._'+endYYYY+'._id":{"$lte":'+endMMDD+'}}]},{"dt":"'+dt+'"},{"pf":"'+pf+'"}]}');
  }

  db.collection(config.coll_userscreens).aggregate([
    {$match: matchOperator},
    {$group:{_id:"Total",total:{$sum:1}}}
    ],function(err,resp){
      if(!err)
        if(resp.length === 0)
          callback(null,0);
        else
          callback(null,resp[0].total);
      else{
        logger.error(common.getErrorMessageFrom(err));
        callback(err,0);
      }
    });
}

module.exports.fetchScreenStats = function(req,res){

  const startDateEpoch = req.query.sd;
  const endDateEpoch = req.query.ed;
  const aKey = req.query.akey;
  const dt = (req.query.type==='Tablet' || req.query.type==='tablet' || req.query.type===undefined) ? "T":"S";
  const pf = (req.query.platform==='Android' || req.query.platform==='android' || req.query.platform===undefined) ? "A":"iOS";
  const db = mongojs(config.connectionstring+aKey);

  common.getAppTimeZone(aKey,function(err,appTZ){

    const startDate = common.getStartDate(startDateEpoch,appTZ);
    const endDate = common.getStartDate(endDateEpoch,appTZ);
    const startYYYY = startDate.toString().substr(0, 4);
    const endYYYY = endDate.toString().substr(0,4);
    const startMMDD = parseInt(startDate.toString().substr(4,4));
    const endMMDD = parseInt(endDate.toString().substr(4,4));
    const status = (startYYYY === endYYYY) ? 0:1;

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
            nuu : 0
          };
        }

        db.collection(config.coll_screenmetrics).aggregate([
        {$match:{$and:[{"_id.key":{$gte:startDate}},{"_id.key":{$lte:endDate}},{"_id.dt":dt},{"_id.pf":pf}]}},
        {$group:{_id:"$_id.act",ts:{$sum:"$val.tse"},noc:{$sum:"$val.tce"},tts:{$sum:"$val.tts"}}}
          ],function(err,resp){
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

              var onComplete = function(response) {
                db.close();
                return res.json(response);
              };

              let tasksToGo = screennames.length;
              let response = [];
              if (tasksToGo === 0) {
                onComplete(response);
              }else{
                screennames.forEach(function(key){
                  getUniqiueUsers(status,key._id.aname,startYYYY,endYYYY,startMMDD,endMMDD,db,dt,pf,function(err,result){
                    jsonResponse[key._id.aname].nuu = result;
                    if(!err){
                      response[tasksToGo-1] = jsonResponse[key._id.aname];
                      console.log(response);
                      if (--tasksToGo === 0) {
                        onComplete(response);
                      }
                    }else{
                      tasksToGo = tasksToGo - 1;
                      logger.error(common.getErrorMessageFrom(err));
                    }
                  });
                });
              }
            }else{
              db.close();
              logger.error(common.getErrorMessageFrom(err));
              return res.json(JSON.parse('[]'));
            }
        });
      }else{
              db.close();
              if(err)
                logger.error(common.getErrorMessageFrom(err));
              return res.json(JSON.parse('[]'));
      }
    });
  });
};
