var BeginEvent   = require('../models/analyticEvent').BeginEvent;
var CrashEvent   = require('../models/analyticEvent').CrashEvent;
var EndEvent   = require('../models/analyticEvent').EndEvent;
var logger = require('../conf/log.js');

// Wanna know the reason for "module.exports = exports...", checkout SO
module.exports = exports = function (server) {
    exports.begin(server);
    exports.crash(server);
    exports.end(server);
};

exports.begin = function(server) {
    var event;
    server.route({
        method: 'POST',
        path: '/api/i/single/B',
        handler: function (request, reply) {
            event = new BeginEvent();
            event.akey = request.payload.akey;
            event.mnu = request.payload.mnu;
            event.pf = request.payload.pf;
            // TODO get ip address and add to json.
            event.save(function (err) {
                if (!err) {
                    return reply(event).created('/api/i/single/B/' + event._id); 
                } else {
                    logger.error(err);
                    reply(event).statusCode = 400;
                    reply(event).statusText = getErrorMessageFrom(err);
                    return reply;
                }
            });
        }
    });
};

exports.crash = function(server) {
    var event;
    server.route({
        method: 'POST',
        path: '/api/i/single/C',
        handler: function (request, reply) {
            event = new CrashEvent();
            event.akey = request.payload.akey;
            event.mnu = request.payload.mnu;
            event.pf = request.payload.pf;
            // TODO get ip address and add to json.
            event.save(function (err) {
                if (!err) {
                    return reply(event).created('/api/i/single/C/' + event._id); 
                } else {
                    logger.error(err);
                    reply(event).statusCode = 400;
                    reply(event).statusText = getErrorMessageFrom(err);
                    return reply;
                }
            });
        }
    });
};

exports.end = function(server) {
    var event;
    server.route({
        method: 'POST',
        path: '/api/i/single/E',
        handler: function (request, reply) {
            event = new EndEvent();
            event.akey = request.payload.akey;
            event.mnu = request.payload.mnu;
            event.pf = request.payload.pf;
            // TODO get ip address and add to json.
            event.save(function (err) {
                if (!err) {
                    return reply(event).created('/api/i/single/E/' + event._id); 
                } else {
                    logger.error(err);
                    reply(event).statusCode = 400;
                    reply(event).statusText = getErrorMessageFrom(err);
                    return reply;
                }
            });
        }
    });
};


function getErrorMessageFrom(err) {
    var errorMessage = '';
    if (err.errors) {
        for (var prop in err.errors) {
            if(err.errors.hasOwnProperty(prop)) {
                errorMessage += err.errors[prop].message + ' '
            }
        }
    } else {
        errorMessage = err.message;
    }
    return errorMessage;
}