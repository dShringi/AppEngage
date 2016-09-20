
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
  var searchUsers;
  var startDateUsers;
  var endDateUsers;
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(endDate.getDate()-50);
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/1000;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/1000;
  console.log(startDate);
  var db = mongojs(config.mongodb.url+'/'+aKey);
  for(i=startDate;i<=endDate;i=i+86400){
    var d = common.getStartDate(i,appTZ);
    startDateUsers = i;
    endDateUsers = i+86399;
    //console.log(startDateUsers + '__' + endDateUsers);
    //console.log('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
    searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
    db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
      console.log("Daily");
      if(!err){
        console.log(usersdoc);
        console.log(usersdoc.length);
      }
    });
    console.log(d);
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
