/ App Module /
var DjMessenger = angular.module('DjMessenger', [
        'ui.router',
       // 'ui.bootstrap',
    ])

    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

        'use strict';

        $stateProvider
            .state('home', {
                url: '/',
                cache: false,
                data : { pageTitle: 'Home' },
                views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: { templateUrl: 'static/partials/home.html' }
                }
            })
            .state('login', {
                url: '/login',
                cache: false,
                data : { pageTitle: 'Login' },

                views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: {
                        templateUrl: 'static/partials/login.html',
                        controller: 'userCtrl',
                    }
                }
            })
            .state('register', {
                url: '/register',
                cache: false,
                data : { pageTitle: 'Register' },
                   views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: { templateUrl: 'static/partials/register.html' }
                }
            })
            .state('test_api', {
                url: '/test_api',
                cache: false,
                data : { pageTitle: 'Test API - GET data' },
                views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: {
                        templateUrl: 'static/partials/test_api.html',
                        controller: 'testApiCtrl',
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/');
    }])

    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
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

    .controller('navbarCtrl', function ($scope, $location, serverOp) {

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

    .controller('userCtrl', function ($scope, $state, serverOp) {

        $scope.submit = function() {
            if (!$scope.loginForm.username.$valid || !$scope.loginForm.password.$valid) {
                console.log('empty input');
                return;
            }
            var user_data = { 'username': $scope.username, 'password': $scope.password };
            serverOp.post('user/login/', user_data)
                .success(function (response) {
                    $scope.username = '';
                    $scope.password = '';
                    console.log('success login');
                    serverOp.get('user/logged_in/')
                        .success(function (check) {
                            $scope.logged_in = check.logged_in;
                            $scope.user_login = check.username;
                            $state.go('home');
                            console.log('Logged in = ' + $scope.logged_in);
                        })
                        .error(function (error) {
                            $scope.status = 'Error checking logged in: ' + error.message;
                            console.log($scope.status);
                        });
                })
                .error(function (error) {
                    $scope.status = 'Unable to logout: ' + error.message;
                    console.log($scope.status);
                });
        }


    })

    .controller('testApiCtrl', function ($scope, $state, serverOp) {
        serverOp.get('user/2/')
                .success(function (data) {
                    console.log(data);
                })
                .error(function (error) {
                    $scope.status = 'Unable to GET data: ' + error.message;
                    console.log($scope.status);
                });


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
