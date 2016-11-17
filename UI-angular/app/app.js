define(['components/landingPage/controller/landingPageController','components/commons/controller/commonController'],function () {
   var appEngage = angular.module('AppEngage',['ui.router','LandingPageApp','CommonApp']);
   appEngage.constant('apiUrl', 'http://52.206.121.100/appengage');
   appEngage.config(function($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider){
      $urlRouterProvider.otherwise("/home");
      $urlMatcherFactoryProvider.caseInsensitive(true);
      $stateProvider.state("navHome",{
         url:"/home",
         views: {
            'header@': {
               templateUrl: 'app/components/landingPage/view/navbar.html'
            },
            'main@': {
               templateUrl: 'app/components/landingPage/view/landingWrapper.html'
            }
         }
      });
      $stateProvider.state("Dashboard",{
         url:"/dashboard",
         views: {
            'header@': {
               templateUrl: 'app/components/commons/view/header.html'
            },
            'nav@': {
               templateUrl: 'app/components/commons/view/verticalNav.html'
            }
         }
      });
   });
   return appEngage;
});
