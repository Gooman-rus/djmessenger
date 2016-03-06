/ App Module /
var DjMessenger = angular.module('DjMessenger', [
        'ui.router',
       // 'ui.bootstrap',
    ])

    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

        'use strict';

        $stateProvider
            .state('root', {
                url: '/',
                cache: false,
                templateUrl: 'static/partials/home.html',
                data : { pageTitle: 'Home' },
                controller: 'generalCtrl',
            })
            .state('login', {
                url: '/login',
                cache: false,
                templateUrl: 'static/partials/login.html',
                data : { pageTitle: 'Login' },
                controller: 'generalCtrl',
            })
            .state('register', {
                url: '/register',
                cache: false,
                templateUrl: 'static/partials/register.html',
                data : { pageTitle: 'Register' },
                controller: 'generalCtrl',
            })
            .state('success_login', {
                url: '/success_login',
                cache: false,
                templateUrl: 'static/partials/success_login.html',
                data : { pageTitle: 'Success login' },
                controller: 'generalCtrl',
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/');
    }])

    .factory('serverOp', ['$http', function ($http) {
        var urlBase = '/api/v1/';
        var serverOp = {};
        serverOp.get = function (url) {
            return $http.get(urlBase + url);
        };
        serverOp.post = function (url, data) {
            return $http.post(urlBase + url, data);
        };
        serverOp.delete = function (url, id) {
            return $http.delete(urlBase + url + id);
        }
        serverOp.update = function(url, id, data) {
            return $http.patch(urlBase + url + id + '/', data);
        }
        return serverOp;
    }])

    // page title
    .directive('updateTitle', ['$rootScope', '$timeout',
        function($rootScope, $timeout) {
            return {
                link: function(scope, element) {
                    var listener = function(event, toState) {
                        var title = 'Default Title';
                        if (toState.data && toState.data.pageTitle) title = toState.data.pageTitle;

                        $timeout(function() {
                            element.text(title);
                        }, 0, false);
                    };

                    $rootScope.$on('$stateChangeSuccess', listener);
                }
            };
        }
    ])

    .controller('generalCtrl', function ($scope, $location, serverOp) {
        //$scope.logged_in = false;

        // navbar active link
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        serverOp.get('user/logged_in/')
        .success(function (check) {
            $scope.logged_in = check.logged_in;
            $scope.user_login = check.username;
            console.log('Logged in = ' + $scope.logged_in);
        })
        .error(function (error) {
            $scope.status = 'Error checking logged in: ' + error.message;
            console.log($scope.status);
        });

        $scope.submit = function () {
            if (!$scope.loginForm.username.$valid || !$scope.loginForm.password.$valid) {
                console.log('empty input');
                return;
            }
            var user_data = { 'username': $scope.username, 'password': $scope.password };

            serverOp.post('user/login/', user_data) // login to the server
                .success(function (response) {
                    $scope.username = '';
                    $scope.password = '';
                    console.log('success login');
                    serverOp.get('user/logged_in/')
                        .success(function (check) {
                            $scope.logged_in = check.logged_in;
                            console.log('Logged in = ' + $scope.logged_in);
                        })
                        .error(function (error) {
                            $scope.status = 'Error checking logged in: ' + error.message;
                            console.log($scope.status);
                        });
                })
                .error(function (error) {
                    $scope.status = 'Unable to login: ' + error.message;
                    console.log($scope.status);
                });
        }

        $scope.logout = function() {
            serverOp.get('user/logout/')
                .success(function (data) {
                    serverOp.get('user/logged_in/')
                        .success(function (check) {
                            $scope.logged_in = check.logged_in;
                            $scope.user_login = '';
                            console.log('Logged in = ' + $scope.logged_in);
                        })
                        .error(function (error) {
                            $scope.status = 'Error checking logged in: ' + error.message;
                            console.log($scope.status);
                        });
                    console.log('logged out');
                })
                .error(function (error) {
                    $scope.status = 'Unable to logout: ' + error.message;
                    console.log($scope.status);
                });
        }
    })


//    .controller('loginCtrl', function ($scope, serverOp) {
//        $scope.submit = function ($event) {
//            var user_data = { 'username': $scope.username, 'password': $scope.password };
//            if ($scope.name === '' || $scope.description === '') {
//                console.log('empty input');
//                return;
//            }
//            serverOp.post('user/login/', user_data)
//                .success(function (myjobs) {
////                    $scope.name = '';
////                    $scope.description = '';
////                    console.log('success login');
//                    serverOp.get('user/logged_in/')
//                        .success(function (check) {
//                            $scope.logged_in = check.logged_in;
//                            console.log('Logged in = ' + $scope.logged_in);
//                        })
//                        .error(function (error) {
//                            $scope.status = 'Error checking logged in: ' + error.message;
//                            console.log($scope.status);
//                        });
//                })
//                .error(function (error) {
//                    $scope.status = 'Unable to login: ' + error.message;
//                    console.log($scope.status);
//                });
//        }
//    })
