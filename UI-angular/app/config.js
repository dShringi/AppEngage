//require configuration
require.config({
    baseUrl :  'app/',
	waitSeconds: 500,
    paths: {
        jquery: 'assets/js/jquery-1.11.1.min',
        moment:'assets/js/moment.min',
        bootstrap: 'assets/js/bootstrap.min',
		sweetAlert: 'assets/js/sweetalert.min',
		angular: 'assets/js/angular.min',
		"ui-router": 'assets/js/angular-ui-router.min'
    },
    shim: {
        "jquery":{
            exports:"$"
        },
        "angular": {
            exports : 'angular'
        },
        "ui-router":{
            exports: 'uiRouter',
            deps : ['angular']
        },
        'bootstrap' : {
            deps : [ 'jquery' ]
        }
    }
});
require([ 'angular', 'ui-router', 'jquery', 'bootstrap', 'sweetAlert'],
    function(angular, uiRouter) {
    require(['app'],
        function () {
            angular.bootstrap(document, ["AppEngage"]);
        });
});