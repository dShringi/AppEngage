const mongojs    = require('mongojs');
const config     = require('../../config/config');
const logger     = require('../../config/log.js');
const common     = require('../../commons/common.js');
const async      = require('async');
const zip        = require('express-zip');
const fs         = require('fs');
const jsonexport = require('jsonexport');
/*
	input filters: 	begin(date),end(date),akey(string),eventype(array)
	eventypes    :  begin,end,crash,screen,events    
	return type  : 	json
	description  : 	Fetch User's data on the basis of begin/end date 
					and event performed by user 
*/
module.exports.getUserRawdata = function(req, res) {

	let reqParams     = req.query;
    var beginDate     = (new Date(reqParams.begindate).getTime()).length == 10 ? (new Date(reqParams.begindate).getTime()) : ((new Date(reqParams.begindate).getTime())/1000);
    var endDate       = (new Date(reqParams.enddate).getTime()).length == 10 ? (new Date(reqParams.enddate).getTime()) : ((new Date(reqParams.enddate).getTime())/1000);
    let akey          = reqParams.akey;
    let evenTypes     = reqParams.etypes;
    let fileExtension = '.'+reqParams.extension;

    let appName   = config.appname;
    // database connection
    let db        = mongojs(akey);
        
    async.parallel([
        function(callback) {

        	if(evenTypes.indexOf('begins') > -1) {
        		db.collection(config.coll_begins).find({
        			rtr : { $gte :  beginDate, $lte : endDate}                             
	            },{_id:0}, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                	logger.error(common.getErrorMessageFrom(err));
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
        		db.collection(config.coll_ends).find({
        			rtr : { $gte :  beginDate, $lte : endDate}
	            },{_id:0}, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                	logger.error(common.getErrorMessageFrom(err));
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
        		db.collection(config.coll_crashes).find({
		            rtr : { $gte :  beginDate, $lte : endDate}
	            },{_id:0}, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                	logger.error(common.getErrorMessageFrom(err));
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
        		db.collection(config.coll_screens).find({	                
		            rtr : { $gte :  beginDate, $lte : endDate }
	            },{_id:0}, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                	logger.error(common.getErrorMessageFrom(err));
	                    callback(err, result)
	                }
	            });
        	}
        	else {
        		callback(null,null);
        	}
            
        },
        function(callback) {

        	if(evenTypes.indexOf('events') > -1) {
        		db.collection(config.coll_events).find({
        			rtr : { $gte :  beginDate, $lte : endDate}                             
	            },{_id:0}, function(err, result) {
	                db.close();
	                if (!err) {
	                    callback(err, result)
	                } else {
	                	logger.error(common.getErrorMessageFrom(err));
	                    callback(err, result)
	                }
	            });	
        	}
        	else {
        		callback(null,null);
        	}
        }
    ], function(err, resultset) {

    	// assign [] if resultset is null
    	for(let r=0; r<resultset.length; r++){
    		resultset[r]  = resultset[r] == null ? '[]':resultset[r];	
    	}
    	
		// array for filenames
		let filenameArray = ['begins'+fileExtension,'ends'+fileExtension,'crashes'+fileExtension,'screens'+fileExtension,'events'+fileExtension];

		//genrate files to write data
		if(fileExtension == '.csv'){
			if(evenTypes.indexOf('crashes') > -1){
				for(let m=0; m<resultset[2].length; m++) {
					resultset[2][m].val.est = (resultset[2][m].val.est).replace(/\s+/g, "");
				}	
			}

			for(let i=0;i<filenameArray.length;i++){
				jsonexport(resultset[i],function(err, csv){
				    if(err)  logger.error(common.getErrorMessageFrom(err));
				    
				    fs.writeFile('./'+filenameArray[i], csv, function(err) {
					    if(err) {
					        logger.error(common.getErrorMessageFrom(err));
					    }
					});
				});
			}		
		
		}else{
			for(let i=0;i<filenameArray.length;i++){
				fs.writeFile('./'+filenameArray[i], JSON.stringify(resultset[i]), function(err) {
				    if(err) {
				        logger.error(common.getErrorMessageFrom(err));
				    }
				});
			}
		}
		
		//genrate file paths
		let paths = [];
		for(let k=0;k<filenameArray.length;k++){

		    if(evenTypes.indexOf(filenameArray[k].split('.')[0]) > -1){
		        paths.push({ path:'./'+filenameArray[k], name: filenameArray[k]});
		    }
		}

		//compress all files and send as response in ZIP file
		res.zip(paths,appName+new Date().getTime()+'.zip');
		
		// delete files after response is sent		
		res.on('finish', afterResponse);
		function afterResponse(){
			for(let j=0;j<filenameArray.length;j++){
				fs.unlink('./'+filenameArray[j]);
			}
		}
    	    
    });
    
}