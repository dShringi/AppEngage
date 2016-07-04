var Mongoose   = require('mongoose');
var Schema     = Mongoose.Schema;

const Collection = { 
                     "app"            : "coll_app", 
                     "realtime"       : "coll_realtime", 
                     "dashboard"      : "coll_dashboard", 
                     "begin"          : "coll_begins", 
                     "end"            : "coll_ends", 
                     "begin"          : "coll_crashes",
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
    _id  : { type: String, require: true },
    val  : { type: String }
});
var beginSchema = new Schema({val: {type: Object}});
var endSchema = new Schema({val: {type: Object}});
var crashSchema = new Schema({val: {type: Object}});
var eventSchema = new Schema({val: {type: String}});
var activeSessionSchema = new Schema({
    _id  : { type: String, require: true },
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
    this.getEvent = function(_event){
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
                    _id : Date.now(),
                    val : _event.val
                });
            case Collection["dashboard"]:
                return new dashboardCollection({
                    _id : _event.id,
                    val : _event.val
                });
            case Collection["begin"]:
                return new beginCollection({
                    val : _event.val
                });
            case Collection["end"]:
                return new endCollection({
                    val : _event.val
                });                
            case Collection["crash"]:
                return new crashCollection({
                    val : _event.val
                });
            case Collection["activesessions"]:
                return new activeSessionCollection({
                    _id : _event.val.id,
                    sst : _event.val.sst,
                    lat : _event.val.lat,
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
  Collection: Collection
};