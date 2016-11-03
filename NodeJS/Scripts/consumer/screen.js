"use strict";

var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common.js');

var screen = {};

(function(screen){

    screen.populateUniqueNames = function(Model,activities,callback) {
        for(let i=0;i<activities.length;i++){
            Model.ScreenNames.findOneAndUpdate({_id:activities[i].key},{_id:activities[i].key},{upsert:true},function(err,doc){
                if(err){
                    //console.log(err);
                    logger.error(common.getErrorMessageFrom(err));
                    callback(err,config.NULL);
                }else{
                    callback(config.NULL,'success');
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
