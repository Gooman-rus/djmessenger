angular.module('DjMessenger.NavbarCtrl', [
        'ui.router',
        'ui.bootstrap',
    ])

.controller('NavbarCtrl', function ($scope, $state, $location, serverOp) {
    // navbar active link
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.checkLoggedIn = function() {
        serverOp.get('user/logged_in/')
            .success(function (check) {
                $scope.logged_in = check.logged_in;
                $scope.user_login = check.username;
                console.log('Logged in = ' + $scope.logged_in);
            })
            .error(function (error) {
                $scope.status = 'Error checking logged in: ' + error;
                console.log($scope.status);
            });
    }

    $scope.checkLoggedIn();

    $scope.logout = function() {
        serverOp.get('user/logout/')
            .success(function (data) {
                $scope.checkLoggedIn();
                if ($state.current.name == 'profile')
                    $state.go('home');

                //console.log('logged out');
            })
            .error(function (error) {
                $scope.status = 'Unable to logout: ' + error;
                console.log($scope.status);
            });
    }
})