
var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common');
var dateFormat = require('dateformat');
var moment = require('moment-timezone');
var mongojs = require('mongojs');
//var aKey = 'test1234';
//var aKey = '4170b44d6459bba992acaa857ac5b25d7fac6cc1';
var aKey = process.argv[2];
if(aKey === undefined || aKey === null || aKey === ""){
  console.log("Provide Application Key for processing");
  logger.error(common.getErrorMessageFrom('Application Key Missing for Cohort Population'));
  process.exit();
}else{
  common.getAppTimeZone(aKey,function(err,appTZ){
    if(err){
      logger.error(common.getErrorMessageFrom(err));
      process.exit();
    }else{
      generateDailyCohorts(appTZ,aKey,function(err,resp){
        if(err){
          logger.error(common.getErrorMessageFrom(err));
          process.exit();
        }else{
          console.log("Daily Cohort Generated");
          generateWeeklyCohorts(appTZ,aKey,function(err,resp){
            if(err){
              logger.error(common.getErrorMessageFrom(err));
              process.exit();
            }else{
              console.log("Weekly Cohort Generated");
              generateMonthlyCohorts(appTZ,aKey,function(err,resp){
                //Temporary to delay the exit.
                if(err){
                  logger.error(common.getErrorMessageFrom(err));
                }else{
                 console.log("Monhtly Cohort Generated");
                 process.exit();
                }
              });
            }
          });
        }
      });
    }
  });
}

function generateDailyCohorts(appTZ,aKey,callback){
  //Compute the Start and End Date for the Cohort Generation
  var endDate = new Date();
  var startDate = new Date();
  //Daily Cohort will be generated for next 30 days.
  startDate.setDate(endDate.getDate()-29);
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/1000;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/1000;
  //Creating the mongodb database connection
  var db = mongojs(config.mongodb.url+'/'+aKey);
  //Emptying the Daily Cohort
  db.collection(config.mongodb.coll_cohorts).remove({"_id.ty":"D"},function(err,resp){
    //If the cohort is emptied successfully.
    if(!err){
      //Looping through the 30 days time frame for the cohort preparation.
      for(i=startDate;i<=endDate;i=i+86400){
        //Binding the variable i to the function as i_dt
        (function(i_dt){
          //Converting the epoch format to YYYYMMDD
          var dt = common.getStartDate(i_dt,appTZ);
          var edt = common.getStartDate(endDate,appTZ);
          //Prearing the key for the daily cohort.
          var insertJSON = JSON.parse('{"_id":{"dt":'+dt+',"ty":"D"}}');
          //Binding the prepared JSON for the processing.
          (function(insertedJSON){
            //Inserting the key into the cohort collection.
            db.collection(config.mongodb.coll_cohorts).insert(insertedJSON,function(err,doc){
              if(err){
                logger.error(common.getErrorMessageFrom(err));
              }
            });
            // Taking the current date to check for new users
            var startDateUsers = i_dt;
            var endDateUsers = i_dt+86399;
            //Preparing the JSON for searching the new users.
            var searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
            //Run the query to find if any users logged in 1st time.
            db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
              //if there are no errors
              if(!err){
                //If there are users who joined on that day.
                if(usersdoc.length!==0){
                  // Preparing the user id list of all the users for search operation.
                  var userList='';
                  for(u=0;u<usersdoc.length;u++){
                    userList = userList +'"'+ usersdoc[u]._id+'",';
                  }
                  userList = userList.substr(0,userList.length-1);
                  // Looping through the current processing date till the end
                  for(var currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + 86400){
                    //Converting the epoch time to YYYYMMDD format.
                    var upddt = common.getStartDate(currDateEpoch,appTZ);
                    //extracting YYYY and MMDD for the retrieved date.
                    var year = upddt.toString().substr(0,4);
                    var mmdd = upddt.toString().substr(4,4);
                    //Prearing the search criteria.
                    var searchNewUsers = JSON.parse('{"$and":[{"_id":{"$in":['+userList+']}},{"_'+year+'._id":'+parseInt(mmdd)+'}]}');
                    //Binding the upddt to the function.
                    (function(searchDate){
                      //Execute MongoDB query to find users for the traversed date.
                      db.collection(config.mongodb.coll_users).find(searchNewUsers,function(err,newUsers){
                        //If there are no errors in the query execution.
                        if(!err){
                          // Preparing the update criteria.
                          var updJSON = JSON.parse('{"$push":{"val":{"dt":'+searchDate+',"u":'+newUsers.length+'}}}');
                          //Execute MongoDB Query to push the result.
                          db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                            if(err){
                              logger.error(common.getErrorMessageFrom(err));
                            }else{
                              //console.log('ED_'+endDate);
                              if(parseInt(insertedJSON._id.dt) === edt && parseInt(searchDate) === edt)
                              {
                                setTimeout(function () {
                                  db.close();
                                  callback(null,null);
                                }, 10000);
                              }
                            }
                          });
                        }
                        else{
                          logger.error(common.getErrorMessageFrom(err));
                        }
                      });
                    })(upddt);
                  }
                // If no users joined on that particular day.
                }else{
                  //Looping through the dates
                  for(var currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + 86400){
                    //Converting epoch format to YYYYMMDD format.
                    var upddt = common.getStartDate(currDateEpoch,appTZ);
                    //Preparing the updated JSON.
                    var updJSON = JSON.parse('{"$push":{"val":{"dt":'+upddt+',"u":0}}}');
                    //Inserting into the MongoDB Cohort collection.
                    db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                      //console.log('ED_'+endDate);
                      if(parseInt(insertedJSON._id.dt) === edt && parseInt(upddt) === edt)
                        {
                          setTimeout(function () {
                            db.close();
                            callback(null,null);
                          }, 10000);
                        }
                    });
                  }
                }
              }else{
                logger.error(common.getErrorMessageFrom(err));
              }
            });
          })(insertJSON);
        })(i);
      }
    }else{
      logger.error(common.getErrorMessageFrom(err));
    }
  });
}

