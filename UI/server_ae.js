//TODO Clustering https://nodejs.org/api/cluster.html
//node --optimize_for_size --max_old_space_size=460 --gc_interval=100 server.js
var express 		= require('express');
var app 			= express();
var cookieParser 	= require('cookie-parser');
var bodyParser  	= require('body-parser');
var config			= require('./config/config');
var logger 			= require('./config/log.js');
//API Routes Embeding
try{
var crashController = require('./server/controllers/crashController');
var dashboardController = require('./server/controllers/dashboardController');
var userDashboardController = require('./server/controllers/userDashboardController');
var userValidationController = require('./server/controllers/userValidationController');
var sessionController = require('./server/controllers/sessionController');
var locationController = require('./server/controllers/locationController');
var eventController = require('./server/controllers/eventsController');
var campaignController = require('./server/controllers/campaignController');
var cohortController = require('./server/controllers/cohortController');

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.get('/appengage/getCrashCounters', crashController.crashCounters);
app.get('/appengage/getCrashDetails', crashController.crashDetail);
app.get('/appengage/getDashBoardCounters', dashboardController.dashboardCounters);
app.get('/appengage/getDashBoardRealTime',dashboardController.dashboardRealTime);
app.get('/appengage/getUserInsights',sessionController.getUserInsights);
app.get('/appengage/getSessionInsights',sessionController.getSessionInsights);
app.get('/appengage/getDeviceCounters',userDashboardController.getUserDashboardCounters);
app.get('/appengage/getUserValidated',userValidationController.validateUser);
app.get('/appengage/getUserNameValidated',userValidationController.validateUserName);
app.post('/appengage/registerUser',userValidationController.registerUser);
app.get('/appengage/getLocationCounters',locationController.getLocationCounters);
app.get('/appengage/getEventNames',eventController.getEventNames);
app.get('/appengage/getEventSummary',eventController.getEventSummary);
app.get('/appengage/getEventsComparison',eventController.getEventsComparison);
app.post('/appengage/createCampaign',campaignController.createCampaign);
app.put('/appengage/updateCampaign',campaignController.updateCampaign);
app.delete('/appengage/deleteCampaign',campaignController.deleteCampaign);
app.get('/appengage/fetchAllCampaigns',campaignController.fetchAllCampaigns);
app.get('/appengage/fetchCohorts',cohortController.fetchCohorts);
}catch(ex){
  console.log(ex);
}
var server = app.listen(config.port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Application listening at http://%s:%s', host, port);
});
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname));
