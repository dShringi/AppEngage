//For Development
module.exports.port             = 3001;
//For Production
//module.exports.port             = 6000;

module.exports.connectionstring = 'mongodb://localhost/';
module.exports.appengageConnString	=	'mongodb://localhost/appengage'

module.exports.coll_crashes			= 	'coll_crashes';
module.exports.coll_dashboard		= 	'coll_dashboard';
module.exports.coll_realtime		= 	'coll_realtimes';
module.exports.coll_users 			= 	'coll_users';
module.exports.coll_activesessions	= 	'coll_activesessions';
module.exports.coll_appengageusers	=	'coll_users';

module.exports.logdir	= '/var/log/appengage/UI/logs';

module.exports.searchByModel=[
{name:'manufacturer',value:'lm'}, 
{name:'devicetype',value:'ldt'},
{name:'model',value:'lmod'},
{name:'platform',value:'lpf'}, 
{name:'osversion',value:'losv'}, 
{name:'appversion',value:'lavn'}, 
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
{shortpf:"w",displaypf:"Windows"}
]

module.exports.YYYYMMDDHH = 'YYYYMMDDHH';
module.exports.YYYYMMDD = 'YYYYMMDD';
module.exports.HOUR = 'hour';
module.exports.DAY = 'day';