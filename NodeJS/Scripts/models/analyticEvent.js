var Mongoose   = require('mongoose');
var Schema     = Mongoose.Schema;

var beginEventSchema = new Schema({
  akey	        : { type: String, required: true, trim: true },
  mnu           : { type: String },
  mod           : { type: String },
  pf        	: { type: String },
  ip_address    : { type: String },
  dateCreated   : { type: Date, default: Date.now }
});

var crashEventSchema = new Schema({
  akey	        : { type: String, required: true, trim: true },
  mnu           : { type: String },
  mod           : { type: String },
  pf        	: { type: String },
  dateCreated   : { type: Date, default: Date.now }
});

var endEventSchema = new Schema({
  akey	        : { type: String, required: true, trim: true },
  mnu           : { type: String },
  mod           : { type: String },
  pf        	: { type: String },
  dateCreated   : { type: Date, default: Date.now }
});

var beginEvent = Mongoose.model('begin_event', beginEventSchema);
var crashEvent = Mongoose.model('crash_event', crashEventSchema);
var endEvent = Mongoose.model('end_event', endEventSchema);

module.exports = {
  BeginEvent: beginEvent,
  CrashEvent: crashEvent,
  EndEvent: endEvent    
};
