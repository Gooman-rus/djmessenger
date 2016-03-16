angular.module('DjMessenger.ProfileCtrl', [
    'ui.router',
    'ui.bootstrap',
])

.controller('ProfileCtrl', function ($scope, $state, $stateParams, serverOp) {
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

    console.log('AAAAAAAAAA ' + $scope.user_login);

    $scope.changeProfile = function() {
        var dataToChange = {
            'first_name': $scope.user_fname,
            'last_name': $scope.user_lname,
            'email': $scope.email,
        };

        serverOp.update('user/', 'Test', dataToChange)
            .success(function (data) {
                console.log(data);
            })
            .error(function (error) {
                $scope.status = 'Unable to GET data: ' + error;
                console.log(error);
            });
    }


})