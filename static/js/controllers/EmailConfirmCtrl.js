angular.module('DjMessenger.EmailConfirmCtrl', [
    'ui.router',
    'ui.bootstrap',
])

.controller('EmailConfirmCtrl', function ($scope, $state, $stateParams, serverOp) {
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