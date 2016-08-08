var express 		= require('express');
var app 			= express();
//var cookieParser 	= require('cookie-parser');
var bodyParser  	= require('body-parser');
var config			= require('./config/config');
var logger 			= require('./config/log.js');

//API Routes Embeding
var crashController = require('./server/controllers/crashController');
var dashboardController = require('./server/controllers/dashboardController');
var userDashboardController = require('./server/controllers/userDashboardController');
//console.log('1');
//app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
//console.log('2');
app.get('/', function (req, res) {
  console.log(__dirname+'/client/index.html');	
  res.sendFile(__dirname + '/client/index.html');
});
//console.log('3');
app.get('/appengage/getCrashCounters', crashController.crashCounters);
app.get('/appengage/getCrashDetails', crashController.crashDetail);
app.get('/appengage/getDashBoardCounters', dashboardController.dashboardCounters);
app.get('/appengage/getDashBoardRealTime',dashboardController.dashboardRealTime);
app.get('/appengage/getDashBoardUserInsights',dashboardController.getUserInsights);
app.get('/appengage/getDashBoardSessionInsights',dashboardController.getSessionInsights);
app.get('/appengage/getUserDashboardCounters',userDashboardController.getUserDashboardCounters);
//console.log('4');
var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Application listening at http://%s:%s', host, port);
});
//console.log('5');
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname));
