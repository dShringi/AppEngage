var logger = require('../conf/log.js');
var Collection = require('../models/analyticEvent').Collection;

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
            akey = request.headers.akey || config.kafka.default;
            data = {};
            data.val = request.payload;
            data.val.mt = "B";
            data.val.ipa = getIPAddress(request);
            data.type = Collection["begin"];
            payloads = [{
                topic: akey,
                messages: JSON.stringify(data),
                partition: 0
            }];
            producer.send(payloads, function(err, data){
                if(err){
                    logger.error(getErrorMessageFrom(err));
                    reply.statusCode = 400;
                    return reply;
                }        
            });
            reply.statusCode = 200;
            reply({ message: "Success"});
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
            data = request.payload;
            data.mt = "C";
            data.ipa = getIPAddress(request);
            payloads = [{
                topic: akey,
                messages: JSON.stringify(data),
                partition: 0
            }];
            producer.send(payloads, function(err, data){
                if(err){
                    logger.error(getErrorMessageFrom(err));
                    reply.statusCode = 400;
                    return reply;
                }        
            });
            reply.statusCode = 200;
            reply({ message: "Success"});
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
            data = request.payload;
            data.mt = "E";
            data.ipa = getIPAddress(request);
            payloads = [{
                topic: akey,
                messages: JSON.stringify(data),
                partition: 0
            }];
            producer.send(payloads, function(err, data){
                if(err){
                    logger.error(getErrorMessageFrom(err));
                    reply.statusCode = 400;
                    return reply;
                }        
            });
            reply.statusCode = 200;
            reply({ message: "Success"});
        }
    });
};

function getIPAddress(request){
    return request.info.remoteAddress;
}
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