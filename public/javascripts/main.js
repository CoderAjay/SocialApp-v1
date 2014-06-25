var app = angular.module('myApp', []);

app.directive('networkLogin', ['$http',
    function($http) {
        // Runs during compile
        return {
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: '/views/login.html',
            scope: {},
            controller: function($scope) {
                $scope.network_data = {};

            },
            link: function($scope, iElm, iAttrs, controller) {
                $scope.network_data = {
                    network: iAttrs.network,
                    action: iAttrs.action
                };


            }
        };
    }
]);
app.directive('networkAction',['$http',
    function($http) {
        return {
            restrict: 'E',
            scope: {},
            require: '^?networkLogin',
            templateUrl: '/views/action.html',
            controller: function($scope) {
                $scope.getData = function(network_data) {
                   $http.post('/api/social',network_data)
                       .success(function(data, status) { console.log(status);console.log(data);})
                       .error(function(data, status) {console.log(status+data); });
                }
            },
            link: function($scope, iElm, iAttrs, controller) {
                $scope.network_data = {
                    network: iAttrs.network,
                    action: iAttrs.action
                };
                console.log($scope.network_data);
            }

        }
    }]);
