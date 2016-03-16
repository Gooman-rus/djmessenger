/ App Module /
var DjMessenger = angular.module('DjMessenger', [
        'ui.router',
        'ui.bootstrap',
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
                        controller: 'emailConfirmCtrl', }
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
                        controller: 'profileCtrl', }
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

//    .controller('NavbarCtrl', function ($scope, $state, $location, serverOp) {
//        // navbar active link
//        $scope.isActive = function (viewLocation) {
//            return viewLocation === $location.path();
//        };
//
//        $scope.checkLoggedIn = function() {
//            serverOp.get('user/logged_in/')
//                .success(function (check) {
//                    $scope.logged_in = check.logged_in;
//                    $scope.user_login = check.username;
//                    console.log('Logged in = ' + $scope.logged_in);
//                })
//                .error(function (error) {
//                    $scope.status = 'Error checking logged in: ' + error;
//                    console.log($scope.status);
//                });
//        }
//
//        $scope.checkLoggedIn();
//
//        $scope.logout = function() {
//            serverOp.get('user/logout/')
//                .success(function (data) {
//                    $scope.checkLoggedIn();
//                    if ($state.current.name == 'profile')
//                        $state.go('home');
//
//                    //console.log('logged out');
//                })
//                .error(function (error) {
//                    $scope.status = 'Unable to logout: ' + error;
//                    console.log($scope.status);
//                });
//        }
//    })

    .controller('UserCtrl', function ($scope, $state, $timeout, serverOp) {
        $scope.registerSuccess = false;

        $scope.checkLoggedIn = function() {
            serverOp.get('user/logged_in/')
                .success(function (check) {
                    $scope.logged_in = check.logged_in;
                    $scope.user_login = check.username;
                    if ($scope.logged_in) {
                        $state.go('home');
                    }

                    console.log('Logged in = ' + $scope.logged_in);
                })
                .error(function (error) {
                    $scope.status = 'Error checking logged in: ' + error.message;
                    console.log($scope.status);
                });
        }

        $scope.checkLoggedIn();

        $scope.showAlert = function (message) {
            $scope.showError = true;
            $scope.errorMessage = message;
            $timeout(function() {
                $scope.showError = false;
            }, 5000);
        }

        $scope.closeAlert = function() {
            $scope.showError = false;
        }

        $scope.closeAlert();

        $scope.submitLoginForm = function() {
            if (!$scope.loginForm.username.$valid) {
                $scope.showAlert('Invalid username.');
                return;
            }
            if (!$scope.loginForm.password.$valid) {
                $scope.showAlert('Invalid password.');
                return;
            }
            var user_data = { 'username': $scope.username, 'password': $scope.password };
            serverOp.post('user/login/', user_data)
                .success(function (response) {
                    $scope.username = '';
                    $scope.password = '';
                    $scope.checkLoggedIn();
                })
                .error(function (error) {
                    $scope.status = 'Unable to login: ' + error.reason;
                    if (error.reason == 'incorrect') {
                        $scope.showAlert("Username or Password is incorrect.");
                    }
                    if (error.reason == 'disabled') {
                        $scope.showAlert('User <' + $scope.username + '> is inactive.');
                    }
                });
        }

        $scope.submitRegisterForm = function() {
            if (!$scope.registerForm.username.$valid) {
                $scope.showAlert('Invalid username.');
                return;
            }
            if (!$scope.registerForm.email.$valid) {
                $scope.showAlert('Invalid email.');
                return;
            }
            if (!$scope.registerForm.password.$valid) {
                $scope.showAlert('Invalid password.');
                return;
            }
            if ($scope.registerForm.password.$viewValue != $scope.registerForm.password_confirm.$viewValue) {
                $scope.showAlert('Passwords does not equal.');
                return;
            }
            if (!$scope.registerForm.rulesConfirm.$viewValue) {
                $scope.showAlert('You should accept the rules.');
                return;
            }

            var user_data = {
                'username': $scope.username,
                'password': $scope.password,
                'email': $scope.email,
                'first_name': 'N/A',
                'last_name': 'N/A'
            };
            serverOp.post('create_user/', user_data)
                .success(function (response) {
                    $scope.registerForm.$setPristine();
                    $scope.checkLoggedIn();
                    $scope.registerSuccess = true;
                })
                .error(function (eResponse) {
                    $scope.status = 'Unable to register: ' + eResponse;
                    if (eResponse.error)
                        $scope.showAlert(eResponse.error.message);
                    else {
                        $scope.showAlert('Internal server error');
                        console.log(eResponse.error_message);
                    }
                });
        }

    })


    .controller('emailConfirmCtrl', function ($scope, $state, $stateParams, serverOp) {
        if (!$stateParams.activationKey) {
            $state.go('home');
            return
        }

        $scope.checkLoggedIn = function() {
            serverOp.get('user/logged_in/')
                .success(function (check) {
                    $scope.logged_in = check.logged_in;
                    $scope.user_login = check.username;
                    if ($scope.logged_in) {
                        $state.go('home');
                    }

                    console.log('Logged in = ' + $scope.logged_in);
                })
                .error(function (error) {
                    $scope.status = 'Error checking logged in: ' + error.message;
                    console.log($scope.status);
                });
        }

        $scope.checkLoggedIn();



        serverOp.get('user/confirm_email/' + $stateParams.activationKey + '/')
                .success(function (check) {
                    if (check.success == true)
                        $scope.successActivation = true;
                    else {
                        $scope.successActivation = false;
                        if (check.reason == 'expired') {
                            $scope.errorMessage = 'The activation period has been expired. Resend email link.';
                        }
                        if (check.reason == 'already activated') {
                            $scope.errorMessage = 'Your have already activated your account. Now you can login.';
                        }
                    }

                })
                .error(function (error) {
                    $scope.successActivation = false;
                    $scope.errorMessage = 'Wrong activation link. Please contact with support.';
                });

    })

    .controller('profileCtrl', function ($scope, $state, $stateParams, serverOp) {
        $scope.wrongUserProfile = true;
        $scope.currentUser = true;

        $scope.checkLoggedIn = function() {
            serverOp.get('user/logged_in/')
                .success(function (check) {
                    $scope.logged_in = check.logged_in;
                    $scope.user_login = check.username;
                    if (!$scope.logged_in) {
                        $state.go('login');
                    }
                    if ($stateParams.userProfile) {
                        $scope.user_login = $stateParams.userProfile;
                        $scope.currentUser = false;
                    }
                    serverOp.get('user/' + $scope.user_login)
                        .success(function (data) {
                            $scope.wrongUserProfile = false;
                            $scope.user_fname = data.first_name;
                            $scope.user_lname = data.last_name;
                            $scope.user_email = data.email;
                            //$scope.user_joined = data.date_joined;
                            $scope.last_login = data.last_login;
                            $scope.user_hash = data.userprofile.avatar;
                        })
                        .error(function (error) {
                            $scope.status = 'Unable to GET data: ' + error;
                            console.log($scope.status);
                            $state.go('home');
                        });
                })
                .error(function (error) {
                    $scope.status = 'Error checking logged in: ' + error.message;
                    console.log($scope.status);
                });

        }
        $scope.checkLoggedIn();

        $scope.showProfile = true;

        $scope.editProfile = function() {
            $scope.showProfile = false;
        }


    })

    .controller('testApiCtrl', function ($scope, $state, serverOp) {
//        serverOp.get('user/1/')
//                .success(function (data) {
//                    console.log(data);
//                })
//                .error(function (error) {
//                    $scope.status = 'Unable to GET data: ' + error;
//                    console.log($scope.status);
//                });
        serverOp.get('user/yura')
                .success(function (data) {
                    console.log(data);
                })
                .error(function (error) {
                    $scope.status = 'Unable to GET data: ' + error;
                    console.log(error);
                });




    })