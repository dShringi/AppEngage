var routerApp =  angular.module("AppEngage",['ui.router']);
routerApp.config(function($stateProvider){
	$stateProvider.state("registerApp",{
		url:"/registerApp"
	})
});