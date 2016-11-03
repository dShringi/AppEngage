var screenAnalytics = angular.module('screenAnalytics', []);



screenAnalytics.controller('deviceCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
	
	
		
		
     	$scope.fetchAppData = function(device,os){
	
			$scope.dt = device;	
			$scope.platform = os;
			$scope.startDate = $('#sDate').val();
			$scope.endDate = $('#eDate').val();

			 var startDate = $scope.startDate;
			 var endDate = $scope.endDate;
			 var deviceType = $scope.dt;
			 var oSystem = $scope.platform;
			 var appKey = localStorage.getItem("appKey");
			 var i;


			var dfrd = $q.defer();
			$http.get('http://52.206.121.100/appengage/fetchScreenStats', 
				{
					params:{type: deviceType, platform : oSystem, sd: startDate, ed: endDate, akey: appKey},
					//headers: {Authorization: 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}
				}
			)
			.then(function(response) {
				//console.log(response);
				//$scope.users = response.data;
				var data = response.data;
				console.log(data);
				for(var i = 0; i<data.length; i++){
					
					var tts = data[i].tts;
					var ts = data[i].ts;
					var nuu = data[i].nuu;
					
					var atsps = data[i].tts / data[i].ts;
					var atsbu = data[i].tts / data[i].nuu;
					
					
					//console.log(atsbu);
					//console.log(atsbu);
					if ( isNaN(atsps)||  atsps == Number.POSITIVE_INFINITY || atsps == Number.NEGATIVE_INFINITY || atsps === null)
						{	console.log("false atsps" +atsps);
							data[i].atsps = 0;
						}
					else{
						data[i].atsps = atsps; 
					}
					if ( isNaN(atsbu) || atsbu == Number.POSITIVE_INFINITY || atsbu == Number.NEGATIVE_INFINITY || atsbu === null)
						{
							
							console.log("false atsbu" +atsbu);
							data[i].atsbu = 0;
						} 
					else{	
/*							console.log("true" +atsps);
						 	console.log("true" +atsbu);
						
							data[i].atsps = atsps; */
						
							data[i].atsbu = atsbu;
						}
				}
				 //console.log(data);
				//console.log(JSON.stringify(data));
				$scope.users = data;
				
			}, function(x) {
				dfrd.reject(true);
			});
			return dfrd.promise;
			
	 };
    
}]);



screenAnalytics.filter('secondsToHHmmss', function($filter) {
    return function(seconds) {
        return $filter('date')(new Date(0, 0, 0).setSeconds(seconds), 'HH:mm:ss');
    };
})


screenAnalytics.filter('ifEmpty', function() {
    return function(input, defaultValue) {
        if (angular.isUndefined(input) || input === null || input === '') {
            return defaultValue;
        }

        return input;
    }
});




