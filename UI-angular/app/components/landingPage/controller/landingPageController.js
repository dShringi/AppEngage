define(['app','assets/js/moment-timezone-with-data-2010-2020'],function (app, moment) {
	var landingPageApp = angular.module('LandingPageApp', []);
	landingPageApp.factory('FocusWithinModal',function () {
		return {
			modalFocus : function (e) {
				/*if(($(".modal.in .tab-pane.fade.in input:last").is(":focus")||$(".modal.in .tab-pane.fade.in select:last").is(":focus"))&& (e.which || e.keyCode) == 9){
					if($(".modal.in .tab-pane.fade.in button:last").is(':disabled')){
						//$(".modal.in .tab-pane.fade.in button:first").focus();
						$(".modal.in .tab-pane.fade.in input:first").focus();
						e.preventDefault();
					}else{
						$(".modal.in .tab-pane.fade.in button:last").focus();
						e.preventDefault();
					}
				}*/
			}
		}
	});
	landingPageApp.controller("registerAppController",['$scope','$http','apiUrl','FocusWithinModal', function($scope,$http,apiUrl,FocusWithinModal){
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
		$scope.modalFocus = function (ele){
			debugger;
			FocusWithinModal.modalFocus(ele);
		};
		angular.element(document).ready(function () {
			$('#modalRegister').on('hidden.bs.modal', function (e) {
				angular.element( document.querySelector('#modalRegister #tab1')).addClass("in active");
				$("#modalRegister #tab1").fadeIn();
				angular.element( document.querySelector('#modalRegister #tab2')).removeClass("in active");
				angular.element( document.querySelector('#modalRegister #tab3')).removeClass("in active");
				angular.element( document.querySelector('.register-part01')).addClass("active-underline");
				angular.element( document.querySelector('.register-part02')).removeClass("active-underline");
				angular.element( document.querySelector('.register-part03')).removeClass("active-underline");
				sessionStorage.removeItem("unameAvailability");
				var form1=angular.element( document.querySelector('form[name="customerDetailsForm"]'));
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

			if (angular.element( document.querySelector('.register-part01')).hasClass("active-underline")) {
				angular.element( document.querySelector('.register-part01')).removeClass("active-underline");
				angular.element( document.querySelector('.register-part02')).addClass("active-underline");
			}
			else {
				angular.element( document.querySelector('.register-part02')).removeClass("active-underline");
				angular.element( document.querySelector('.register-part03')).addClass("active-underline");
			}
		};

		this.fadeBack = function(tabcurrent, tabprev){
			$("#" + tabcurrent).removeClass("in active").fadeOut();
			$("#" + tabprev).css("display", "block");
			$("#" + tabprev).addClass("in active").fadeIn();

			if (angular.element( document.querySelector('.register-part02')).hasClass("active-underline")) {
				angular.element( document.querySelector('.register-part02')).removeClass("active-underline");
				angular.element( document.querySelector('.register-part01')).addClass("active-underline");
			}
			else {
				angular.element( document.querySelector('.register-part03')).removeClass("active-underline");
				angular.element( document.querySelector('.register-part02')).addClass("active-underline");
			}
		};
		/*Register user ajax call*/
		this.registerUser = function(dataModel){

			debugger;
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
	}]);
	landingPageApp.directive('usernameAvailable',function ($timeout, $q, $http) {
		return {
			restrict: 'AE',
			require: 'ngModel',
			link: function (scope, elm, attr, model) {
				scope.$watch(attr.ngModel, function(uname) {
					/*Validate user name ajax call*/
					$http({
						method: "GET",
						url: "http://52.206.121.100/appengage/getUserNameValidated",
						contentType: "application/json",
						dataType: "json",
						timeout: 180000,  //180 sec
						params: {'username': uname}
					}).success(function(res){
						sessionStorage.setItem('unameAvailability',res.msg);
						$timeout(function(){
							if(res.msg=="Success"){
								model.$setValidity('usernameExists', true);
							}else{
								model.$setValidity('usernameExists', false);
							}
						}, 1000);
					}).error(function (x, t, m) {
						alert("Error connecting to server");
						if (t === "timeout") {
							alert("timeout");
						} else {
							//alert(t);
						}
					});
				});
			}
		}
	});
	landingPageApp.controller('loginController',['$scope', '$http','apiUrl', function ($scope, $http, apiUrl) {
		this.loginData={
			username:"",
			password:""
		};
		/*Login Validate ajax call*/
		this.validateUser = function (uname, pwd) {
			$http({
				method:'GET',
				url: apiUrl+"/getUserValidated",
				timeout: 180000,  //180 sec
				params: {"username":uname, "password": pwd}
			}).success(function(data){
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