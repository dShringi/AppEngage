"use strict";
const logger = require('../conf/log.js');
const Mongoose   = require('mongoose');
const Schema     = Mongoose.Schema;

const Collection = {
                    "app"               : "coll_app",
                    "realtime"          : "coll_realtime",
                    "dashboard"         : "coll_dashboard",
                    "begin"             : "coll_begins",
                    "end"               : "coll_ends",
                    "crash"             : "coll_crashes",
                    "activesessions" 	: "coll_activesessions",
                    "user"              : "coll_users",
                    "event"             : "coll_events",
					"screen"            : "coll_screens",
                    "campaign"          : "coll_campaigns",
                    "screenmetrics"     : "coll_screenmetrics",
                    "screennames"       : "coll_screennames",
                    "userscreens"       : "coll_userscreens"
                   };

// DB Schemas
var appSchema = new Schema({
    name : { type: String },
    cty  : { type: String },
    tz   : { type: String },
    ctg  : { type: String }
},{versionKey:false});

var eventNameSchema = new Schema({
    _id : { type: String }
},{versionKey:false});

var screenNameSchema = new Schema({
    _id : { type: Object }
},{versionKey:false});

var realtimeSchema = new Schema({
    _id  : { type: Number, required: true },
    val  : { type: Number }
},{versionKey:false});

var dashboardSchema = new Schema({
    _id  : { type: Object, require: true },
    val  : { type: Object }
}, {
    collection : 'coll_dashboard'
});

var screenMetricsSchema = new Schema({
    _id  : { type: Object, require: true },
    val  : { type: Object }
}, {
    collection : 'coll_screenmetrics'
});

var beginSchema = new Schema({
	rtr: {type:Number, required:true},
	val: {type: Object}
},{versionKey:false});

var endSchema = new Schema({
	rtr: {type:Number, required:true},
	val: {type: Object}
},{versionKey:false});

var crashSchema = new Schema({
rtr: {type:Number, required:true},
val: {type: Object}
},{versionKey:false});

var eventSchema = new Schema({
rtr: {type:Number, required:true},
val: {type: Object}
},{versionKey:false});

var activeSessionSchema = new Schema({
    _id  : { type: String, require: true },
    did  : { type: String },
    sst  : { type: Number },
    lat  : { type: Number },
    dt   : { type: String }
},{versionKey:false});

var userSchema = new Schema({
	_id	:	{type:	String,	require	:	true},
	lm	:	{type:	String},
	ldt	:	{type:	String},
	lmod	:	{type:	String},
	lpf	:	{type:	String},
	losv	:	{type:	String},
	lavn	:	{type:	String},
	lci	:	{type:	String},
	lcn	:	{type:	String},
	lc	:	{type:	String},
    lres:   {type:  String},
    lcty:   {type:  String},
    lctry:  {type:  String},
    llat:   {type:  String},
    llong:  {type:  String},
	flog	:	{type:	Number},
	llog	:	{type:	Number},
	ts	:	{type:	Number},
	tts	:	{type:	Number},
},{strict:false,versionKey:false});

var userScreenSchema = new Schema({
    _id :   {type:  String, require :   true},
    dt  :   {type:  String},
    pf :   {type:  String}
},{strict:false,versionKey:false});

var screenSchema = new Schema({
    dt :   {type:  String},
    pf :   {type:  String},
    did :  {type:  String},
    rtc :  {type:  Number},
    sid :  {type: String},
    act :  {type: Object}
},{strict:false,versionKey:false});

// MongoDB Collection
var appCollection 		= Mongoose.model('coll_app', appSchema);
var realtimeCollection 		= Mongoose.model('coll_realtime', realtimeSchema);
var dashboardCollection 	= Mongoose.model('coll_dashboard', dashboardSchema);
var beginCollection 		= Mongoose.model('coll_begins', beginSchema);
var crashCollection 		= Mongoose.model('coll_crashes', crashSchema);
var endCollection 		= Mongoose.model('coll_ends', endSchema);
var eventCollection 		= Mongoose.model('coll_events', eventSchema);
var activeSessionCollection 	= Mongoose.model('coll_activesessions', activeSessionSchema);
var userCollection		= Mongoose.model('coll_users',userSchema);
var screenCollection      = Mongoose.model('coll_screens',screenSchema);
var eventCollection		= Mongoose.model('coll_events',eventSchema);
var eventNamesCollection    =   Mongoose.model('coll_eventNames',eventNameSchema);
var screenNamesCollection   =   Mongoose.model('coll_screennames',screenNameSchema);
var screenMetricsCollection     = Mongoose.model('coll_screenmetrics', screenMetricsSchema);
var userScreensCollection   = Mongoose.model('coll_userscreens', userScreenSchema);


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
            case Collection["event"]:
                return new eventCollection({
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
            case Collection["user"]:
                return new userCollection({
				    _id	: _event.val.did,
				    lm	: _event.val.mnu,
				    ldt	: _event.val.dt,
				    lmod	: _event.val.mod,
                    lpf	: _event.val.pf,
				    losv	: _event.val.osv,
				    lavn	: _event.val.avn,
				    lc	: _event.val.c,
                    lres: _event.val.res,
                    lcty:	_event.val.city,
                    lctry:   _event.val.ctry,
                    llat:   _event.val.dlat,
                    llong:   _event.val.dlog,
				    flog	: _event.val.rtc,
				    llog	: _event.val.rtc,
				    ts	: 1,
				    tts	: 0
                });
            case Collection["userscreens"]:
                return new userScreensCollection({
                    _id : _event.val.did,
                    pf  : _event.val.pf,
                    dt : _event.val.dt
                });
            case Collection["screen"]:
                return new screenCollection({
                    rtc : _event.val.rtc,
                    sid : _event.val.sid,
                    did : _event.val.did,
                    act : _event.val.act,
                    pf  : _event.val.pf,
                    dt : _event.val.dt
                });
            case Collection["screennames"]:
                return new screenNamesCollection({
                    _id : _event.activity
                });
            default:
                logger.error("Invalid event type: "+_event.type);
                return null;
        }
    };
}

module.exports = {
  EventFactory: eventFactory,
  Collection: Collection,
  Begin: beginCollection,
  Dashboard: dashboardCollection,
  ActiveSession: activeSessionCollection,
  User: userCollection,
  Screen: screenCollection,
  RealTime: realtimeCollection,
  EventNames: eventNamesCollection,
  ScreenNames: screenNamesCollection,
  ScreenMetrics: screenMetricsCollection,
  UserScreens: userScreensCollection
};
