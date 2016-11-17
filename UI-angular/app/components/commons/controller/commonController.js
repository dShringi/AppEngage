define(['app'],function (app) {
    var commonApp = angular.module("CommonApp",[]);
    commonApp.controller('verticalNavController', ['$scope', function ($scope) {
        $scope.state = false;
        $scope.slideMenubar = function () {
            debugger;
            $scope.state = !$scope.state;
        };
    }]);
    commonApp.directive('sidebarDirective', function() {
        return {
            link : function(scope, element, attr) {
                scope.$watch(attr.sidebarDirective, function(newVal) {
                    if(newVal)
                    {
                        element.addClass('vertical-nav50');
                        angular.element(document.querySelector('.headerClass')).addClass('margin-left50');
                        return;
                    }
                    element.removeClass('vertical-nav50');
                    angular.element(document.querySelector('.headerClass')).removeClass('margin-left50');
                });
            }
        };
    });
    return commonApp;
});