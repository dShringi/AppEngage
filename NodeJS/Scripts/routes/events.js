var logger = require('../conf/log.js');
var config = require('../conf/config.js');
var common = require('../commons/common');
var Collection = require('../models/analyticEvent').Collection;

module.exports = exports = function (server, producer) {
	exports.begin(server, producer);
    	exports.crash(server, producer);
   	exports.end(server, producer);
	exports.events(server,producer);
};

exports.begin = function(server, producer) {
	//Server Route for begin messages
    	server.route({
        	method: config.url.post,
        	path: config.url.beginep,
        	handler: function (request, reply) {
			var paramsValues = [], paramsKeys = [];
            	
			data = {};
			console.log(request.payload);
            		data.val = request.payload;
			paramsKeys[0]='akey';	paramsValues[0] = request.headers.akey;
			paramsKeys[1]='rtc';	paramsValues[1] = data.val.rtc;
			paramsKeys[2]='mt';	paramsValues[2] = data.val.mt;
			paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
			paramsKeys[4]='sid';	paramsValues[4] = data.val.sid;
                        paramsKeys[5]='did';    paramsValues[5] = data.val.did;
            		msgStatus = common.hasValue(paramsKeys,paramsValues);
			console.log(msgStatus);
			if(msgStatus === false){
				reply.statusCode = config.msgcodes.success;
				reply({ message: config.messages.success });
				return
			}
			
            		data.type = Collection["begin"];
                        pushToKafka(data,request,producer,function(err,data){
                                if(err){
                                        var errMsg = common.getErrorMessageFrom(err);
                                        logger.error(errMsg);
                                        reply.statusCode = config.msgcodes.failure;
                                        reply({ message: errMsg });
                                } else {
                                        reply.statusCode = config.msgcodes.success;
                                        reply({ message: config.messages.success });
                                }

                        });
		}
    	});
};

exports.crash = function(server, producer) {
	//Server route for Real Time Crash Messages
    	server.route({
        	method: config.url.post,
        	path: config.url.crashep,
        	handler: function (request, reply) {
			var paramsValues = [], paramsKeys = [];

            		data = {};
            		data.val = request.payload;
                        console.log(data);
                        paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
                        paramsKeys[1]='rtc';    paramsValues[1] = data.val.rtc;
                        paramsKeys[2]='mt';     paramsValues[2] = data.val.mt;
                        paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
                        paramsKeys[4]='sid';    paramsValues[4] = data.val.sid;
                        paramsKeys[5]='did';    paramsValues[5] = data.val.did;
                        msgStatus = common.hasValue(paramsKeys,paramsValues);
                        if(msgStatus === false){
                                reply.statusCode = config.msgcodes.success;
                                reply({ message: config.messages.success });
                                return
                        }

            		data.type = Collection["crash"];
                        pushToKafka(data,request,producer,function(err,data){
                                if(err){
                                        var errMsg = common.getErrorMessageFrom(err);
                                        logger.error(errMsg);
                                        reply.statusCode = config.msgcodes.failure;
                                        reply({ message: errMsg });
                                } else {
                                        reply.statusCode = config.msgcodes.success;
                                        reply({ message: config.messages.success });
                                }

                        });
        	}
    	});
};

exports.end = function(server, producer) {
	//Server route for Real Time End Messages
	server.route({
        	method: config.url.post,
        	path: config.url.endep,
        	handler: function (request, reply) {
			var paramsValues = [], paramsKeys = [];
            		data = {};
            		data.val = request.payload;
                        console.log(data);
                        paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
                        paramsKeys[1]='rtc';    paramsValues[1] = data.val.rtc;
                        paramsKeys[2]='mt';     paramsValues[2] = data.val.mt;
                        paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
                        paramsKeys[4]='sid';    paramsValues[4] = data.val.sid;
                        paramsKeys[5]='did';    paramsValues[5] = data.val.did;
                        msgStatus = common.hasValue(paramsKeys,paramsValues);
                        if(msgStatus === false){
                                reply.statusCode = config.msgcodes.success;
                                reply({ message: config.messages.success });
                                return
                        }

            		data.type = Collection["end"];
                        pushToKafka(data,request,producer,function(err,data){
                                if(err){
                                        var errMsg = common.getErrorMessageFrom(err);
                                        logger.error(errMsg);
                                        reply.statusCode = config.msgcodes.failure;
                                        reply({ message: errMsg });
                                } else {
                                        reply.statusCode = config.msgcodes.success;
                                        reply({ message: config.messages.success });
                                }

                        });
        	}
    	});
};

exports.events = function(server, producer) {
	//Server route for Real Time Events
	server.route({
        	method: config.url.post,
        	path: config.url.eventsep,
        	handler: function (request, reply) {
			var paramsValues = [], paramsKeys = [];
            		data = {};
            		data.val = request.payload;
                        console.log(data);
                        paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
                        paramsKeys[1]='rtc';    paramsValues[1] = data.val.rtc;
                        paramsKeys[2]='mt';     paramsValues[2] = data.val.mt;
                        paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
                        paramsKeys[4]='sid';    paramsValues[4] = data.val.sid;
                        paramsKeys[5]='did';    paramsValues[5] = data.val.did;
                        msgStatus = common.hasValue(paramsKeys,paramsValues);
                        if(msgStatus === false){
                                reply.statusCode = config.msgcodes.success;
                                reply({ message: config.messages.success });
                                return
                        }

            		data.type = Collection["event"];
			pushToKafka(data,request,producer,function(err,data){
                		if(err){
                        		var errMsg = common.getErrorMessageFrom(err);
                        		logger.error(errMsg);
                        		reply.statusCode = config.msgcodes.failure;
                        		reply({ message: errMsg });
                		} else {
                        		reply.statusCode = config.msgcodes.success;
                        		reply({ message: config.messages.success });
                		}
			
			});			
        	}
    	});
};


function pushToKafka(data,request,producer,callback){
	//Deriving the IP Address of the request for location.
	data.val.ipa = common.getIP(request);
	payloads = [{ topic: request.headers.akey, messages: JSON.stringify(data), partition: 0 }];
        
	//Push the payload to the queue.
        producer.send(payloads, function(err, data){
		callback(err,data);
	});
	
}

