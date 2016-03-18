/ App Module /
var DjMessenger = angular.module('DjMessenger', [
        'ui.router',
        'ui.bootstrap',
        'DjMessenger.NavbarCtrl',
        'DjMessenger.UserCtrl',
        'DjMessenger.EmailConfirmCtrl',
        'DjMessenger.ProfileCtrl',
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
                        controller: 'UserCtrl',
                    }
                }
            })
            .state('register', {
                url: '/register',
                cache: false,
                data : { pageTitle: 'Register' },
                   views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: {
                        templateUrl: 'static/partials/register.html',
                        controller: 'UserCtrl', }
                }
            })
            .state('confirm_email', {
                url: '/confirm-email/:activationKey',
                cache: false,
                data : { pageTitle: 'Email confirmation' },
                   views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: {
                        templateUrl: 'static/partials/email_confirm.html',
                        controller: 'EmailConfirmCtrl',
                    }
                }
            })
            .state('profile', {
                url: '/profile/:userProfile',
                cache: false,
                data : { pageTitle: 'Profile' },
                   views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: {
                        templateUrl: 'static/partials/profile.html',
                        controller: 'ProfileCtrl',
                    }
                }
            })
            .state('info', {
                url: '/info',
                cache: false,
                data : { pageTitle: 'Information' },
                   views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: {
                        templateUrl: 'static/partials/info.html',
                        controller: 'ProfileCtrl',
                    }
                }
            })
            .state('contacts', {
                url: '/contacts',
                cache: false,
                data : { pageTitle: 'Contacts' },
                   views: {
                    nav: { templateUrl: 'static/partials/navbar.html' },
                    content: {
                        templateUrl: 'static/partials/contacts.html',
                    }
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

    .factory("UserService", function () {
        var loggedIn = false;
        function isLoggedIn() {
            return loggedIn;
        }
        function setIsLoggedIn(newLoggedIn) {
            loggedIn = newLoggedIn;
        }
        return {
            isLoggedIn: isLoggedIn,
            setIsLoggedIn: setIsLoggedIn,
        }
    })

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


    .controller('testApiCtrl', function ($scope, $state, serverOp) {
//        serverOp.get('user/1/')
//                .success(function (data) {
//                    console.log(data);
//                })
//                .error(function (error) {
//                    $scope.status = 'Unable to GET data: ' + error;
//                    console.log($scope.status);
//                });
//        serverOp.get('user/yura')
//                .success(function (data) {
//                    console.log(data);
//                })
//                .error(function (error) {
//                    $scope.status = 'Unable to GET data: ' + error;
//                    console.log(error);
//                });


        data = {'first_name': 'works123'};
        serverOp.update('user/', 'Test', data)
                .success(function (data) {
                    console.log(data);
                })
                .error(function (error) {
                    $scope.status = 'Unable to GET data: ' + error;
                    console.log(error);
                });

        serverOp.get('user/Test')
                .success(function (data) {
                    console.log(data);
                })
                .error(function (error) {
                    $scope.status = 'Unable to GET data: ' + error;
                    console.log(error);
                });


    })