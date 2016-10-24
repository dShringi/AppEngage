"use strict";
//For Development
//module.exports.port             = 3001;
//module.exports.propfilepath = '/home/osboxes/mountpersonal/nodejsprojects/AppEngage/UI/config'
//For Production
module.exports.port             = 6000;
module.exports.propfilepath = '/opt/AppEngage/UI/config'


module.exports.connectionstring = 'mongodb://localhost/';
module.exports.appengageConnString	=	'mongodb://localhost/appengage';

module.exports.coll_crashes			= 	'coll_crashes';
module.exports.coll_dashboard		= 	'coll_dashboard';
module.exports.coll_realtime		= 	'coll_realtimes';
module.exports.coll_users 			= 	'coll_users';
module.exports.coll_activesessions	= 	'coll_activesessions';
module.exports.coll_appengageusers	=	'coll_users';
module.exports.coll_appengageapps = 'coll_apps';
module.exports.coll_eventnames		=	'coll_eventnames';
module.exports.coll_campaigns = 'coll_campaigns';
module.exports.coll_cohorts = 'coll_cohorts';
module.exports.coll_audience = 'coll_audience';

module.exports.logdir	= '/var/log/appengage/UI/logs';

module.exports.searchByModel=[
{name:'manufacturer',value:'lm'},
{name:'type',value:'ldt'},
{name:'model',value:'lmod'},
{name:'platform',value:'lpf'},
{name:'osversion',value:'losv'},
{name:'appversion',value:'lavn'},
{name:'resolution',value:'lres'},
];

module.exports.defaultAppTimeZone = 'Asia/Kolkata';
module.exports.gmtTimeZone = 'Atlantic/Azores';

module.exports.appdetails = [
{app:"test1234",TZ:"America/New_York"},
{app:"4170b44d6459bba992acaa857ac5b25d7fac6cc1",TZ:"Asia/Kolkata"},
{app:"MastappDB",TZ:"Asia/Kolkata"},
];

module.exports.platform=[
{shortpf:"A",displaypf:"Android"},
{shortpf:"I",displaypf:"iOS"},
{shortpf:"W",displaypf:"Windows"},
{shortpf:"a",displaypf:"Android"},
{shortpf:"i",displaypf:"iOS"},
{shortpf:"w",displaypf:"Windows"},
{shortpf:"iOS",displaypf:"iOS"},
{shortpf:"IOS",displaypf:"iOS"}
];

module.exports.model=[
{shortpf:"GT-I9300",displaypf:"Samsung Galaxy S III"},
{shortpf:"HTC One",displaypf:"HTC One"},
{shortpf:"MotoG3",displaypf:"MotoG3"},
{shortpf:"GT-I8552",displaypf:"Samsung Galaxy Grand Quattro"},
{shortpf:"XT1052",displaypf:"Moto X"},
{shortpf:"MI 5",displaypf:"MI 5"}
];

module.exports.type=[
{shortpf:"S",displaypf:"SmartPhone"},
{shortpf:"T",displaypf:"Tablet"},
{shortpf:"s",displaypf:"SmartPhone"},
{shortpf:"t",displaypf:"Tablet"}
];

module.exports.manufacturer=[
{shortpf:"samsung",displaypf:"Samsung"},
{shortpf:"Xiaomi",displaypf:"Xiaomi"},
{shortpf:"HTC",displaypf:"HTC"},
{shortpf:"motorola",displaypf:"Motorola"}
];

module.exports.YYYYMMDDHH = 'YYYYMMDDHH';
module.exports.YYYYMMDD = 'YYYYMMDD';
module.exports.HOUR = 'hour';
module.exports.DAY = 'day';

module.exports.UNDEFINED = undefined;
module.exports.NULL = null;
module.exports.EMPTYSTRING ="";
module.exports.TRUE =true;
module.exports.FALSE = false;

module.exports.applicationDefaultTimeout=7200;
