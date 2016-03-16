angular.module('DjMessenger.UserCtrl', [
        'ui.router',
        'ui.bootstrap',
    ])

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