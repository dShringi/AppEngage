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
                if (err && err.code!==11000) {
                        logger.error(common.getErrorMessageFrom(err));
                        return;
                    }
                });
        }
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

}(screen));

module.exports = screen;
