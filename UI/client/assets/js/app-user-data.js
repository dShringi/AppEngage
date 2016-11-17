var userData = angular.module('userData', []);



userData.controller("SalesController", ["$scope", function($scope) {
 
	
}]);

userData.controller('userDataCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
	
		
		 /*$scope.salesData = [
			{date: 1,sales: 54},
			{date: 2,sales: 66},
			{date: 3,sales: 77},
			{date: 4,sales: 70},
			{date: 5,sales: 60},
			{date: 6,sales: 63},
			{date: 7,sales: 55},
			{date: 8,sales: 47},
			{date: 9,sales: 55},
			{date: 10,sales: 30}
		  ];*/
		
	
		//$scope.salesData = [];
		$scope.fetchUserData = function(user){
			console.log("called");
			console.log(user);
			
			$scope.username = user;
			$scope.startDate = $('#sDate').val();
			$scope.endDate = $('#eDate').val();
			
			var startDate = $scope.startDate;
			var endDate = $scope.endDate;
			var username = $scope.username;
			//var oSystem = $scope.platform;
			var appKey = localStorage.getItem("appKey");
			

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
				
				//plotLineChart(data,svg, div, false, "tS", valueline, x, y, width, height);
				for(var i = 0; i<data.length; i++){
					console.log("for loop");
					 $scope.salesData = [
							{date: data[i].tS.dt, sales: data[i].tS.s}
						 ];
					console.log(salesData);
				};  
				
			}, function(x) {
				dfrd.reject(true);
			});
			return dfrd.promise;
			
		
		};	
    
}]);


userData.directive('linearChart', function($window){
   return{
      restrict:'EA',
      template:"<svg width='850' height='200'></svg>",
       link: function(scope, elem, attrs){
           var salesDataToPlot=scope[attrs.chartData];
		   console.log(salesDataToPlot);
           var padding = 20;
           var pathClass="path";
           var xScale, yScale, xAxisGen, yAxisGen, lineFun;

           var d3 = $window.d3;
           var rawSvg=elem.find('svg');
           var svg = d3.select(rawSvg[0]);

           function setChartParameters(){

               xScale = d3.scale.linear()
                   .domain([salesDataToPlot[0].date, salesDataToPlot[salesDataToPlot.length-1].date])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(salesDataToPlot, function (d) {
                       return d.sales;
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .orient("bottom")
                   .ticks(salesDataToPlot.length - 1);

               yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5);

               lineFun = d3.svg.line()
                   .x(function (d) {
                       return xScale(d.date);
                   })
                   .y(function (d) {
                       return yScale(d.sales);
                   })
                   .interpolate("basis");
           }
         
         function drawLineChart() {

               setChartParameters();

               svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(0,180)")
                   .call(xAxisGen);

               svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(20,0)")
                   .call(yAxisGen);

               svg.append("svg:path")
                   .attr({
                       d: lineFun(salesDataToPlot),
                       "stroke": "blue",
                       "stroke-width": 2,
                       "fill": "none",
                       "class": pathClass
                   });
           }

           drawLineChart();
       }
   };
});








