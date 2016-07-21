var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common');
var Collection = require('../models/analyticEvent').Collection;
//var common1 = require('../commons/common.js');

module.exports = exports = function (server, producer) {
    exports.begin(server, producer);
    exports.crash(server, producer);
    exports.end(server, producer);
};

exports.begin = function(server, producer) {
    server.route({
        method: 'POST',
        path: '/api/i/single/B',
        handler: function (request, reply) {
            akey = request.headers.akey;
            if(akey === undefined || akey === null){
                logger.info("Application key not provided!");
                logger.info("Data"+ request.payload);
                reply.statusCode = 200;
                reply({ message: "Success" });
                return
            }
            data = {};
            data.val = request.payload;
            if(data.val.rtc === undefined || data.val.rtc === null){
                data.val.rtc = Date.now();
            }
        data.val.ipa = common.getIP(request);
            data.type = Collection["begin"];
            payloads = [{ topic: akey, messages: JSON.stringify(data), partition: 0 }];
            producer.send(payloads, function(err, data){
                if(err){
                    logger.error(getErrorMessageFrom(err));
                    reply.statusCode = 400;
                    reply({ message: getErrorMessageFrom(err) });
                } else {
                    reply.statusCode = 200;
                    reply({ message: "Success" });
                }       
            });
        }
    });
};

exports.crash = function(server, producer) {
    var event;
    server.route({
        method: 'POST',
        path: '/api/i/single/C',
        handler: function (request, reply) {
            akey = request.headers.akey || config.kafka.default;
            if(akey === undefined || akey === null){
                logger.info("Application key not provided!");
                logger.info("Data"+ request.payload);
                reply.statusCode = 200;
                reply({ message: "Success" });
                return
            }
            data = {};
            data.val = request.payload;
            if(data.val.rtc === undefined || data.val.rtc === null){
                data.val.rtc = Date.now();
            }
            data.val.ipa = common.getIP(request);
            data.type = Collection["crash"];
            payloads = [{ topic: akey, messages: JSON.stringify(data), partition: 0 }];
            producer.send(payloads, function(err, data){
                if(err){
                    logger.error(getErrorMessageFrom(err));
                    reply.statusCode = 400;
                    reply({ message: getErrorMessageFrom(err) });
                } else {
                    reply.statusCode = 200;
                    reply({ message: "Success" });
                }       
            });
        }
    });
};

exports.end = function(server, producer) {
    var event;
    server.route({
        method: 'POST',
        path: '/api/i/single/E',
        handler: function (request, reply) {
            akey = request.headers.akey || config.kafka.default;
            if(akey === undefined || akey === null){
                logger.info("Application key not provided!");
                logger.info("Data"+ request.payload);
                reply.statusCode = 200;
                reply({ message: "Success" });
                return
            }
            data = {};
            data.val = request.payload;
            if(data.val.rtc === undefined || data.val.rtc === null){
                data.val.rtc = Date.now();
            }
            data.val.ipa = common.getIP(request);
            data.type = Collection["end"];
            payloads = [{ topic: akey, messages: JSON.stringify(data), partition: 0 }];
            producer.send(payloads, function(err, data){
                if(err){
                    logger.error(getErrorMessageFrom(err));
                    reply.statusCode = 400;
                    reply({ message: getErrorMessageFrom(err) });
                } else {
                    reply.statusCode = 200;
                    reply({ message: "Success" });
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
