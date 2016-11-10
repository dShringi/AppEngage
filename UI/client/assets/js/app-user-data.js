var userData = angular.module('userData', []);



userData.controller('userDataCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
	
	
		$scope.fetchUserData = function(){
			console.log("called");
			//alert(param1);
			$scope.username = "jainsourabh2";
			$scope.startDate = $('#sDate').val();
			$scope.endDate = $('#eDate').val();
			
			var startDate = $scope.startDate;
			var endDate = $scope.endDate;
			var username = $scope.username;
			//var oSystem = $scope.platform;
			var appKey = localStorage.getItem("appKey");
			
			
			
			
//http://52.206.121.100/appengage/fetchUserProfiles?akey=4170b44d6459bba992acaa857ac5b25d7fac6cc1&ed=1477472283&sd=1474966683&userid=jainsourabh2

			var dfrd = $q.defer();
			$http.get('http://52.206.121.100/appengage/fetchUserProfiles', 
					   
				{
					params:{userid: username,  sd: startDate, ed: endDate, akey: appKey},
					//headers: {Authorization: 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}
				}
			)
			.then(function(response) {
				
				var data = response.data;
				console.log(data);
				$scope.user = data;
				$('#graphicalData').removeClass('hide');
				$('#profileData').removeClass('hide');
				plotLineChart(data,svg, div, false, "tS", valueline, x, y, width, height);
                    
                plotLineChart(data,svg1, div1, true, "tE", valueline1, x, y, width, height);
				//console.log($scope.user);
				
			}, function(x) {
				dfrd.reject(true);
			});
			return dfrd.promise;
			
		
		};	
    
}]);








