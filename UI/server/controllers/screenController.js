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
  const dt = (req.query.type==='Tablet') ? 'T':'S';
  const pf = (req.query.platform==='Android') ? 'A':'iOS';
  const db = mongojs(config.connectionstring+aKey);

  common.getAppTimeZone(aKey,function(err,appTZ){

    const startDate = common.getStartDate(startDateEpoch,appTZ);
    const endDate = common.getStartDate(endDateEpoch,appTZ);

    db.collection(config.coll_screennames).find(JSON.parse('{"_id.dt":'+dt+',"_id.pf":'+pf+'}'),function(err,screennames){
      console.log(screennames);
      db.collection(config.coll_screenmetrics).find([
      {$match:{$and:[{"_id.key":{$gte:startDate}},{"_id.key":{$lte:endDate}},{"_id.dt":dt},{"_id.pf":pf}]}},
      {$group:{_id:"$_id.act",ts:{$sum:"$val.tse"},noc:{$sum:"$val.tce"},tts:{$sum:"$val.tts"}}}
        ],function(err,resp){
          db.close();
          if(!err){
            console.log(resp);
            //return res.json(JSON.parse('{"msg":"success"}'));
            let response = '[{"name": "app1","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img1.jpg","alt": "app1","nuu": 13,"noc": 5,"tts": 300,"ts": 430},' +
                             '{"name": "app2","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img2.jpg","alt": "app2","nuu": 23,"noc": 50,"tts": 500,"ts": 830},' +
                             '{"name": "app2","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img3.jpg","alt": "app2","nuu": 33,"noc": 20,"tts": 700,"ts": 338}' +
                             ']';
            return res.json(JSON.parse(response));

          }else{
            logger.error(common.getErrorMessageFrom(err));
            //return res.json(JSON.parse('{"msg":"failure"}'));
          }
      });
    });
  });


let response = '[{"name": "app1","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img1.jpg","alt": "app1","nuu": 13,"noc": 5,"tts": 300,"ts": 430},' +
                 '{"name": "app2","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img2.jpg","alt": "app2","nuu": 23,"noc": 50,"tts": 500,"ts": 830},' +
                 '{"name": "app2","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img3.jpg","alt": "app2","nuu": 33,"noc": 20,"tts": 700,"ts": 338}' +
                 ']';
return res.json(JSON.parse(response));
};
