angular.module('DjMessenger.ProfileCtrl', [
    'ui.router',
    'ui.bootstrap',
])

.controller('ProfileCtrl', function ($scope, $state, $stateParams, $timeout, $filter, serverOp, UserService) {
    $scope.setIsLoggedIn = UserService.setIsLoggedIn;
    $scope.wrongUserProfile = true;
    $scope.currentUser = true;
    $scope.showProfile = true;
    $scope.dataLoaded = true;
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
                    return;
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
                        $scope.last_login = $filter('date')(data.last_login, 'dd MMM HH:mm', '+0600');
                        $scope.user_hash = data.userprofile.avatar;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to GET data: ' + error;
                        console.log($scope.status);
                        $state.go('home');
                        return;
                    });

                $scope.emailChanged = false;
                $scope.successEmailChange = false;

                $scope.changeProfile = function(emailChanged) {

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

                    $scope.dataLoaded = false;
                    serverOp.update('user/', $scope.user_login, dataToChange)
                        .success(function (data) {
                            console.log(data);
                            $scope.dataLoaded = true;
                            $scope.showAlert('Your profile has been changed successfully.');

                            if (emailChanged) {
                                serverOp.get('user/logout/')
                                    .success(function (data) {
                                        $scope.successEmailChange = true;
                                        $scope.showProfile = false;
                                        $scope.setIsLoggedIn(false);
                                    })
                                    .error(function (error) {
                                        $scope.status = 'Unable to logout: ' + error;
                                        console.log($scope.status);
                                    });
                                $scope.successEmailChange = true;
                            }
                        })
                        .error(function (error) {
                            $scope.status = 'UPDATE error: ' + error;
                            console.log(error);
                        });

                    $scope.emailChanged = false;
                    $scope.showProfile = true;

                    $scope.$watch(function () { return UserService.isLoggedIn(); }, function (value) {
                        $scope.logged_in = value;
                    });
                }
            })
            .error(function (error) {
                $scope.status = 'Error checking logged in: ' + error.message;
                console.log($scope.status);
            });

    }

    $scope.checkLoggedIn();
})