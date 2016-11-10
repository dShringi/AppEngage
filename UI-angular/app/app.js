define(['components/landingPage/controller/landingPageController'],function () {
   var appEngage = angular.module('AppEngage',['ui.router','LandingPageApp']);
   appEngage.constant('apiUrl', 'http://52.206.121.100/appengage');
   appEngage.config(function($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider){
      $urlRouterProvider.otherwise("/home");
      $urlMatcherFactoryProvider.caseInsensitive(true);
      $stateProvider.state("navHome",{
         url:"/home",
         views: {
            'nav@': {
               templateUrl: 'app/components/landingPage/view/navbar.html'
            },
            'main@': {
               templateUrl: 'app/components/landingPage/view/landingWrapper.html'
            }
         }
      });
   });
   return appEngage;
});
