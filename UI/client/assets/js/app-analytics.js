var screenAnalytics = angular.module('screenAnalytics', []);



screenAnalytics.controller('deviceCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
		
     	$scope.fetchAppData = function(device){
	
			$scope.dt = device;		 
			$scope.startDate = $('#sDate').val();
			$scope.endDate = $('#eDate').val();

			 var startDate = $scope.startDate;
			 var endDate = $scope.endDate;
			 var deviceType = $scope.dt;
			 var appKey = localStorage.getItem("appKey");


			var dfrd = $q.defer();
			$http.get('http://52.206.121.100/appengage/fetchScreenStats', 
				{
					params:{type: deviceType, sd: startDate, ed: endDate, akey: appKey},
					//headers: {Authorization: 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}
				}
			)
			.then(function(response) {
				//console.log('get',response);
				$scope.users = response.data;
				$('.photos').coverflow();

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
/*
screenAnalytics.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}])*/



