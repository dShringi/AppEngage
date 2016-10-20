"use strict";
/*
const mongojs = require('mongojs');
const config  = require('../../config/config');
const logger  = require('../../config/log.js');
const common = require('../../commons/common.js');
*/
module.exports.fetchScreenStats = function(req,res){
let response = '[{"name": "app1","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img1.jpg","alt": "app1","nuu": 13,"noc": 5,"tts": 300,"ts": 430},' +
                 '{"name": "app2","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img2.jpg","alt": "app2","nuu": 23,"noc": 50,"tts": 500,"ts": 830},' +
                 '{"name": "app2","path": "assets/appscreenimages/4170b44d6459bba992acaa857ac5b25d7fac6cc1/img3.jpg","alt": "app2","nuu": 33,"noc": 20,"tts": 700,"ts": 338}' +
                 ']';
return res.json(JSON.parse(response));
};
