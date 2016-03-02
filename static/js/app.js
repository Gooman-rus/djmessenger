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
            })
            .state('login', {
                url: '/login',
                cache: false,
                templateUrl: 'static/partials/login.html',
            })
            .state('register', {
                url: '/register',
                cache: false,
                templateUrl: 'static/partials/register.html',
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/');
    }])