var Mongoose   = require('mongoose');
var Schema     = Mongoose.Schema;

const Collection = { 
                     "app"            : "coll_app", 
                     "realtime"       : "coll_realtime", 
                     "dashboard"      : "coll_dashboard", 
                     "begin"          : "coll_begins", 
                     "end"            : "coll_ends", 
                     "crash"          : "coll_crashes",
                     "activesessions" : "coll_activesessions"
                   };

// DB Schemas
var appSchema = new Schema({ 
    name : { type: String },
    cty  : { type: String },
    tz   : { type: String },
    ctg  : { type: String }
});

var realtimeSchema = new Schema({
    _id  : { type: Number, required: true },
    val  : { type: String }
});

var dashboardSchema = new Schema({
    _id  : { type: Object, require: true },
    val  : { type: Object }
}, {
    collection : 'coll_dashboard'
});

var beginSchema = new Schema({rtr: {type:Number, required:true},val: {type: Object}});
var endSchema = new Schema({rtr: {type:Number, required:true},val: {type: Object}});
var crashSchema = new Schema({rtr: {type:Number, required:true},val: {type: Object}});
var eventSchema = new Schema({rtr: {type:Number, required:true},val: {type: String}});
var activeSessionSchema = new Schema({
    _id  : { type: String, require: true },
    did  : { type: String },
    sst  : { type: Number },
    lat  : { type: Number },
    dt   : { type: String }
});

// MongoDB Collection
var appCollection = Mongoose.model('coll_app', appSchema);
var realtimeCollection = Mongoose.model('coll_realtime', realtimeSchema);
var dashboardCollection = Mongoose.model('coll_dashboard', dashboardSchema);
var beginCollection = Mongoose.model('coll_begins', beginSchema);
var crashCollection = Mongoose.model('coll_crashes', crashSchema);
var endCollection = Mongoose.model('coll_ends', endSchema);
var eventCollection = Mongoose.model('coll_events', eventSchema);
var activeSessionCollection = Mongoose.model('coll_activesessions', activeSessionSchema);

// Factory to get model based on event type
function eventFactory(){
    this.getEvent = function(_event,nEpoch){
        switch(_event.type){
            case Collection["app"]:
                return new appCollection({
                    name: _event.val.name,
                    cty : _event.val.cty,
                    tz  : _event.val.tz,
                    ctg : _event.val.ctg
                });
            case Collection["realtime"]:
                return new realtimeCollection({
                    _id : nEpoch,
                    val : _event.val
                });
            case Collection["dashboard"]:
                // https://github.com/Automattic/mongoose/issues/3432
                // Mongoose by default reverses the key value pair order
                return new dashboardCollection({
                    _id : {
                        ty  : _event.ty,
                        key : _event.key,
                        dt  : _event.dt
                    },
                    val : {
                        tse : _event.tse,
                        tts : _event.tts,
                        tce : _event.tce,
                        te  : _event.te,
                        tuu : _event.tuu,
                        tnu : _event.tnu
                    }
                });
            case Collection["begin"]:
                return new beginCollection({
                   	rtr : _event.val.rtc,	
			val : _event.val
                });
            case Collection["end"]:
                return new endCollection({
			rtr : _event.val.rtc,
                    	val : _event.val
                });                
            case Collection["crash"]:
                return new crashCollection({
			rtr : _event.val.rtc, 
                    	val : _event.val
                });
            case Collection["activesessions"]:
                return new activeSessionCollection({
                    _id : _event.val.sid,
		    did : _event.val.did,
                    sst : _event.val.rtc,
                    lat : _event.val.rtc,
                    dt  : _event.val.dt
                });
            default:
                logger.error("Invalid event type: "+_event.type)
                return null;
        }
    }
}

module.exports = {
  EventFactory: eventFactory,
  Collection: Collection,
  Begin: beginCollection,
  Dashboard: dashboardCollection    
};
