"use strict";

const logger = require('../conf/log.js');
const config = require('../conf/config.js');
const common = require('../commons/common');
const Collection = require('../models/analyticEvent').Collection;
const request = require('request');

module.exports = exports = function (server, producer) {
	exports.begin(server, producer);
    exports.crash(server, producer);
   	exports.end(server, producer);
	exports.events(server,producer);
    exports.offline(server,producer);
    exports.screen(server,producer);
    exports.campaign(server,producer);
};

exports.begin = function(server, producer) {
	//Server Route for begin messages
    server.route({
        method: config.url.post,
        path: config.url.beginep,
        handler: function (request, reply) {
			var paramsValues = [], paramsKeys = [];
			var data = {};
			console.log(request.payload);
            data.val = request.payload;
			paramsKeys[0]='akey';	paramsValues[0] = request.headers.akey;
			paramsKeys[1]='rtc';	paramsValues[1] = data.val.rtc;
			paramsKeys[2]='mt';  paramsValues[2] = data.val.mt;
			paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
			paramsKeys[4]='sid';	paramsValues[4] = data.val.sid;
            paramsKeys[5]='did';    paramsValues[5] = data.val.did;
            let msgStatus = common.hasValue(paramsKeys,paramsValues);
			if(msgStatus === config.object.FALSE){
				reply.statusCode = config.msgcodes.success;
				reply({ message: config.messages.success });
				return;
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
            var data = {};
            data.val = request.payload;
            console.log(data);
            paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
            paramsKeys[1]='rtc';    paramsValues[1] = data.val.rtc;
            paramsKeys[2]='mt';     paramsValues[2] = data.val.mt;
            paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
            paramsKeys[4]='sid';    paramsValues[4] = data.val.sid;
            paramsKeys[5]='did';    paramsValues[5] = data.val.did;
            let msgStatus = common.hasValue(paramsKeys,paramsValues);
            if(msgStatus === config.object.FALSE){
                reply.statusCode = config.msgcodes.success;
                reply({ message: config.messages.success });
                return;
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
        	var data = {};
        	data.val = request.payload;
            console.log(data);
            paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
            paramsKeys[1]='rtc';    paramsValues[1] = data.val.rtc;
            paramsKeys[2]='mt';     paramsValues[2] = data.val.mt;
            paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
            paramsKeys[4]='sid';    paramsValues[4] = data.val.sid;
            paramsKeys[5]='did';    paramsValues[5] = data.val.did;
            let msgStatus = common.hasValue(paramsKeys,paramsValues);
            if(msgStatus === config.object.FALSE){
                reply.statusCode = config.msgcodes.success;
                reply({ message: config.messages.success });
                return;
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
            var data = {};
            data.val = request.payload;
            console.log(data);
            paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
            paramsKeys[1]='rtc';    paramsValues[1] = data.val.rtc;
            paramsKeys[2]='mt';     paramsValues[2] = data.val.mt;
            paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
            paramsKeys[4]='sid';    paramsValues[4] = data.val.sid;
            paramsKeys[5]='did';    paramsValues[5] = data.val.did;
            let msgStatus = common.hasValue(paramsKeys,paramsValues);
            if(msgStatus === config.object.FALSE){
                reply.statusCode = config.msgcodes.success;
                reply({ message: config.messages.success });
                return;
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

exports.offline = function(server, producer) {
    //Server route for Real Time Events
    server.route({
        method: config.url.post,
        path: config.url.offlineep,
        handler: function (request, reply) {
            var data = {};
            var err;
            try{
                var jSON = JSON.parse(JSON.stringify(request.payload));
                for(let i=0;i<jSON.length;i++){
                    data.val = jSON[i];
					var akey = request.headers.akey;
                    console.log(data.val);
					pushOfflineData(data.val, akey);
                }
            }catch(ex){
                err = ex;
            }
            if(!err){
                reply.statusCode = config.msgcodes.success;
                reply({ message: config.messages.success });
            }else{
                reply.statusCode = config.msgcodes.failure;
                reply({ message: config.messages.failure });
            }
        }
    });
};

exports.screen = function(server, producer) {
    //Server route for Real Time Events
    server.route({
        method: config.url.post,
        path: config.url.screenep,
        handler: function (request, reply) {
            var paramsValues = [], paramsKeys = [];
            var data = {};
            //try{
                data.val = request.payload;
                console.log(data.val);

				paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
				paramsKeys[1]='rtc';    paramsValues[1] = data.val.rtc;
				paramsKeys[2]='mt';     paramsValues[2] = data.val.mt;
				paramsKeys[3]='dt';     paramsValues[3] = data.val.dt;
				paramsKeys[4]='sid';    paramsValues[4] = data.val.sid;
				paramsKeys[5]='did';    paramsValues[5] = data.val.did;
				let msgStatus = common.hasValue(paramsKeys,paramsValues);
				if(msgStatus === config.object.FALSE){
					reply.statusCode = config.msgcodes.success;
					reply({ message: config.messages.success });
					return;
				}
				data.type = Collection["screen"];
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

exports.campaign = function(server, producer) {
    //Server route for Real Time Events
    server.route({
        method: config.url.post,
        path: config.url.campaignep,
        handler: function (request, reply) {
            var paramsValues = [], paramsKeys = [];
            var data = {};
            data.val = request.payload;
            console.log(data.val);

            paramsKeys[0]='akey';   paramsValues[0] = request.headers.akey;
            paramsKeys[1]='campaignid';    paramsValues[1] = data.val.rtc;
            let msgStatus = common.hasValue(paramsKeys,paramsValues);
            if(msgStatus === config.object.FALSE){
                reply.statusCode = config.msgcodes.success;
                reply({ message: config.messages.success });
                return;
            }
            data.type = Collection["campaign"];
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
	let payloads = [{ topic: request.headers.akey, messages: JSON.stringify(data), partition: 0 }];

	//Push the payload to the queue.
    producer.send(payloads, function(err, data){
	   callback(err,data);
	});

}

// this method will push offile data by calling API
function pushOfflineData(postData, akey){
	let url = getURL(postData.mt);
	if(Boolean(url)){
		var options = {method: config.url.post, body: postData, json: true, url: url, headers: {"content-type": "application/json","akey": akey}};
		request(options, function (err, res, body) {
			if(err){
				let errMsg = common.getErrorMessageFrom(err);
				logger.error(errMsg);
			}
		});
	}
}

function getURL(eventType){
	let apiUrl = '';
	const domain = config.server.domain;
	switch(eventType) {
		case 'E' :{
			apiUrl = domain + config.url.endep; break;
		} case 'B' :{
			apiUrl = domain  + config.url.beginep; break;
		} case 'C' :{
			apiUrl = domain  + config.url.crashep; break;
		} case 'event' :{
			apiUrl = domain  + config.url.eventsep; break;
		} case 'S'	:{
			apiUrl = domain  + config.url.screenep; break;
		}
	}
	console.log('apiUrl  ', apiUrl);
	return apiUrl;
}
