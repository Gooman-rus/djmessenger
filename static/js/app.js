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
            })
            .state('login', {
                url: '/login',
                cache: false,
                templateUrl: 'static/partials/login.html',
                data : { pageTitle: 'Login' },
            })
            .state('register', {
                url: '/register',
                cache: false,
                templateUrl: 'static/partials/register.html',
                data : { pageTitle: 'Register' },
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/');
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

    // navbar active link
    .controller('navbarController', function ($scope, $location) {
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
    })