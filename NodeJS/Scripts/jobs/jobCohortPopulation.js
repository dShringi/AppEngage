"use strict";

let logger = require('../conf/log.js');
let config = require('../conf/config.js');
let common = require('../commons/common');
let dateFormat = require('dateformat');
let moment = require('moment-timezone');
let mongojs = require('mongojs');

const timeoutInterval = 20000;
const numWeeks = 29*7;
const numDays = 29;
const numYears = 365;
const thousand = 1000;
const epochSecondsForDay = 86400;
const epochSecondsForWeek = 604800;
const aKey = process.argv[2];

if(aKey === config.object.UNDEFINED || aKey === config.object.NULL || aKey === config.object.EMPTYSTRING){
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
          generateWeeklyCohorts(appTZ,aKey,function(err,resp){
            if(err){
              logger.error(common.getErrorMessageFrom(err));
              process.exit();
            }else{
              generateMonthlyCohorts(appTZ,aKey,function(err,resp){
                if(err){
                  logger.error(common.getErrorMessageFrom(err));
                }else{
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
  let endDate = new Date();
  let startDate = new Date();
  //Daily Cohort will be generated for next 30 days.
  startDate.setDate(endDate.getDate()-numDays);
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/thousand;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/thousand;
  //Creating the mongodb database connection
  const db = mongojs(config.mongodb.url+'/'+aKey);
  //Emptying the Daily Cohort
  db.collection(config.mongodb.coll_cohorts).remove({"_id.ty":"D"},function(err,resp){
    //If the cohort is emptied successfully.
    if(!err){
      //Looping through the 30 days time frame for the cohort preparation.
      for(let i=startDate;i<=endDate;i=i+epochSecondsForDay){
        //Binding the variable i to the function as i_dt
        (function(i_dt){
          //Converting the epoch format to YYYYMMDD
          let dt = common.getStartDate(i_dt,appTZ);
          let edt = common.getStartDate(endDate,appTZ);
          //Prearing the key for the daily cohort.
          let insertJSON = JSON.parse('{"_id":{"dt":'+dt+',"ty":"D"}}');
          //Binding the prepared JSON for the processing.
          (function(insertedJSON){
            //Inserting the key into the cohort collection.
            db.collection(config.mongodb.coll_cohorts).insert(insertedJSON,function(err,doc){
              if(err){
                logger.error(common.getErrorMessageFrom(err));
              }
            });
            // Taking the current date to check for new users
            let startDateUsers = i_dt;
            let endDateUsers = i_dt+(epochSecondsForDay-1);
            //Preparing the JSON for searching the new users.
            let searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
            //Run the query to find if any users logged in 1st time.
            db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
              //if there are no errors
              if(!err){
                //If there are users who joined on that day.
                if(usersdoc.length!==0){
                  // Preparing the user id list of all the users for search operation.
                  let userList='';
                  for(let u=0;u<usersdoc.length;u++){
                    userList = userList +'"'+ usersdoc[u]._id+'",';
                  }
                  userList = userList.substr(0,userList.length-1);
                  // Looping through the current processing date till the end
                  for(let currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + epochSecondsForDay){
                    //Converting the epoch time to YYYYMMDD format.
                    let upddt = common.getStartDate(currDateEpoch,appTZ);
                    //extracting YYYY and MMDD for the retrieved date.
                    let year = upddt.toString().substr(0,4);
                    let mmdd = upddt.toString().substr(4,4);
                    //Prearing the search criteria.
                    let searchNewUsers = JSON.parse('{"$and":[{"_id":{"$in":['+userList+']}},{"_'+year+'._id":'+parseInt(mmdd)+'}]}');
                    //Binding the upddt to the function.
                    (function(searchDate){
                      //Execute MongoDB query to find users for the traversed date.
                      db.collection(config.mongodb.coll_users).find(searchNewUsers,function(err,newUsers){
                        //If there are no errors in the query execution.
                        if(!err){
                          // Preparing the update criteria.
                          let updJSON = JSON.parse('{"$push":{"val":{"dt":'+searchDate+',"u":'+newUsers.length+'}}}');
                          //Execute MongoDB Query to push the result.
                          db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                            if(err){
                              logger.error(common.getErrorMessageFrom(err));
                            }else{
                              if(parseInt(insertedJSON._id.dt) === edt && parseInt(searchDate) === edt)
                              {
                                setTimeout(function () {
                                  db.close();
                                  callback(config.object.NULL,config.object.NULL);
                                }, timeoutInterval);
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
                  for(let currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + epochSecondsForDay){
                    //Converting epoch format to YYYYMMDD format.
                    let upddt = common.getStartDate(currDateEpoch,appTZ);
                    //Preparing the updated JSON.
                    let updJSON = JSON.parse('{"$push":{"val":{"dt":'+upddt+',"u":0}}}');
                    //Inserting into the MongoDB Cohort collection.
                    db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                      if(parseInt(insertedJSON._id.dt) === edt && parseInt(upddt) === edt)
                        {
                          setTimeout(function () {
                            db.close();
                            callback(config.object.NULL,config.object.NULL);
                          }, timeoutInterval);
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
  let endDate = new Date();
  let startDate = new Date();
  //Weekly Cohort will be generated for last 25 weeks i.e. 25 * 7 = 175.
  startDate.setDate((endDate.getDate()-numWeeks)-endDate.getDay());
  endDate.setDate((endDate.getDate())-endDate.getDay());
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/thousand;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/thousand;
  //Creating the mongodb database connection
  const db = mongojs(config.mongodb.url+'/'+aKey);
  //Emptying the Weekly Cohort
  db.collection(config.mongodb.coll_cohorts).remove({"_id.ty":"W"},function(err,resp){
    //If the cohort is emptied successfully.
    if(!err){
      //Looping through the 180 days time frame for the cohort preparation.
      for(let i=startDate;i<=endDate;i=i+epochSecondsForWeek){
        //Binding the variable i to the function as i_dt
        (function(i_dt){
          //Converting the epoch format to YYYYMMDD
          let dt = common.getStartWeek(i_dt,appTZ);
          let edt = common.getStartWeek(endDate,appTZ);
          //Prearing the key for the daily cohort.
          let insertJSON = JSON.parse('{"_id":{"dt":'+dt+',"ty":"W"}}');
          //Binding the prepared JSON for the processing.
          (function(insertedJSON){
            //Inserting the key into the cohort collection.
            db.collection(config.mongodb.coll_cohorts).insert(insertedJSON,function(err,doc){
              if(err){
                logger.error(common.getErrorMessageFrom(err));
              }
            });
            // Taking the current date to check for new users
            let startDateUsers = i_dt;
            let endDateUsers = i_dt+(epochSecondsForWeek-1);
            //Preparing the JSON for searching the new users.
            let searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
            //Run the query to find if any users logged in 1st time.
            db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
              //if there are no errors
              if(!err){
                //If there are users who joined on that day.
                if(usersdoc.length!==0){
                  // Preparing the user id list of all the users for search operation.
                  let userList='';
                  for(let u=0;u<usersdoc.length;u++){
                    userList = userList +'"'+ usersdoc[u]._id+'",';
                  }
                  userList = userList.substr(0,userList.length-1);
                  // Looping through the current processing date till the end
                  for(let currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + epochSecondsForWeek){
                    //Converting the epoch time to YYYYMMDD format.
                    let updstartdt = common.getStartDate(currDateEpoch,appTZ);
                    let updenddt = common.getStartDate(currDateEpoch+(epochSecondsForWeek-1),appTZ);
                    //extracting YYYY and MMDD for the retrieved date.
                    let yearstartdt = updstartdt.toString().substr(0,4);
                    let mmddstartdt = updstartdt.toString().substr(4,4);
                    let yearenddt = updenddt.toString().substr(0,4);
                    let mmddenddt = updenddt.toString().substr(4,4);
                    //Prearing the search criteria.
                    let searchNewUsers = JSON.parse('{"$and":[{"_id":{"$in":['+userList+']}},{"_'+yearstartdt+'._id":{"$gte":'+parseInt(mmddstartdt)+'}},{"_'+yearenddt+'._id":{"$lte":'+parseInt(mmddenddt)+'}}]}');
                    //Binding the upddt to the function.
                    (function(searchDate){
                      //Execute MongoDB query to find users for the traversed date.
                      db.collection(config.mongodb.coll_users).find(searchNewUsers,function(err,newUsers){
                        //If there are no errors in the query execution.
                        if(!err){
                          // Preparing the update criteria.
                          let updJSON = JSON.parse('{"$push":{"val":{"dt":'+searchDate+',"u":'+newUsers.length+'}}}');
                          //Execute MongoDB Query to push the result.
                          db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                            if(err){
                              logger.error(common.getErrorMessageFrom(err));
                            }else{
                              if(parseInt(insertedJSON._id.dt) === edt && parseInt(searchDate) === edt)
                              {
                                setTimeout(function () {
                                  db.close();
                                  callback(config.object.NULL,config.object.NULL);
                                }, timeoutInterval);
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
                  for(let currDateEpoch = i_dt;currDateEpoch<=endDate;currDateEpoch = currDateEpoch + epochSecondsForWeek){
                    //Converting epoch format to YYYYMMDD format.
                    let updstartdt = common.getStartDate(currDateEpoch,appTZ);
                    //Preparing the updated JSON.
                    let updJSON = JSON.parse('{"$push":{"val":{"dt":'+updstartdt+',"u":0}}}');
                    //Inserting into the MongoDB Cohort collection.
                    db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                      if(parseInt(insertedJSON._id.dt) === edt && parseInt(updstartdt) === edt)
                        {
                          setTimeout(function () {
                            db.close();
                            callback(config.object.NULL,config.object.NULL);
                          }, timeoutInterval);
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
  let endDate = new Date();
  let startDate = new Date();
  //Weekly Cohort will be generated for last 25 weeks i.e. 25 * 7 = 175.
  startDate.setDate((endDate.getDate()-numYears));
  startDate.setMonth(startDate.getMonth(),1);
  endDate.setDate(endDate.getDate());
  endDate.setMonth(endDate.getMonth(),1);
  startDate = Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),0,0,0)/thousand;
  endDate = Date.UTC(endDate.getUTCFullYear(),endDate.getUTCMonth(), endDate.getUTCDate(),0,0,0)/thousand;
  //Creating the mongodb database connection
  const db = mongojs(config.mongodb.url+'/'+aKey);
  //Emptying the Weekly Cohort
  db.collection(config.mongodb.coll_cohorts).remove({"_id.ty":"M"},function(err,resp){
    //If the cohort is emptied successfully.
    if(!err){
      //Looping through the 365 days time frame for the cohort preparation.
      for(var i=startDate;i<=endDate;){
        //Binding the variable i to the function as i_dt
        (function(i_dt){
          //Converting the epoch format to YYYYMMDD
          let dt = common.getStartMonth(i_dt,appTZ);
          let edt = common.getStartMonth(endDate,appTZ);
          //Prearing the key for the daily cohort.
          let insertJSON = JSON.parse('{"_id":{"dt":'+dt+',"ty":"M"}}');
          //Binding the prepared JSON for the processing.
          (function(insertedJSON){
            //Inserting the key into the cohort collection.
            db.collection(config.mongodb.coll_cohorts).insert(insertedJSON,function(err,doc){
              if(err){
                logger.error(common.getErrorMessageFrom(err));
              }
            });
            // Taking the current date to check for new users
            let startDateUsers = i_dt;
            let tmpstartDateUsers = new Date(startDateUsers*thousand);
            let endDateUsers = i_dt+(getEpochSeconds(tmpstartDateUsers.getYear(),tmpstartDateUsers.getMonth()+1)*(epochSecondsForDay-1));
            //Preparing the JSON for searching the new users.
            let searchUsers = JSON.parse('{"$and":[{"flog":{"$gte":'+startDateUsers+'}},{"flog":{"$lte":'+endDateUsers+'}}]}');
            //Run the query to find if any users logged in 1st time.
            db.collection(config.mongodb.coll_users).find(searchUsers,function(err,usersdoc){
              //if there are no errors
              if(!err){
                //If there are users who joined on that day.
                if(usersdoc.length!==0){
                  // Preparing the user id list of all the users for search operation.
                  let userList='';
                  for(let u=0;u<usersdoc.length;u++){
                    userList = userList +'"'+ usersdoc[u]._id+'",';
                  }
                  userList = userList.substr(0,userList.length-1);
                  // Looping through the current processing date till the end
                  for(let currDateEpoch = i_dt;currDateEpoch<=endDate;){
                    //Converting the epoch time to YYYYMMDD format.
                    let updstartdt = common.getStartMonth(currDateEpoch,appTZ);
                    let tmp_epoch = new Date(currDateEpoch*thousand);
                    let updenddt = common.getStartMonth(currDateEpoch+(getEpochSeconds(tmp_epoch.getYear(),tmp_epoch.getMonth()+1)*(epochSecondsForDay-1)),appTZ);
                    //extracting YYYY and MMDD for the retrieved date.
                    let yearstartdt = updstartdt.toString().substr(0,4);
                    let mmddstartdt = updstartdt.toString().substr(4,4);
                    let yearenddt = updenddt.toString().substr(0,4);
                    let mmddenddt = updenddt.toString().substr(4,4);
                    //Prearing the search criteria.
                    let searchNewUsers = JSON.parse('{"$and":[{"_id":{"$in":['+userList+']}},{"_'+yearstartdt+'._id":{"$gte":'+parseInt(mmddstartdt)+'}},{"_'+yearenddt+'._id":{"$lte":'+parseInt(mmddenddt)+'}}]}');
                    //Binding the upddt to the function.
                    (function(searchDate){
                      //Execute MongoDB query to find users for the traversed date.
                      db.collection(config.mongodb.coll_users).find(searchNewUsers,function(err,newUsers){
                        //If there are no errors in the query execution.
                        if(!err){
                          // Preparing the update criteria.
                          let updJSON = JSON.parse('{"$push":{"val":{"dt":'+searchDate+',"u":'+newUsers.length+'}}}');
                          //Execute MongoDB Query to push the result.
                          db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                            if(err){
                              logger.error(common.getErrorMessageFrom(err));
                            }else{
                              if(parseInt(insertedJSON._id.dt) === edt && parseInt(searchDate) === edt)
                              {
                                setTimeout(function () {
                                  db.close();
                                  callback(config.object.NULL,config.object.NULL);
                                }, timeoutInterval);
                              }
                            }
                          });
                        }
                        else{
                          logger.error(common.getErrorMessageFrom(err));
                        }
                      });
                    })(updstartdt);
                    let currDateEpoch_tmp = new Date(currDateEpoch*thousand);
                    currDateEpoch = currDateEpoch +(getEpochSeconds(currDateEpoch_tmp.getYear(),currDateEpoch_tmp.getMonth()+1)*epochSecondsForDay);
                  }
                // If no users joined on that particular day.
                }else{
                  //Looping through the dates
                  for(let currDateEpoch = i_dt;currDateEpoch<=endDate;){
                    //Converting epoch format to YYYYMMDD format.
                    let updstartdt = common.getStartMonth(currDateEpoch,appTZ);
                    //Preparing the updated JSON.
                    let updJSON = JSON.parse('{"$push":{"val":{"dt":'+updstartdt+',"u":0}}}');
                    //Inserting into the MongoDB Cohort collection.
                    db.collection(config.mongodb.coll_cohorts).update(insertedJSON,updJSON,{upsert:true},function(err,doc){
                      if(parseInt(insertedJSON._id.dt) === edt && parseInt(updstartdt) === edt)
                        {
                          setTimeout(function () {
                            db.close();
                            callback(config.object.NULL,config.object.NULL);
                          }, timeoutInterval);
                        }
                    });
                    let currDateEpoch_tmp = new Date(currDateEpoch*thousand);
                    currDateEpoch = currDateEpoch +(getEpochSeconds(currDateEpoch_tmp.getYear(),currDateEpoch_tmp.getMonth()+1)*epochSecondsForDay);
                  }
                }
              }else{
                logger.error(common.getErrorMessageFrom(err));
              }
            });
          })(insertJSON);
        })(i);
        let i_tmp = new Date(i*thousand);
        i = i +(getEpochSeconds(i_tmp.getYear(),i_tmp.getMonth()+1)*epochSecondsForDay);
      }
    }else{
      logger.error(common.getErrorMessageFrom(err));
    }
  });
}

function getEpochSeconds(year,month){
  return new Date(year, month, 0).getDate();
};
