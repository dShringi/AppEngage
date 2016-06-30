var Mongoose   = require('mongoose');
var Schema     = Mongoose.Schema;

var beginEventSchema = new Schema({
  akey	        : { type: String, required: true, trim: true },
  mnu           : { type: String },
  mod           : { type: String },
  osv           : { type: String },
  pf        	: { type: String },
  avn           : { type: String },
  lat           : { type: Number },
  lng           : { type: Number },
  rtc           : { type: Number },
  sid           : { type: String },
  did           : { type: String },
  res           : { type: String },
  c             : { type: String },
  dt            : { type: String },
  uid           : { type: String },
  nw            : { type: String },
  cpu           : { type: String },
  ori           : { type: String },
  sdv           : { type: String },
  mt            : { type: String },
  ipa           : { type: String }
});

var crashEventSchema = new Schema({
  akey	        : { type: String, required: true, trim: true },
  mnu           : { type: String },
  mod           : { type: String },
  osv           : { type: String },
  pf        	: { type: String },
  avn           : { type: String },
  lat           : { type: Number },
  lng           : { type: Number },
  rtc           : { type: Number },
  sid           : { type: String },
  did           : { type: String },
  res           : { type: String },
  c             : { type: String },
  dt            : { type: String },
  ac            : { type: String },
  nw            : { type: String },
  cpu           : { type: String },
  ori           : { type: String },
  frs           : { type: Number },
  trs           : { type: Number },
  fds           : { type: Number },
  tds           : { type: Number },
  bl            : { type: Number },
  ids           : { type: String },
  ido           : { type: String },
  est           : { type: String },    
  esm           : { type: String },
  ess           : { type: String },
  sdv           : { type: String },
  mt            : { type: String }
});

var endEventSchema = new Schema({
  akey	        : { type: String, required: true, trim: true },
  tsd           : { type: Number },
  did           : { type: String },
  rtc           : { type: Number },
  ipa           : { type: String },
  sid           : { type: String },
  mt            : { type: String}
});

var beginEvent = Mongoose.model('begin_event', beginEventSchema);
var crashEvent = Mongoose.model('crash_event', crashEventSchema);
var endEvent = Mongoose.model('end_event', endEventSchema);

function eventFactory(){
    this.getEvent = function(_event){
        if(_event.type === "begin"){
            _event_ = new beginEvent({
                akey: _event.akey,
                ipa: _event.ipa,
                mnu: _event.mnu,
                mod: _event.mod,
                osv: _event.osv,
                pf : _event.pf,
                avn: _event.avn,
                lat: _event.lat,
                lng: _event.lng,
                rtc: _event.rtc,
                sid: _event.sid,
                did: _event.did,
                res: _event.res,
                c  : _event.c,
                dt : _event.dt,
                ac : _event.ac,
                nw : _event.nw,
                cpu: _event.cpu,
                ori: _event.ori,
                frs: _event.frs,
                trs: _event.trs,
                fds: _event.fds,
                tds: _event.tds,
                bl : _event.bl,
                ids: _event.ids,
                ido: _event.ido,
                est: _event.est,    
                esm: _event.esm,
                ess: _event.ess,
                sdv: _event.sdv,
                mt : _event.mt
            });
            return _event_;
        } else if (_event === "crash") {
            _event_ = new crashEvent({
                akey: _event.akey,
            });
        } else if (_event === "end") {
            _event_ = new endEvent({
                akey: _event.akey
            });
        }
    }
}
}


module.exports = {
  BeginEvent: beginEvent,
  CrashEvent: crashEvent,
  EndEvent: endEvent,
  EventFactory: eventFactory
};