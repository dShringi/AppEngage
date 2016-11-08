//http://52.206.121.100/appengage/fetchUserProfiles?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1&ed=1477472283&sd=1474966683&userid=Tablet
"use strict";

const mongojs = require('mongojs');
const config  = require('../../config/config');
const logger  = require('../../config/log.js');
const common = require('../../commons/common.js');

module.exports.fetchUserProfiles = function(req,res){
  var result = '{"fName":   "John",\
                "lName":   "Doe",\
                "ctry":   "uk",\
                "city":   "London",\
                "lSeen": 6,\
                "eLevel": 60,\
                "uName":   "johndoe",\
                  "eM":   "johndoe@appengage.com",\
                  "org":   "Amodo",\
                  "dType":   "mobile",\
                  "os":   "android",\
                  "con":   "+374-628 9058",\
                  "gen":   "Male",\
                  "age": 38,\
                  "events": [    "Track user EMI",     "Grant Loan",     "Recive User EMI"  ],\
                "tSC": 13,\
                  "tS": [{ "dt": 20161101, "s": 3}, {"dt": 20161102, "s": 3}, {"dt": 20161103, "s": 3}, {"dt": 20161104, "s": 3}, {"dt": 20161105, "s": 3}, {"dt": 20161106, "s": 3}, {"dt": 20161107, "s": 3}, {"dt": 20161108, "s": 3}, {"dt": 20161109, "s": 3}, {"dt": 20161110, "s": 3}],\
                "tSE": 35,\
                  "tE": [{ "dt": 20161101, "e": 3}, {"dt": 20161101,"e": 3}, {"dt": 20161101,"e": 3}, {"dt": 20161101,"e": 3}]\
}';

  return res.json(JSON.parse(result));

  };