function generateWeeklyCohorts(appTZ,aKey,callback){
  //Compute the Start and End Date for the Cohort Generation
  var endDate = new Date();
  var startDate = new Date();
  //Weekly Cohort will be generated for last 25 weeks i.e. 25 * 7 = 175.
  startDate.setDate((endDate.getDate()-196)-endDate.getDay());
  endDate.setDate((endDate.getDate())-endDate.getDay());
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/1000;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/1000;
  //Creating the mongodb database connection
  var db = mongojs(config.mongodb.url+'/'+aKey);
  //Emptying the Weekly Cohort
  db.collection(config.mongodb.coll_cohorts).remove({"_id.ty":"W"},function(err,resp){
    //If the cohort is emptied successfully.
    if(!err){
      //Looping through the 180 days time frame for the cohort preparation.
      for(i=startDate;i<=endDate;i=i+604800){
        //Binding the variable i to the function as i_dt
        (function(i_dt){
          //Converting the epoch format to YYYYMMDD
          var dt = common.getStartWeek(i_dt,appTZ);
          var edt = common.getStartWeek(endDate,appTZ);
          //Prearing the key for the daily cohort.
          var insertJSON = JSON.parse('{"_id":{"dt":'+dt+',"ty":"W"}}');
          //Binding the prepared JSON for the processing.
          (function(insertedJSON){
            //Inserting the key into the cohort collection.
            db.collection(config.mongodb.coll_cohorts).insert(insertedJSON,function(err,doc){
              if(err){
                logger.error(common.getErrorMessageFrom(err));
              }
            });
            // Taking the current date to check for new users
            var startDateUsers = i_dt;
            var endDateUsers = i_dt+604799;
            //Preparing the JSON for searching the new users.
            var searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
            //Run the query to find if any users logged in 1st time.
            db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
              //if there are no errors
              if(!err){
                //If there are users who joined on that day.
                if(usersdoc.length!==0){
                  // Preparing the user id list of all the users for search operation.
                  var userList='';
                  for(u=0;u<usersdoc.length;u++){
                    userList = userList +'"'+ usersdoc[u]._id+'",';
                  }
                  userList = userList.substr(0,userList.length-1);
                  // Looping through the current processing date till the end
                  for(var currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + 604800){
                    //Converting the epoch time to YYYYMMDD format.
                    var updstartdt = common.getStartDate(currDateEpoch,appTZ);
                    var updenddt = common.getStartDate(currDateEpoch+604799,appTZ);
                    //extracting YYYY and MMDD for the retrieved date.
                    var yearstartdt = updstartdt.toString().substr(0,4);
                    var mmddstartdt = updstartdt.toString().substr(4,4);
                    var yearenddt = updenddt.toString().substr(0,4);
                    var mmddenddt = updenddt.toString().substr(4,4);
                    //Prearing the search criteria.
                    var searchNewUsers = JSON.parse('{"$and":[{"_id":{"$in":['+userList+']}},{"_'+yearstartdt+'._id":{"$gte":'+parseInt(mmddstartdt)+'}},{"_'+yearenddt+'._id":{"$lte":'+parseInt(mmddenddt)+'}}]}');
                    //Binding the upddt to the function.
                    (function(searchDate){
                      //Execute MongoDB query to find users for the traversed date.
                      db.collection(config.mongodb.coll_users).find(searchNewUsers,function(err,newUsers){
                        //If there are no errors in the query execution.
                        if(!err){
                          // Preparing the update criteria.
                          var updJSON = JSON.parse('{"$push":{"val":{"dt":'+searchDate+',"u":'+newUsers.length+'}}}');
                          //Execute MongoDB Query to push the result.
                          db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                            if(err){
                              logger.error(common.getErrorMessageFrom(err));
                            }else{
                              //console.log('ED_'+endDate);
                              if(parseInt(insertedJSON._id.dt) === edt && parseInt(searchDate) === edt)
                              {
                                setTimeout(function () {
                                  db.close();
                                  callback(null,null);
                                }, 10000);
                              }
                            }
                          });
                        }
                        else{
                          logger.error(common.getErrorMessageFrom(err));
                        }
                      });
                    })(updstartdt);
                  }
                // If no users joined on that particular day.
                }else{
                  //Looping through the dates
                  for(var currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + 604800){
                    //Converting epoch format to YYYYMMDD format.
                    var updstartdt = common.getStartDate(currDateEpoch,appTZ);
                    //Preparing the updated JSON.
                    var updJSON = JSON.parse('{"$push":{"val":{"dt":'+updstartdt+',"u":0}}}');
                    //Inserting into the MongoDB Cohort collection.
                    db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                      //console.log('ED_'+endDate);
                      if(parseInt(insertedJSON._id.dt) === edt && parseInt(updstartdt) === edt)
                        {
                          setTimeout(function () {
                            db.close();
                            callback(null,null);
                          }, 10000);
                        }
                    });
                  }
                }
              }else{
                logger.error(common.getErrorMessageFrom(err));
              }
            });
          })(insertJSON);
        })(i);
      }
    }else{
      logger.error(common.getErrorMessageFrom(err));
    }
  });
}

