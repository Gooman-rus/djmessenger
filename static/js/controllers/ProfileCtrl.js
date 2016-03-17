angular.module('DjMessenger.ProfileCtrl', [
    'ui.router',
    'ui.bootstrap',
])

.controller('ProfileCtrl', function ($scope, $state, $stateParams, $timeout, $filter, serverOp) {
    $scope.wrongUserProfile = true;
    $scope.currentUser = true;
    $scope.showProfile = true;
    $scope.namePattern = "([a-zA-Z ,.'-]{2,30}\s*)+";

    $scope.editProfile = function() {
        $scope.showProfile = false;
    }


    $scope.closeAlert = function() {
        $scope.showMessage = false;
    }

    $scope.showAlert = function (message) {
        $scope.showMessage = true;
        $scope.infoMessage = message;
        $timeout(function() {
            $scope.closeAlert();
        }, 5000);
    }

    $scope.closeAlert();

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
                        $scope.last_login = $filter('date')(data.last_login, 'dd MMM hh:mm', '+0600');
                        $scope.user_hash = data.userprofile.avatar;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to GET data: ' + error;
                        console.log($scope.status);
                        $state.go('home');
                    });

                $scope.changeProfile = function() {

                    var dataToChange = {
                        'first_name': $scope.user_fname,
                        'last_name': $scope.user_lname,
                        'email': $scope.user_email,
                    };

                    if (!$scope.editProfileForm.user_fname.$valid ||
                        $scope.editProfileForm.user_fname.$viewValue.length < 2) {
                        $scope.showAlert('Invalid first name.');
                        return;
                    }

                    if (!$scope.editProfileForm.user_lname.$valid ||
                        $scope.editProfileForm.user_lname.$viewValue.length < 2) {
                        $scope.showAlert('Invalid last name.');
                        return;
                    }

                    serverOp.update('user/', $scope.user_login, dataToChange)
                        .success(function (data) {
                            console.log(data);
                            $scope.showAlert('Your profile has been changed successfully.');
                        })
                        .error(function (error) {
                            $scope.status = 'Unable to GET data: ' + error;
                            console.log(error);
                        });

                    $scope.showProfile = true;
                }
            })
            .error(function (error) {
                $scope.status = 'Error checking logged in: ' + error.message;
                console.log($scope.status);
            });

    }

    $scope.checkLoggedIn();
})