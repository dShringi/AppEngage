
var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common');

var dateFormat = require('dateformat');
var moment = require('moment-timezone');
var mongojs = require('mongojs');
var aKey = 'test1234';
//var aKey = process.argv[2];
common.getAppTimeZone(aKey,function(err,appTZ){
  if(err){
    logger.error(common.getErrorMessageFrom(err));
    appTZ = config.defaultAppTimeZone;
  }else{
    console.log(appTZ);
  }
  generateDailyCohorts(appTZ,aKey,function(err,resp){
    console.log("Daily Cohort Generated");
  });
  generateWeeklyCohorts(appTZ,aKey,function(err,resp){
    console.log("Weekly Cohort Generated");
  });
  generateMonthlyCohorts(appTZ,aKey,function(err,resp){
    console.log("Monhtly Cohort Generated");
  });
});

function generateDailyCohorts(appTZ,aKey,callback){
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(endDate.getDate()-50);
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/1000;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/1000;
  var db = mongojs(config.mongodb.url+'/'+aKey);
  db.collection(config.mongodb.coll_cohorts).remove({"_id.ty":"D"},function(err,resp){
    if(!err){
      console.log("Emptied Daily Cohort");
    }else{
      console.log("Some Error emptying Daily Cohort");
    }
  });
  for(i=startDate;i<=endDate;i=i+86400){
    (function(i_dt){
      var d = common.getStartDate(i_dt,appTZ);
      var insertJSON = JSON.parse('{"_id":{"dt":'+d+',"ty":"D"}}');
      db.collection(config.mongodb.coll_cohorts).insert(insertJSON,function(err,doc){
        if(!err){
          console.log("JSON Record Created for ID");
        }
      });
      var startDateUsers = i_dt;
      var endDateUsers = i_dt+86399;
      var searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
      (function(insertedJSON){
        db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
          if(!err){
            if(usersdoc.length!==0){
              for(u=0;u<usersdoc.length;u++){
                console.log(usersdoc[u]._id);
              }
              //console.log(usersdoc);
            }else{
              for(var currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + 86400){
                var upddt = common.getStartDate(currDateEpoch,appTZ);
                var updJSON = JSON.parse('{"$push":{"val":{"'+upddt+'":{"u":0,"p":"0"}}}}');
                db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                  //console.log(doc);
                });
              }
            }
          }
        });
      })(insertJSON);
    })(i);
  }
  callback(null,db);
}

function generateWeeklyCohorts(appTZ,aKey,callback){
  console.log("Reached Weekly");
  var db = mongojs(config.mongodb.url+'/'+aKey);
  callback(null,db);
}

function generateMonthlyCohorts(appTZ,aKey,callback){
  console.log("Reached Monthly");
  var db = mongojs(config.mongodb.url+'/'+aKey);
  callback(null,db);
}


/*
// store the document in a variable
var mongojs = require('mongojs');

var db = mongojs('mongodb://localhost/appengage');
console.log(db);
//var doc = db.collection('coll_apps').findOne({_id: mongojs.ObjectId("57c7a4e8a70c0a2939103acd")});

var doc = JSON.parse('{"_id":1}');
// set a new _id on the document
doc._id = mongojs.ObjectId("4170b44d6459bba992acaa85");
doc.name = "WhatsApp";
// insert the document, using the new _id
db.collection('coll_apps').insert(doc);

// remove the document with the old _id
//db.collection('coll_apps').remove({_id: mongojs.ObjectId("4cc45467c55f4d2d2a000002")});

db.close();
*/
