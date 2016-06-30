var logger = require('../conf/log.js');

// Wanna know the reason for "module.exports = exports...", checkout SO
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
            request.payload.ipa = request.info.remoteAddress;
            data = request.payload;
            data.type = "begin";
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
            console.log("return reply");
            reply({ message: "Success!!"});
        }
    });
};

exports.crash = function(server, producer) {
    var event;
    server.route({
        method: 'POST',
        path: '/api/i/single/C',
        handler: function (request, reply) {
            // TODO
        }
    });
};

exports.end = function(server, producer) {
    var event;
    server.route({
        method: 'POST',
        path: '/api/i/single/E',
        handler: function (request, reply) {
            // TODO
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