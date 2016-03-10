angular.module('goodReadsAddict.com')

	.controller('globalController',['$scope','DynamicPageInfoFactory','$rootScope', function($scope, DynamicPageInfoFactory,$rootScope) {
    $scope.dynamicPageInfo = DynamicPageInfoFactory;
	$rootScope.baseAPISearchURL = "http://localhost:8081/goodReadsAddict/v1/";

    if(localStorage["loggedIn"])
	{
		$rootScope.loggedInUser = localStorage["loggedInUser"] ;
		$rootScope.loggedEmail = localStorage["loggedEmail"];
		$rootScope.loggedAPIKey = localStorage["loggedAPIKey"];
		$rootScope.userRestricted = localStorage["userRestricted"];
	}

  }]);