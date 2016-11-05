"use strict";

var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common.js');
var Model = require('../models/analyticEvent');
var Collection = Model.Collection;
var EventFactory = new Model.EventFactory();
var screen = {};

(function(screen){

    screen.populateUniqueNames = function(Model,data,callback) {
        data.type = Collection["screennames"];
        for(let i=0;i<data.act.length;i++){
            //let key = JSON.parse('{"_id":{"aname":"'+data.act[i].key+'","pf":"'+data.pf+'","dt":"'+data.dt+'"}}');
            data.activity = JSON.parse('{"aname":"'+data.act[i].key+'","pf":"'+data.pf+'","dt":"'+data.dt+'"}');

            let event = EventFactory.getEvent(data);
            event.save(function (err) {
                //11000 is the err code for duplicate record. Here we are handling duplicate error as its an expected error.
                if (err && err.code!==11000) {
                        logger.error(common.getErrorMessageFrom(err));
                        return;
                    }
                });
        }
        callback(config.NULL,'success');
    };

    screen.populateMetrics = function(Model,data,appTZ,callback){
        let date = common.getStartDate(data.rtc,appTZ);
        for(let i=0;i<data.act.length;i++){
            let id = {key : date, dt : data.dt ,pf : data.pf,act : data.act[i].key};
            Model.ScreenMetrics.findByIdAndUpdate(id,{$inc:{'val.tse':parseInt('1'),'val.tts':parseInt(data.act[i].ts),'val.tce':parseInt('0')}},{upsert:true},function(err,doc){
                if(err){
                    logger.error(common.getErrorMessageFrom(err));
                    callback(err,config.NULL);
                }else{
                    callback(config.NULL,'success');
                }
            });
        }
    };

    screen.populateUserScreens = function(Model,data,appTZ,callback){
        let date = common.getStartDate(data.rtc,appTZ);
        let yyyy    =   parseInt(date.toString().substring(0,4));
        let mm  =   parseInt(date.toString().substring(4,6));
        let dd  =   date.toString().substring(6,8);
        let did =   data.did;
        Model.UserScreens.findByIdAndUpdate(did,{$set:{pf:data.pf,dt:data.dt}},{upsert:true},function(err,doc){
            if(err){
                logger.error(common.getErrorMessageFrom(err));
                callback(err,config.NULL);
            }else{
                for(let i=0;i<data.act.length;i++){
                    let key = data.act[i].key;
                    let tts = data.act[i].ts;
                    let updateEventsDoc = JSON.parse('{"$inc":{"'+key+'._'+yyyy+'.$.tse":1,"_'+key+'._'+yyyy+'.$.tts":'+tts+'}}');
                    let searchEventsDoc = JSON.parse('{"_id":"'+did+'","'+key+'._'+yyyy+'._id":'+parseInt(mm.toString().concat(dd))+'}');
                    //Update the counters for the user against the respective date for the key.
                    Model.UserScreens.findOneAndUpdate(searchEventsDoc,updateEventsDoc,function(err,doc){
                        //If none of the document gets updated.
                        if(doc===config.object.NULL || doc===config.object.UNDEFINED){
                            // If there are no errors
                            if(!err){
                                let push = {};
                                push[key+'._'+yyyy] = JSON.parse('{"_id":'+parseInt(mm.toString().concat(dd))+',"tse":1,"tts":'+tts+'}');
                                //Against the user add the counters for data which he has performed a login.
                                Model.UserScreens.findByIdAndUpdate(did,{$push:push},function(err,doc){
                                    if(err){
                                        logger.error(common.getErrorMessageFrom(err));
                                        return;
                                    }
                                });
                            }else{
                                logger.error(common.getErrorMessageFrom(err));
                                return;
                            }
                        }else{
                            callback(err,0);
                            return;
                        }
                    });
                }
            }
        });
    };


}(screen));

module.exports = screen;
