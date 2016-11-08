//require configuration
require.config({
    baseUrl :  'app/',
	waitSeconds: 500,
    paths: {
        jquery: 'assets/js/jquery-1.11.1.min',
        timeZone: 'assets/js/timezones.full.min',
        bootstrap: 'assets/js/bootstrap.min',
		sweetAlert: 'assets/js/sweetalert.min',
		angular: 'assets/js/angular.min'
		/*"angular-ui-router": '../assets/js/angular-ui-router.min'*/
    },
    shim: {
        "jquery":{
            exports:"$"
        },
        "timeZone":{
            deps : ['jquery']
        },
        "angular": {
            exports : 'angular'
        },
        'bootstrap' : {
            deps : [ 'jquery' ]
        }

    }
});
require([ 'angular', 'jquery', 'timeZone', 'bootstrap', 'sweetAlert'],
    function(angular) {
    require(['app'],
        function () {
        angular.bootstrap(document, ["AppEngage"]);
    });
});