function generateMonthlyCohorts(appTZ,aKey,callback){
  //Compute the Start and End Date for the Cohort Generation
  var endDate = new Date();
  var startDate = new Date();
  //Weekly Cohort will be generated for last 25 weeks i.e. 25 * 7 = 175.
  startDate.setDate((endDate.getDate()-365));
  endDate.setDate(endDate.getDate());
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/1000;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/1000;
  //Creating the mongodb database connection
  var db = mongojs(config.mongodb.url+'/'+aKey);
  //Emptying the Weekly Cohort
  db.collection(config.mongodb.coll_cohorts).remove({"_id.ty":"Y"},function(err,resp){
    //If the cohort is emptied successfully.
    if(!err){
      //Looping through the 365 days time frame for the cohort preparation.
      for(i=startDate;i<=(endDate+2678400);i=i+2678400){
        //Binding the variable i to the function as i_dt
        (function(i_dt){
          //Converting the epoch format to YYYYMMDD
          var dt = common.getStartMonth(i_dt,appTZ);
          var edt = common.getStartMonth(endDate,appTZ);
          console.log("edt" + edt);
          //Prearing the key for the daily cohort.
          var insertJSON = JSON.parse('{"_id":{"dt":'+dt+',"ty":"Y"}}');
          console.log(JSON.stringify(insertJSON));
          //Binding the prepared JSON for the processing.
          (function(insertedJSON){
            //Inserting the key into the cohort collection.
            db.collection(config.mongodb.coll_cohorts).insert(insertedJSON,function(err,doc){
              if(err){
                logger.error(common.getErrorMessageFrom(err));
              }
            });
            // Taking the current date to check for new users
            var startDateUsers = i_dt;
            var endDateUsers = i_dt+2678399;
            //Preparing the JSON for searching the new users.
            var searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
            //Run the query to find if any users logged in 1st time.
            db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
              //if there are no errors
              if(!err){
                //If there are users who joined on that day.
                if(usersdoc.length!==0){
                  // Preparing the user id list of all the users for search operation.
                  var userList='';
                  for(u=0;u<usersdoc.length;u++){
                    userList = userList +'"'+ usersdoc[u]._id+'",';
                  }
                  userList = userList.substr(0,userList.length-1);
                  // Looping through the current processing date till the end
                  for(var currDateEpoch = i_dt;currDateEpoch<=(endDate+2678400);currDateEpoch = currDateEpoch + 2678400){
                    //Converting the epoch time to YYYYMMDD format.
                    var updstartdt = common.getStartMonth(currDateEpoch,appTZ);
                    var updenddt = common.getStartMonth(currDateEpoch+2678399,appTZ);
                    console.log(updstartdt + '__' +updenddt);
                    //extracting YYYY and MMDD for the retrieved date.
                    var yearstartdt = updstartdt.toString().substr(0,4);
                    var mmddstartdt = updstartdt.toString().substr(4,4);
                    var yearenddt = updenddt.toString().substr(0,4);
                    var mmddenddt = updenddt.toString().substr(4,4);
                    //Prearing the search criteria.
                    var searchNewUsers = JSON.parse('{"$and":[{"_id":{"$in":['+userList+']}},{"_'+yearstartdt+'._id":{"$gte":'+parseInt(mmddstartdt)+'}},{"_'+yearenddt+'._id":{"$lte":'+parseInt(mmddenddt)+'}}]}');
                    //Binding the upddt to the function.
                    (function(searchDate){
                      //Execute MongoDB query to find users for the traversed date.
                      db.collection(config.mongodb.coll_users).find(searchNewUsers,function(err,newUsers){
                        //If there are no errors in the query execution.
                        if(!err){
                          // Preparing the update criteria.
                          var updJSON = JSON.parse('{"$push":{"val":{"dt":'+searchDate+',"u":'+newUsers.length+'}}}');
                          //Execute MongoDB Query to push the result.
                          db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                            if(err){
                              logger.error(common.getErrorMessageFrom(err));
                            }else{
                              //console.log('ED_'+endDate);
                              if(parseInt(insertedJSON._id.dt) === edt && parseInt(searchDate) === edt)
                              {
                                setTimeout(function () {
                                  db.close();
                                  callback(null,null);
                                }, 20000);
                              }
                            }
                          });
                        }
                        else{
                          logger.error(common.getErrorMessageFrom(err));
                        }
                      });
                    })(updstartdt);
                  }
                // If no users joined on that particular day.
                }else{
                  //Looping through the dates
                  for(var currDateEpoch = i_dt;currDateEpoch<=(endDate+2678400);currDateEpoch = currDateEpoch + 2678400){
                    //Converting epoch format to YYYYMMDD format.
                    var updstartdt = common.getStartMonth(currDateEpoch,appTZ);
                    console.log(updstartdt);
                    //Preparing the updated JSON.
                    var updJSON = JSON.parse('{"$push":{"val":{"dt":'+updstartdt+',"u":0}}}');
                    //Inserting into the MongoDB Cohort collection.
                    db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                      //console.log('ED_'+endDate);
                      if(parseInt(insertedJSON._id.dt) === edt && parseInt(updstartdt) === edt)
                        {
                          setTimeout(function () {
                            db.close();
                            callback(null,null);
                          }, 20000);
                        }
                    });
                  }
                }
              }else{
                logger.error(common.getErrorMessageFrom(err));
              }
            });
          })(insertJSON);
        })(i);
      }
    }else{
      logger.error(common.getErrorMessageFrom(err));
    }
  });
}
