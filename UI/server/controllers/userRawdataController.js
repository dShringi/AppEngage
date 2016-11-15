var mongojs = require('mongojs');
var config = require('../../config/config');
var logger = require('../../config/log.js');
var common = require('../../commons/common.js');
var async = require('async');
var zip = require('express-zip');
var fs = require('fs');
/*
	input filters: 	begin(date),end(date),akey(string),eventype(array)
	eventypes    :  begin,end,crash,screen      
	return type  : 	csv/xml/json
	description  : 	Fetch User's data on the basis of begin/end date 
					and event performed by user 
*/
module.exports.getUserRawdata = function(req, res) {

	var reqParams     = req.query;
    var beginDate     = ((new Date(reqParams.begindate).getTime())/1000);
    var endDate       = ((new Date(reqParams.enddate).getTime())/1000);
    var akey          = reqParams.akey;
    var evenTypes     = reqParams.etypes;
    var fileExtension = '.'+reqParams.extension;

    var appName   = 'appengage';
    // database connection
    var db        = mongojs(akey);
    
    async.parallel([
        function(callback) {

        	if(evenTypes.indexOf('begins') > -1) {
        		db.collection('coll_begins').find({
	                $and: 	[ 
		                		{ rtr : { $gte :  beginDate, $lte : endDate} }, 
		                		{ 'val.akey': akey } 
	                		]
	                
	            }, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                    callback(err, result)
	                }
	            });	
        	}
        	else {
        		callback(null,null);
        	}
        },
        function(callback) {
        	if(evenTypes.indexOf('ends') > -1) {
        		db.collection('coll_ends').find( {
	                $and: 	[ 
		                		{ rtr : { $gte :  beginDate, $lte : endDate} }, 
		                		{ 'val.akey': akey } 
	                		]
	                
	            }, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                    callback(err, result)
	                }
	            });
        	}
        	else {
        		callback(null,null);
        	}
        },
        function(callback) {
        	if(evenTypes.indexOf('crashes') > -1) {
        		db.collection('coll_crashes').find({
	                $and: 	[ 
		                		{ rtr : { $gte :  beginDate, $lte : endDate} }, 
		                		{ 'val.akey': akey } 
	                		]
	                
	            }, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                    callback(err, result)
	                }
	            });
        	}
        	else {
        		callback(null,null);
        	}
            
        },
        function(callback) {

        	if(evenTypes.indexOf('screens') > -1) {
        		db.collection('coll_screens').find({	                
	                $and: 	[ 
		                		{ rtr : { $gte :  beginDate, $lte : endDate} }, 
		                		{ 'val.akey': akey } 
	                		]
	                
	            }, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                    callback(err, result)
	                }
	            });
        	}
        	else {
        		callback(null,null);
        	}
            
        }
    ], function(err, resultset) {

    	// assign no data found if resultset is null
    	resultset[0]  = resultset[0] == null ? '[]':resultset[0];
    	resultset[1]  = resultset[1] == null ? '[]':resultset[1];
		resultset[2]  = resultset[2] == null ? '[]':resultset[2];
		resultset[3]  = resultset[3] == null ? '[]':resultset[3];

		// array for filenames
		var filenameArray = ['begins'+fileExtension,'ends'+fileExtension,'crashes'+fileExtension,'screens'+fileExtension];

		//genrate files to write data
		for(let i=0;i<filenameArray.length;i++){
			fs.writeFile('./'+filenameArray[i], JSON.stringify(resultset[i]), function(err) {
			    if(err) {
			        return console.log(err);
			    }
			});
		}		
		
		//compress all files and send as response in ZIP file
		/*var pathforZip = '';
		for(let k=0;k<filenameArray.length;k++){
			if(resultset[k].length > 0){
				pathforZip += "{ path:"+"'./"+filenameArray[k]+"', name: "+"'"+filenameArray[k]+"'},";
				
			}
		}	
		pathforZip = pathforZip.substring(0, (pathforZip.length-1));
		console.log(pathforZip);
		console.log(typeof pathforZip);*/

		res.zip([
					{ path: './'+filenameArray[0], name: filenameArray[0] },
					{ path: './'+filenameArray[1], name: filenameArray[1] },
					{ path: './'+filenameArray[2], name: filenameArray[2] },
					{ path: './'+filenameArray[3], name: filenameArray[3] }
				],appName+new Date().getTime()+'.zip');
		
		// delete files after response is sent		
		res.on('finish', afterResponse);
		function afterResponse(){
			for(let j=0;j<filenameArray.length;j++){
				fs.unlink('./'+filenameArray[j]);
			}
		}
    	    
    });
    
}