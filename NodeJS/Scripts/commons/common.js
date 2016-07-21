var common = {};

(function(common){

        common.getIP = function(req){
            var ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.info.remoteAddress || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : '');
            return ip.split(',')[0];
        };

        common.getStartYear = function(rtr){
            /*var eventDate = new Date(0);
            eventDate.setUTCSeconds(rtr);*/
            var eventDate = new Date(rtr);
            year = eventDate.getFullYear();
            return ''+year+'0101';
        };

        common.getStartMonth = function(rtr){
            /*var eventDate = new Date(0);
            eventDate.setUTCSeconds(rtr);*/
            var eventDate = new Date(rtr);
            year = eventDate.getFullYear();
		    month = '0'.concat(eventDate.getMonth()+1).slice(-2);
            return ''+year+month+'01';
        };

        common.getStartDate = function(rtr){
            /*var eventDate = new Date(0);
            eventDate.setUTCSeconds(rtr);*/
            var eventDate = new Date(rtr);
            year = eventDate.getFullYear();
            month = '0'.concat(eventDate.getMonth()+1).slice(-2);
		    date = '0'.concat(eventDate.getDate()+1).slice(-2);
            return ''+year+month+date;
        };

	   common.getStartWeek = function(rtr){
            /*var eventDate = new Date(0);
            eventDate.setUTCSeconds(rtr);*/
            var eventDate = new Date(0);
            eventDate.setUTCSeconds(rtr);
            var weekdate = new Date(date);
            var weekbegin = eventDate.getDate() - eventDate.getDay();
            var weekday = new Date(weekdate.setDate(weekbegin));		
            return ''+weekday.getFullYear()+('0'.concat(weekday.getMonth()+1).slice(-2))+('0'.concat(weekdate.getDate()).slice(-2));
	   };

}(common));

module.exports = common;
