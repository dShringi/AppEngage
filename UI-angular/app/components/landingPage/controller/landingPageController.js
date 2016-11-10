define(['app','assets/js/moment-timezone-with-data-2010-2020'],function (app, moment) {
	var landingPageApp = angular.module('LandingPageApp', []);
	landingPageApp.controller("registerAppController",['$scope','$http','apiUrl', function($scope,$http,apiUrl){
		this.registerAppDetails={
			"user": {
				"fn": "",
				"ln": "",
				"email": "",
				"phone": "",
				"uname": "",
				"pass": ""
			},
			"app": {
				"name": "",
				"ctg": "",
				"desc": "",
				"icon": "",
				"tz": "",
				"to": ""
			}
		};
		$scope.timeZones = moment.tz.names();
		$scope.originForm = angular.copy(this.registerAppDetails);
		angular.element(document).ready(function () {
			$('#modalRegister').on('hidden.bs.modal', function (e) {
				$("#modalRegister #tab1").addClass("in active").fadeIn();
				$("#modalRegister #tab2").removeClass("in active");
				$("#modalRegister #tab3").removeClass("in active");
				$(".register-part01").addClass("active-underline");
				$(".register-part02").removeClass("active-underline");
				$(".register-part03").removeClass("active-underline");
				$("#uname-check").css("opacity", "0");
				sessionStorage.removeItem("unameAvailability");
				var form1=$('form[name="customerDetailsForm"]');
				$scope.$apply(function(form1){
					if(form1!=undefined){
						form1.customerDetailsForm.$setPristine();
						form1.appDetailsForm.$setPristine();
					}
					$scope.registerAppCtrl.registerAppDetails = angular.copy($scope.originForm);
				});
			});
		});
		$scope.imageUpload = function(event){
			readURL(event.srcElement,this.registerAppCtrl.registerAppDetails);
		};
		function readURL(input, model) {
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					model.app.icon=e.target.result;
					debugger;
					$('#reg-appicon').val(model.app.icon);
					$("#appicon-img").attr('src', model.app.icon);
					$("#appicon-img").attr("alt", model.app.icon);
				}
				reader.readAsDataURL(input.files[0]);
			}
		};

		this.fadeProceed = function(tabcurrent, tabnext){
			$("#" + tabcurrent).fadeOut().removeClass("in active");
			$("#" + tabnext).fadeIn().addClass("in active");

			if ($(".register-part01").hasClass("active-underline")) {
				$(".register-part01").removeClass("active-underline");
				$(".register-part02").addClass("active-underline");
			}
			else {
				$(".register-part02").removeClass("active-underline");
				$(".register-part03").addClass("active-underline");
			}
		};

		this.fadeBack = function(tabcurrent, tabprev){
			$("#" + tabcurrent).removeClass("in active").fadeOut();
			$("#" + tabprev).css("display", "block");
			$("#" + tabprev).addClass("in active").fadeIn();

			if ($(".register-part02").hasClass("active-underline")) {
				$(".register-part02").removeClass("active-underline");
				$(".register-part01").addClass("active-underline");
			}
			else {
				$(".register-part03").removeClass("active-underline");
				$(".register-part02").addClass("active-underline");
			}
		};
		/*Register user ajax call*/
		this.registerUser = function(dataModel){
			$http({
				method: "POST",
				url: apiUrl+"/registerUser",
				contentType: "application/json",
				datatype: "json",
				timeout: 180000,
				data: JSON.stringify(dataModel)
			}).success(function(data){
				console.log(data);
				$("#modalRegister").modal('hide');
				swal({
					title: 'Congratulations!',
					text: '<p style="font-size:14px; padding-top: 30px;">You have successfully registered with us.</p>' +
					'<p style="font-size:14px;">Your application key is -</p>' +
					'<h3>'+data.akey+'</h3>',
					html: true
				});
			}).error(function(x, t, m){
				alert("Error connecting to server");
				if (t === "timeout") {
					alert("timeout");
				} else {
					alert(t);
				}
			});
		};

		/*Validate user name ajax call*/

		this.validateUname = function (uname) {
			$http({
			 method: "GET",
			 url: apiUrl+"/getUserNameValidated",
			 contentType: "application/json",
			 dataType: "json",
			 timeout: 180000,  //180 sec
			 params: {'username': uname}
			 }).success(function(data){
				console.log(JSON.stringify(data));
			 	sessionStorage.setItem("unameAvailability", data.msg);
			 if ($("#reg-uname").val() === "") {
			 	$("#uname-check").css("display", "none");
			 }
			 else if (data.msg === "Success") {
				 $("#uname-check i.fa").removeClass("fa-close").addClass("fa-check");
				 $("#uname-check").css({"display":"block","color":"#33cc33"});
				 $("#uname-check #avail-message").html("&nbsp;&nbsp;This username is available");
			 }
			 else {
				 $("#uname-check i.fa").removeClass("fa-check").addClass("fa-close");
				 $("#uname-check").css({"display":"block","color":"#ff3300"});
				 $("#uname-check #avail-message").html("&nbsp;&nbsp;This username is taken");
			 }
			 }).error(function (x, t, m) {
			 	alert("Error connecting to server");
			 if (t === "timeout") {
				 alert("timeout");
			 } else {
				 //alert(t);
			 }
			 });
		};
	}]);
	landingPageApp.controller('loginController',['$scope', '$http','apiUrl', function ($scope, $http, apiUrl) {
		this.loginData={
			username:"",
			password:""
		};
		/*Login Validate ajax call*/
		this.validateUser = function (uname, pwd) {
			debugger;
			$http({
				method:'GET',
				url: apiUrl+"/getUserValidated",
				timeout: 180000,  //180 sec
				params: {"username":uname, "password": pwd}
			}).success(function(data){
				debugger;
				console.log(data);
				if (data.msg === "Success") {
					localStorage.setItem("userName", data.name);
					localStorage.setItem("appKey", data.akey);
					window.location.href = "index.html";
				}
				else {
					alert("Login Failed");
				}
			}).error(function(x, t, m){
				debugger;
				alert("Error connecting to server");
				if (t === "timeout") {
					alert("timeout");
				} else {
					//alert(t);
				}
			});
		}
	}]);
	return landingPageApp;
});