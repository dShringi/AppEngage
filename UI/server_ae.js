var express 		= require('express');
var app 		= express();
var cookieParser 	= require('cookie-parser');
var bodyParser  	= require('body-parser');
var config		= require('./config/config');

//API Routes Embeding
var crashcontroller = require('./server/controllers/crashController');
//console.log('1');
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
//console.log('2');
app.get('/', function (req, res) {
  console.log(__dirname+'/client/index.html');	
  res.sendFile(__dirname + '/client/index.html');
});
//console.log('3');
app.get('/appengage//getCrashCounters', crashcontroller.crashCounters);
app.get('/appengage//getCrashDetails', crashcontroller.crashDetail);
//console.log('4');
var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Application listening at http://%s:%s', host, port);
});
//console.log('5');
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname));
