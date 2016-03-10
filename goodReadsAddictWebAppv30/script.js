/*
goodReadsAddict.com Angular SPA
Authors: Himanshu 

This script manage goodReadsAddict.com SPA with goodReadsAddict API on localhost Port 8081

Please change the IP address of the server where API is been generated from
In this case we are running from local computer for with its IP address must pe replaced at (localhost)
Line 399 & 421 for $rootScope.baseAPISearchURL

For Admin Setup
-Register a user 
-Goto Mongo DB 
-Edit User_Profile > userType = 'admin'
-Then Log in with admin user
*/

/*
Creating an Angular App and routing.
*/
var bookApp = angular.module('goodReadsAddict.com', ['ngResource', 'ngRoute', 'ngSanitize', 'ngCookies']);
bookApp.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'ui/login.html',
      controller: 'loginController'
    })
    .when('/search', {
      templateUrl: 'ui/search.html',
      controller: 'searchController'
    })
	.when('/profile', {
      templateUrl: 'ui/profile.html',
      controller: 'profileController'
    })
	.when('/favorites', {
      templateUrl: 'ui/favorites.html',
      controller: 'favController'
    })
	.when('/read', {
      templateUrl: 'ui/read.html',
      controller: 'readController'
    })
	.when('/admin', {
      templateUrl: 'ui/admin/index.html',
      controller: 'adminController'
    })
	.when('/adminProfile', {
      templateUrl: 'ui/admin/profile.html',
      controller: 'adminProfileController'
    })
	.when('/signUp', {
      templateUrl: 'ui/signUp.html',
      controller: 'signUpController'
    })
	.when('/changePassword', {
      templateUrl: 'ui/changePassword.html',
      controller: 'changePasswordController'
    })
	.when('/adminChangePassword', {
      templateUrl: 'ui/admin/changePassword.html',
      controller: 'adminChangePasswordController'
    })
    .when('/docs', {
    	templateUrl: 'ui/docs.html',
    	controller:'docsController'
    })
    .when('/error', {
    	templateUrl: 'ui/error.html'
    })
}).constant('SiteName','goodReadsAddict')
.value('Navigation', {
	0: {title:'Search', path: '/search'},
	1: {title:'To Read', path: '/read'},
	2: {title:'Favourites', path: '/favourites'}
});

/*
Defining Angular Controllers
*/
bookApp.controller('searchController',['$rootScope', '$scope', '$window', '$http', '$sce', '$location', '$cookies', 'DynamicPageInfoFactory', function ($rootScope, $scope, $window, $http, $sce, $location, $cookies,DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();

	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
	};
	$scope.startIndex = 0;
	$scope.maxResults = 10;
	$scope.numberOfPages = 0;
	$scope.nop = [];
	$scope.totalResults = 0;
	$scope.bookDetailsPage = false;
    $scope.doSearch = function () {
		$scope.searchQuery = "";
		$scope.bookDetailsPage = false;
		$scope.totalResults = 0;
		$scope.bookSearch = "";
		$scope.isbnSearch = "";
		$scope.both = false;
		$scope.noSearch = true;
		$scope.error = false;
		$scope.currentPage = 1, $scope.numPerPage = 10, $scope.maxSize = 6;
		$scope.startRange = 1, $scope.endRange = 5;
		if($scope.bookName&&$scope.isbn) {
			$query = $rootScope.baseAPISearchURL + "search?title=" + $scope.bookName + "&isbn=" + $scope.isbn + "&startIndex=" + $scope.startIndex + "&maxResults=" + $scope.maxResults + "&apiKey=" + $rootScope.loggedAPIKey;
			$scope.searchQuery = $rootScope.baseAPISearchURL + "search?title=" + $scope.bookName + "&isbn=" + $scope.isbn;
			$http.get($query).success(function(response) {
				console.log(response);
				$scope.restricted = response.restricted;
				$rootScope.userRestricted = response.restricted;
				$cookies.globalRestricted = response.restricted;
				$scope.noSearch = false;
				$scope.both = true;
				$scope.bookSearch  = $scope.bookName;
				$scope.isbnSearch = $scope.isbn;
				$scope.totalResults = response.totalItems;
				$scope.bookResults = response.items;
				$scope.orderProp = 'volumeInfo.title';
				$scope.numberOfPages = Math.ceil($scope.totalResults/$scope.maxResults);
				$scope.pagination();
			}).error(function(response) {
				$location.path("/error");
			});
		}
		else if($scope.bookName) {
			$query = $rootScope.baseAPISearchURL + "search?title=" + $scope.bookName + "&startIndex=" + $scope.startIndex + "&maxResults=" + $scope.maxResults + "&apiKey=" + $rootScope.loggedAPIKey;
			$scope.searchQuery = $rootScope.baseAPISearchURL + "search?title=" + $scope.bookName;
			$http.get($query).success(function(response) {
				$scope.restricted = response.restricted;
				$rootScope.userRestricted = response.restricted;
				$cookies.globalRestricted = response.restricted;
				$scope.noSearch = false;
				$scope.bookSearch  = $scope.bookName;
				$scope.totalResults = response.totalItems;
				$scope.bookResults = response.items;
				$scope.orderProp = 'volumeInfo.title';
				$scope.numberOfPages = Math.ceil($scope.totalResults/$scope.maxResults);
				$scope.pagination();
			});
		}
		else if($scope.isbn) {	
			$query = $rootScope.baseAPISearchURL + "search?isbn=" + $scope.isbn + "&startIndex=" + $scope.startIndex + "&maxResults=" + $scope.maxResults + "&apiKey=" + $rootScope.loggedAPIKey;
			$scope.searchQuery = $rootScope.baseAPISearchURL + "search?isbn=" + $scope.isbn;
			$http.get($query).success(function(response) {
				$scope.restricted = response.restricted;
				$rootScope.userRestricted = response.restricted;
				$cookies.globalRestricted = response.restricted;
				$scope.noSearch = false;
				$scope.isbnSearch  = $scope.isbn;
				$scope.totalResults = response.totalItems;
				$scope.bookResults = response.items;
				$scope.orderProp = 'volumeInfo.title';
				$scope.numberOfPages = Math.ceil($scope.totalResults/$scope.maxResults);
				$scope.pagination();
			}).error(function(response) {
				$location.path("/error");
			});
		}
    }
	
	
	$scope.pagination = function() {
		if($scope.numberOfPages < $scope.maxSize) {
			$scope.maxSize = $scope.numberOfPages;
		}
		$scope.range();
	}
	
	$scope.range = function() {
		$scope.endRange = $scope.startRange + $scope.maxSize - 1;
		if($scope.endRange > $scope.numberOfPages) {
			$scope.endRange = $scope.numberOfPages;
		}
		$scope.nop = [];
		for(var i=$scope.startRange; i<=$scope.endRange; i++) { $scope.nop.push(i);}
	}
	
	$scope.next = function() {
		$scope.startRange += $scope.maxSize;
		$scope.endRange = $scope.startRange + $scope.maxSize - 1;
		if($scope.endRange >= $scope.numberOfPages) {
			$scope.endRange = $scope.numberOfPages;
		}
		$scope.pagination();
	}
	
	$scope.prev = function() {
		$scope.startRange -= $scope.maxSize;
		if($scope.startRange < 0) {
			$scope.startRange = 1;
		}
		$scope.endRange = $scope.startRange + $scope.maxSize - 1;
		$scope.pagination();
	}
	
	$scope.setCurrentPage = function(page) {
		
		if(page==1) { page = 0; }
		if(page==$scope.numberOfPages) { page -= 1; }
		$query = $scope.searchQuery + "&startIndex=" + (page*$scope.maxResults) + "&maxResults=" + $scope.maxResults + "&apiKey=" + $rootScope.loggedAPIKey;
		$http.get($query).success(function(response) {
			$scope.bookResults = response.items;
			$scope.orderProp = 'volumeInfo.title';
		}).error(function(response) {
			$location.path("/error");
		});
	}
	$scope.showBookDetails = function(itemId) {
		$rootScope.bookId = itemId;
		$query = $rootScope.baseAPISearchURL + "search/" + itemId;
		$http.get($query).success(function(response) {
			$scope.bookDetails = response;
			$rootScope.bookISBN = $scope.bookDetails.volumeInfo.industryIdentifiers[0].identifier;
			$scope.reviews = response.reviews;
			$scope.hideReviewSection = false;
			if($scope.reviews.length == 0)
				$scope.noReviews = true;
			else
				$scope.noReviews = false;
			if($scope.reviews.length > 0) {
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user == $rootScope.loggedEmail) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						$scope.hideReviewSection = true;
						$scope.reviewEmail = $rootScope.loggedEmail;
						break;
					}
					else {
						$scope.userRating = null;
						$scope.hideReviewSection = false;
					}
				}
			}
			else
				$scope.userRating = null;
			$scope.bookDetailsPage = true;
		}).error(function(response) {
			$location.path("/error");
		});
	}
	$scope.editReviewAndRating = false;
	$scope.editReview = function() {
		$scope.editReviewAndRating = true;
	}
	
	$scope.backToResultsPage = function() {
		$scope.bookDetailsPage = false;
		$scope.addedToFavourites = null;
		$scope.addedToRead = null;
	}
	
	$scope.getStars = function(rating) {
		width = (rating/5)*100;
		var style = "width: "+width+"%";
		return style;
	}
	
	$scope.addToFav = function(bookId) {
		$query = $rootScope.baseAPISearchURL + "fav_read/add?email=" + $rootScope.loggedEmail + "&bookId=" + bookId + "&type=fav";
		$http.post($query).success(function(response) {
			if(response.success == "true") {
				$scope.addedToFavourites = true;
				$scope.addedToRead = null;
			}
			else {
				$scope.addedToFavourites = false;
				$scope.addedToRead = null;
			}
		});
	}
	
	$scope.addToRead = function(bookId) {
		$query = $rootScope.baseAPISearchURL + "fav_read/add?email=" + $rootScope.loggedEmail + "&bookId=" + bookId + "&type=read";
		$http.post($query).success(function(response) {
			if(response.success == "true") {
				$scope.addedToRead = true;
				$scope.addedToFavourites = null;
			}
			else {
				$scope.addedToRead = false;
				$scope.addedToFavourites = null;
			}
		});
	}
	$scope.reviewError = false;
	$rootScope.postReview = function() {
		$scope.reviewError = false;
		if($rootScope.newUserRating == 0 || angular.isUndefined($rootScope.newUserRating) || $scope.review == "" || angular.isUndefined($scope.review) || $scope.review == null) {
			$scope.reviewError = true;
		}
		else {
			$query = $rootScope.baseAPISearchURL + "reviews/add?bookId=" + $rootScope.bookId + "&isbn=" + $rootScope.bookISBN + "&email=" + $rootScope.loggedEmail + "&review=" + $scope.review + "&rating=" +$rootScope.newUserRating + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.post($query).success(function(response) {
				$scope.bookDetails = response;
				$scope.reviews = response.reviews;
				$scope.reviewEmail = $rootScope.loggedEmail;
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user == $rootScope.loggedEmail) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						break;
					}
				}
				$rootScope.rating = 0;
				$scope.review = null;
				$scope.bookDetailsPage = true;
				$scope.hideReviewSection = true;
				$scope.editReviewAndRating = false;
				$scope.noReviews = false;
			});
		}
	}
	$scope.editReviewError = false;
	$rootScope.submitEditedReview = function(editedReview) {
		if(editedReview == "") {
			$scope.editReviewError = true;
		}
		else {
			$query = $rootScope.baseAPISearchURL + "reviews/update?bookId=" + $rootScope.bookId + "&isbn=" + $rootScope.bookISBN + "&email=" + $rootScope.loggedEmail + "&review=" + editedReview + "&rating=" +$rootScope.newUserRating + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.put($query).success(function(response) {
				$scope.bookDetails = response;
				$scope.reviews = response.reviews;
				$scope.reviewEmail = $rootScope.loggedEmail;
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user.indexOf($rootScope.loggedEmail) != -1) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						break;
					}
				}
				$scope.test = null;
				$scope.bookDetailsPage = true;
				$scope.hideReviewSection = true;
				$scope.editReviewAndRating = false;
				$scope.noReviews = false;
			});
		}
	}
	
	$scope.cancelEditReview = function() {
		$scope.editReviewAndRating = false;
		$scope.editReviewError = false;
	}
	
	$rootScope.updateError = function() {
		$scope.reviewError = false;
	}
	
	$rootScope.rating = 0;
	$rootScope.newUserRating = 0;
	$scope.rateFunction = function(rating) {
		$rootScope.newUserRating = rating;
	};
}]).directive("starRating", function() {
  return {
    restrict : "E",
    template : "<ul class='rating'>" +
               "  <li ng-repeat='star in stars' ng-class='star' ng-click='toggle($index)'>" +
               "    <i class='fa fa-star'></i>" + 
               "  </li>" +
               "</ul>",
    scope : {
	  controller: '=',
      ratingValue : "=",
      max : "=",
      onRatingSelected : "&",
    },
	replace: true,
	controllerAs: 'controller',
	controller: function($rootScope, $scope) {
		var api = this;
		$scope.stars = [];
		for ( var i = 0; i < $scope.max; i++) {
			$scope.stars.push({
				filled : i < $scope.ratingValue
			});
		}
		api.updateStars = function(ratingValue, action) {
			if(action == "submit")
				$rootScope.postReview();
			if(action == "cancel")
				$rootScope.updateError();
			$rootScope.newUserRating = ratingValue;			
			$scope.stars = [];
			for ( var i = 0; i < $scope.max; i++) {
			  $scope.stars.push({
				filled : i < ratingValue
			  });
			}
		};
		$scope.toggle = function(index) {
			$scope.ratingValue = index + 1;
			$scope.onRatingSelected({
			  rating : index + 1
			});
			api.updateStars($scope.ratingValue, '');
		};
      }
  };
});

bookApp.controller('escapeHTML', function($scope, $sce, $window) {
	$scope.trustedHTML = $sce.trustAsHtml($scope.item);
});

bookApp.controller('loginController', ['$rootScope', '$scope', '$http', '$location', '$window', '$cookies','DynamicPageInfoFactory', function ($rootScope, $scope, $http, $location, $window, $cookies,DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();
	$rootScope.copyrightsText = "Copyrights &copy; 2014, goodReadsAddict. All Rights Reserved.";
	$rootScope.loggedInUser = "invalid";
	$rootScope.loggedEmail = null;
	$cookies.globalUser = null;
	$cookies.globalEmail = null;
	$cookies.globalApiKey = null;
	$cookies.globalRestricted = null;
	$rootScope.baseAPISearchURL = "http://localhost:8081/goodReadsAddict/v1/";
	$cookies.globalBaseAPIURL = $rootScope.baseAPISearchURL;
	
	function quoteInfo(quote, author) {
		this.quote = quote;
		this.author = author;
	}

	var quoteInfos = [
	{quote:"Read the best books first, or you may not have a chance to read them at all.", author:"Henry David Thoreau"},
	{quote:"I can’t imagine a man really enjoying a book and reading it only once.", author:"C.S. Lewis"},
	{quote:"A great book should leave you with many experiences, and slightly exhausted at the end. You live several lives while reading.", author:"William Styron"},
	{quote:"I divide all readers into two classes; those who read to remember and those who read to forget.", author:"William Lyon Phelps"},
	{quote:"There are worse crimes than burning books. One of them is not reading them.", author:"Joseph Brodsky"},
	{quote:"You know you’ve read a good book when you turn the last page and feel a little as if you have lost a friend.", author:"Paul Sweeney"},
	{quote:"I cannot sleep unless I am surrounded by books.", author:"Jorge Luis Borges"},
	{quote:"Once you learn to read, you will be forever free.", author:"Frederick Douglas"},
	{quote:"Books are like mirrors: if a fool looks in, you cannot expect a genius to look out.", author:"J.K. Rowling"},
	{quote:"A book is a device to ignite the imagination.", author:"Alan Bennett"},
	{quote:"So many books, so little time.", author:"Frank Zappa"},
	{quote:"The man who does not read has no advantage over the man who cannot read.", author:"Mark Twain"}];

	var quoteIndex = Math.floor(Math.random() * quoteInfos.length);
	$scope.quote= quoteInfos[quoteIndex].quote;
	$scope.author=quoteInfos[quoteIndex].author;
	$scope.changeDisplayText = function() {

		if(quoteIndex < quoteInfos.length -1)
		{
			quoteIndex++;
		}
		else
		{
			quoteIndex = 0;
		}
		$scope.quote= quoteInfos[quoteIndex].quote;
		$scope.author=quoteInfos[quoteIndex].author;
	}








	$scope.authenticate = function() {
		$query = $rootScope.baseAPISearchURL + "auth?email=" + $scope.email + "&password=" + $scope.password;
		$http.get($query).success(function(response) {
			$scope.validUser = response.validUser;
			if($scope.validUser == 'true') {
				$scope.userDetails = response.userDetails;
				$rootScope.userRestricted = $scope.userDetails.isRestricted;
				$rootScope.loggedInUser = $scope.userDetails.fname;
				$cookies.globalUser = $scope.userDetails.fname;
				$cookies.globalEmail = $scope.email;
				$cookies.globalApiKey = $scope.userDetails.apiKey;
				$cookies.globalRestricted = $rootScope.userRestricted;
				$rootScope.loggedEmail = $scope.email;
				$rootScope.loggedAPIKey = $scope.userDetails.apiKey;
				if($scope.userDetails.userType == "admin") {
					$location.path("/admin");
				}
				else
					$location.path("/search");
			}
		});
	}
}]);

bookApp.controller('signUpController', ['$rootScope', '$scope', '$http', '$location', '$window', 'DynamicPageInfoFactory', function ($rootScope, $scope, $http, $location, $window, DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();

	$rootScope.baseAPISearchURL = "http://localhost:8081/goodReadsAddict/v1/";
	
	$scope.createAccount = function() {
		
		if($scope.fname == "" || angular.isUndefined($scope.fname) || isNumeric($scope.fname)) {
			$scope.fnameError = true;
		}
		else
			$scope.fnameError = false;
		if($scope.lname == "" || angular.isUndefined($scope.lname) || isNumeric($scope.lname))
			$scope.lnameError = true;
		else
			$scope.lnameError = false;
		if($scope.email == "" || angular.isUndefined($scope.email) || !isEmailValid($scope.email))
			$scope.emailError = true;
		else
			$scope.emailError = false;
		if($scope.password == "" || angular.isUndefined($scope.password) || $scope.confirmPassword == "" || angular.isUndefined($scope.confirmPassword))
			$scope.passwordError = true;
		else
			$scope.passwordError = false;
		if($scope.password != $scope.confirmPassword) 
			$scope.passwordNotMatchError = true;
		else
			$scope.passwordNotMatchError = false;
		if($scope.fnameError == false && $scope.lnameError == false && $scope.emailError == false && $scope.passwordError == false && $scope.passwordNotMatchError == false) {
			$query = $rootScope.baseAPISearchURL + "register?fname=" + $scope.fname + "&lname=" + $scope.lname + "&email=" + $scope.email + "&password=" + $scope.password;
			$http.post($query).success(function(response) {
				$scope.registered = response.registered;
				$scope.fname = null;
				$scope.lname = null;
				$scope.email = null;
				$scope.password = null;
				$scope.confirmPassword = null;
				$scope.fnameError = false;
				$scope.lnameError = false;
				$scope.emailError = false;
				$scope.passwordError = false;
				$scope.passwordNotMatchError = false;
			});
		}
	}
	$scope.clearFields = function() {
		$scope.fname = null;
		$scope.lname = null;
		$scope.email = null;
		$scope.password = null;
		$scope.confirmPassword = null;
		$scope.registered = null;
		$scope.fnameError = false;
		$scope.lnameError = false;
		$scope.emailError = false;
		$scope.passwordError = false;
		$scope.passwordNotMatchError = false;
	}
}]);

bookApp.controller('adminController', ['$rootScope', '$scope', '$http', '$location', '$window', '$cookies', 'DynamicPageInfoFactory', function ($rootScope, $scope, $http, $location, $window, $cookies,DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();

	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
	};
	
	$scope.logSearch = false;
	$scope.userOrApiSearch = false;
	$scope.getLogs = function() {
		$scope.userOrApiSearch = false;
		$scope.userTypeChanged = false;
		$scope.restricted = false;
		if(($scope.userEmail && $scope.userEmail != "") || ($scope.apiKey && $scope.apiKey != ""))
			$scope.userOrApiSearch = true;
		$query = $rootScope.baseAPISearchURL + "logs?email=" + $scope.userEmail + "&apiKey=" +$scope.apiKey + "&adminApiKey=" + $rootScope.loggedAPIKey;
		$http.get($query).success(function(response) {
			$scope.logDetails = response.items;
			$scope.totalAPIHits = response.totalItems;
			if($scope.totalAPIHits > 0) {
				$scope.userType = $scope.logDetails[0].userType;
				$scope.userStatus = $scope.logDetails[0].restricted;
				if($scope.userType == "Limited")
					$scope.limit = "250";
				if($scope.userType == "Premium")
					$scope.limit = "Unlimited";
				if($scope.userStatus == "y")
					$scope.res = "Restricted for Day";
				if($scope.userStatus == "n" || $scope.userStatus == "")
					$scope.res = "Not Restricted";
			}
			$scope.logDate = response.logDate;
			$scope.logSearch = true;
		});
	}
	
	$scope.clearSearch = function() {
		$scope.logSearch = false;
		$scope.userOrApiSearch = false;
		$scope.restricted = false;
	}
	$scope.userTypeChanged = false;
	$scope.changeUserType = function(userType) {
		$query = $rootScope.baseAPISearchURL + "updateUserType?email=" + $scope.userEmail + "&apiKey=" +$scope.apiKey + "&userType=" + userType;
		$http.put($query).success(function(response) {
			$scope.userTypeChanged = true;
			$scope.logSearch = false;
			$scope.userOrApiSearch = false;
		});
	}
	$scope.restricted = false;
	$scope.restrictUser = function(userType) {
		$query = $rootScope.baseAPISearchURL + "restrictUser?email=" + $scope.userEmail + "&apiKey=" +$scope.apiKey;
		$http.put($query).success(function(response) {
			$scope.restricted = true;
			$scope.logSearch = false;
			$scope.userOrApiSearch = false;
		});
	}
}]);

bookApp.controller('adminProfileController', ['$rootScope', '$scope', '$http', '$location', '$window', '$cookies', 'DynamicPageInfoFactory', function ($rootScope, $scope, $http, $location, $window, $cookies, DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();

	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
	};
		
	$query = $rootScope.baseAPISearchURL + "profiles?email=" + $rootScope.loggedEmail + "&apiKey=" + $rootScope.loggedAPIKey;
	$http.get($query).success(function(response) {
		$scope.userDetails = response;
		$scope.fname = response.fname;
		$scope.lname = response.lname;
		$scope.oldFname = $scope.fname;
		$scope.oldLname = $scope.lname;
	});
	$scope.updateProfile = function() {
		if($scope.fname == "" || isNumeric($scope.fname) == true)
			$scope.fnameError = true;
		else
			$scope.fnameError = false;
		if($scope.lname == "" || isNumeric($scope.lname) == true)
			$scope.lnameError = true;
		else
			$scope.lnameError = false;
		if($scope.fnameError == false && $scope.lnameError == false) {
			$query = $rootScope.baseAPISearchURL + "updateUserDetails?fname=" + $scope.fname + "&lname=" + $scope.lname + "&email=" + $rootScope.loggedEmail + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.put($query).success(function(response) {
				$rootScope.loggedInUser = response.fname;
				$cookies.globalUser = response.fname;
				$scope.fname = response.fname;
				$scope.lname = response.lname;
				$scope.updatedProfile = true;
			});
		}
	}
	
	$scope.cancel = function() {
		$scope.fname = $scope.oldFname;
		$scope.lname = $scope.oldLname;
		$scope.fnameError = false;
		$scope.lnameError = false;
	}
}]);

bookApp.controller('profileController',['$rootScope', '$scope', '$http', '$window', '$location', '$cookies', 'DynamicPageInfoFactory', function($rootScope, $scope, $http, $window, $location, $cookies, DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();
	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
		$location.path("/profile");
	};
	
	$query = $rootScope.baseAPISearchURL + "profiles?email=" + $rootScope.loggedEmail + "&apiKey=" + $rootScope.loggedAPIKey;
	$http.get($query).success(function(response) {
		$scope.userDetails = response;
		$scope.fname = response.fname;
		$scope.lname = response.lname;
		$scope.oldFname = $scope.fname;
		$scope.oldLname = $scope.lname;
	});
	$scope.updateProfile = function() {
		if($scope.fname == "" || isNumeric($scope.fname) == true)
			$scope.fnameError = true;
		else
			$scope.fnameError = false;
		if($scope.lname == "" || isNumeric($scope.lname) == true)
			$scope.lnameError = true;
		else
			$scope.lnameError = false;
		if($scope.fnameError == false && $scope.lnameError == false) {
			$query = $rootScope.baseAPISearchURL + "updateUserDetails?fname=" + $scope.fname + "&lname=" + $scope.lname + "&email=" + $rootScope.loggedEmail + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.put($query).success(function(response) {
				$rootScope.loggedInUser = response.fname;
				$cookies.globalUser = response.fname;
				$scope.fname = response.fname;
				$scope.lname = response.lname;
				$scope.updatedProfile = true;
			});
		}
	}
	
	$scope.cancel = function() {
		$scope.fname = $scope.oldFname;
		$scope.lname = $scope.oldLname;
		$scope.fnameError = false;
		$scope.lnameError = false;
	}
	
	$scope.deleteProfile = function() {
		$query = $rootScope.baseAPISearchURL + "deleteUser?email=" + $rootScope.loggedEmail + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.delete($query).success(function(response) {
				$location.path("/");
			});
	}
}]);

bookApp.controller('changePasswordController',['$rootScope', '$scope', '$http', '$window', '$location', '$cookies', 'DynamicPageInfoFactory',function($rootScope, $scope, $http, $window, $location, $cookies, DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();

	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
	};
	
	$scope.updatePassword = function() {
		if($scope.currentPassword == "" || angular.isUndefined($scope.currentPassword) || $scope.newPassword == "" || angular.isUndefined($scope.newPassword) || $scope.confirmPassword == "" || angular.isUndefined($scope.confirmPassword))
			$scope.emptyError = true;
		else
			$scope.emptyError = false;
		if($scope.newPassword != $scope.confirmPassword)
			$scope.error = true;
		else
			$scope.error = false;
		if($scope.error == false && $scope.emptyError == false) {
			$query = $rootScope.baseAPISearchURL + "changePassword?email=" + $rootScope.loggedEmail + "&currentPassword=" + $scope.currentPassword + "&newPassword=" + $scope.newPassword;
			$http.put($query).success(function(response) {
				$scope.userDetails = response;
				$scope.passwordChanged = response.success;
				$scope.currentPassword = null;
				$scope.newPassword = null;
				$scope.confirmPassword = null;
			});
		}
	}
	
	$scope.clearFields = function() {
		$scope.currentPassword = null;
		$scope.newPassword = null;
		$scope.confirmPassword = null;
		$scope.passwordChanged = false;
		$scope.error = false;
	}
}]);

bookApp.controller('adminChangePasswordController',['$rootScope', '$scope', '$http', '$window', '$location', '$cookies', 'DynamicPageInfoFactory', function($rootScope, $scope, $http, $window, $location, $cookies, DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();
	
	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
	};
	
	$scope.updatePassword = function() {
		$query = $rootScope.baseAPISearchURL + "changePassword?email=" + $rootScope.loggedEmail + "&currentPassword=" + $scope.currentPassword + "&newPassword=" + $scope.newPassword;
		$http.put($query).success(function(response) {
			$scope.userDetails = response;
			$scope.passwordChanged = response.success;
			$scope.currentPassword = null;
			$scope.newPassword = null;
			$scope.confirmPassword = null;
		});
	}
	
	$scope.clearFields = function() {
		$scope.currentPassword = null;
		$scope.newPassword = null;
		$scope.confirmPassword = null;
		$scope.passwordChanged = false;
	}
}]);


bookApp.controller('favController',['$rootScope', '$scope', '$http', '$window', '$location', '$cookies', 'DynamicPageInfoFactory', function($rootScope, $scope, $http, $window, $location, $cookies, DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();

	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
	};
		
	if($rootScope.userRestricted == "y")
		$scope.restrictedUser = true;
	else
		$scope.restrictedUser = false;
	
	$scope.startIndex = 0;
	$scope.maxResults = 10;
	$scope.numberOfPages = 0;
	$scope.nop = [];
	$scope.totalResults = 0;
	$scope.bookDetailsPage = false;
	$scope.currentPage = 1, $scope.numPerPage = 10, $scope.maxSize = 6;
	$scope.startRange = 1, $scope.endRange = 5;
	
	$scope.getFav = function() {
		$query = $rootScope.baseAPISearchURL + "fav_read?email=" + $rootScope.loggedEmail + "&type=fav";
		$http.get($query).success(function(response) {
			$scope.favDetails = response.items;
			$scope.totalResults = response.totalItems;
			$scope.numberOfPages = Math.ceil($scope.totalResults/$scope.maxResults);
		});
	}
	$scope.getFav();
	$scope.removeFromFav = function(bookId) {
		$query = $rootScope.baseAPISearchURL + "fav_read/remove?email=" + $rootScope.loggedEmail + "&bookId=" + bookId + "&type=fav";
		$http.delete($query).success(function(response) {
			$scope.bookDetailsPage = false;
			$scope.addedToRead = null;
			$scope.getFav();
		});
	}
	
	$scope.showBookDetails = function(itemId) {
		$rootScope.bookId = itemId;
		$query = $rootScope.baseAPISearchURL + "search/" + itemId;
		$http.get($query).success(function(response) {
			$scope.bookDetails = response;
			$rootScope.bookISBN = $scope.bookDetails.volumeInfo.industryIdentifiers[0].identifier;
			$scope.reviews = response.reviews;
			$scope.hideReviewSection = false;
			if($scope.reviews.length == 0)
				$scope.noReviews = true;
			else
				$scope.noReviews = false;
			if($scope.reviews.length > 0) {
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user == $rootScope.loggedEmail) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						$scope.hideReviewSection = true;
						$scope.reviewEmail = $rootScope.loggedEmail;
						break;
					}
					else {
						$scope.userRating = null;
						$scope.hideReviewSection = false;
					}
				}
			}
			else
				$scope.userRating = null;
			$scope.bookDetailsPage = true;
		}).error(function(response) {
			$location.path("/error");
		});
	}
	
	$scope.editReviewAndRating = false;
	$scope.editReview = function() {
		$scope.editReviewAndRating = true;
	}
	
	$scope.backToResultsPage = function() {
		$scope.bookDetailsPage = false;
		$scope.addedToRead = null;
		$scope.addedToFavourites = null;
	}
	
	$scope.getStars = function(rating) {
		width = (rating/5)*100;
		var style = "width: "+width+"%";
		return style;
	}
	$scope.reviewError = false;
	$rootScope.postReview = function() {
		$scope.reviewError = false;
		if($rootScope.newUserRating == 0 || angular.isUndefined($rootScope.newUserRating) || $scope.review == "" || angular.isUndefined($scope.review) || $scope.review == null) {
			$scope.reviewError = true;
		}
		else {
			$query = $rootScope.baseAPISearchURL + "reviews/add?bookId=" + $rootScope.bookId + "&isbn=" + $rootScope.bookISBN + "&email=" + $rootScope.loggedEmail + "&review=" + $scope.review + "&rating=" +$rootScope.newUserRating + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.post($query).success(function(response) {
				$scope.bookDetails = response;
				$scope.reviews = response.reviews;
				$scope.reviewEmail = $rootScope.loggedEmail;
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user == $rootScope.loggedEmail) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						break;
					}
				}
				$rootScope.rating = 0;
				$scope.review = null;
				$scope.bookDetailsPage = true;
				$scope.hideReviewSection = true;
				$scope.editReviewAndRating = false;
				$scope.noReviews = false;
			});
		}
	}
	
	$scope.editReviewError = false;
	$rootScope.submitEditedReview = function(editedReview) {
		if(editedReview == "") {
			$scope.editReviewError = true;
		}
		else {
			$query = $rootScope.baseAPISearchURL + "reviews/update?bookId=" + $rootScope.bookId + "&isbn=" + $rootScope.bookISBN + "&email=" + $rootScope.loggedEmail + "&review=" + editedReview + "&rating=" +$rootScope.newUserRating + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.put($query).success(function(response) {
				$scope.bookDetails = response;
				$scope.reviews = response.reviews;
				$scope.reviewEmail = $rootScope.loggedEmail;
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user.indexOf($rootScope.loggedEmail) != -1) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						break;
					}
				}
				$scope.test = null;
				$scope.bookDetailsPage = true;
				$scope.hideReviewSection = true;
				$scope.editReviewAndRating = false;
				$scope.noReviews = false;
			});
		}
	}
	
	$scope.cancelEditReview = function() {
		$scope.editReviewAndRating = false;
		$scope.editReviewError = false;
	}
	
	$rootScope.updateError = function() {
		$scope.reviewError = false;
	}
	
	$scope.addToRead = function(bookId) {
		$query = $rootScope.baseAPISearchURL + "fav_read/add?email=" + $rootScope.loggedEmail + "&bookId=" + bookId + "&type=read";
		$http.post($query).success(function(response) {
			if(response.success == "true") {
				$scope.addedToRead = true;
				$scope.addedToFavourites = null;
			}
			else {
				$scope.addedToRead = false;
				$scope.addedToFavourites = null;
			}
		});
	}
	
	$rootScope.rating = 0;
	$rootScope.newUserRating = 0;
	$scope.rateFunction = function(rating) {
		$rootScope.newUserRating = rating;
	};
	
	
}]).directive("starRatingFav", function() {
  return {
    restrict : "E",
    template : "<ul class='rating'>" +
               "  <li ng-repeat='star in stars' ng-class='star' ng-click='toggle($index)'>" +
               "    <i class='fa fa-star'></i>" + 
               "  </li>" +
               "</ul>",
    scope : {
	  controller: '=',
      ratingValue : "=",
      max : "=",
      onRatingSelected : "&",
    },
	replace: true,
	controllerAs: 'controller',
	controller: function($rootScope, $scope) {
		var api = this;
		$scope.stars = [];
		for ( var i = 0; i < $scope.max; i++) {
			$scope.stars.push({
				filled : i < $scope.ratingValue
			});
		}
		api.updateStars = function(ratingValue, action) {
			if(action == "submit")
				$rootScope.postReview();
			if(action == "cancel")
				$rootScope.updateError();
			$rootScope.newUserRating = ratingValue;			
			$scope.stars = [];
			for ( var i = 0; i < $scope.max; i++) {
			  $scope.stars.push({
				filled : i < ratingValue
			  });
			}
		};
		$scope.toggle = function(index) {
			$scope.ratingValue = index + 1;
			$scope.onRatingSelected({
			  rating : index + 1
			});
			api.updateStars($scope.ratingValue, '');
		};
      }
  };
});

bookApp.controller('docsController',['$rootScope','$scope', '$http', 'DynamicPageInfoFactory', function($rootScope,$scope,$http,DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();
	$scope.docsAPIKey = "018293a1de398c38ebf4eb7bc7ca9718";
	$scope.docsAPIURL = "http://localhost:8081/goodReadsAddict/v1/";
	$scope.accordion = $(function() {
		$("#accordion").accordion({
			collapsible: true,
			heightStyle: "content",
			active: false
		});
	});

	$("#accordion").accordion();

	$scope.docsSearchURL = $scope.docsAPIURL + "search?title=harry%20potter&startIndex=0&maxResults=10&apiKey=" + $scope.docsAPIKey;
	$scope.docsSearchBookIdURL = $scope.docsAPIURL + "search/zN6Ma8P0SxQC";
	$scope.docsRegisterURL = $scope.docsAPIURL + "register?fname=test&lname=test&email=test@test.com&password=test";
	$scope.docsAuthURL = $scope.docsAPIURL + "auth?email=test@test.com&password=test";
	$scope.docsProfilesURL = $scope.docsAPIURL + "profiles?email=test@test.com";
	$scope.docsChangePasswordURL = $scope.docsAPIURL + "changePassword?email=test@test.com&currentPassword=test&newPassword=test1";
	$scope.docsDeleteUserURL = $scope.docsAPIURL + "deleteUser?email=test@test.com";
	$scope.docsAddFavReadURL = $scope.docsAPIURL + "fav_read/add?email=test@test.com&bookId=zN6Ma8P0SxQC&type=fav";
	$scope.docsGetFavReadURL = $scope.docsAPIURL + "fav_read?email=test@test.com&type=read";
	$scope.docsRemoveFavReadURL = $scope.docsAPIURL + "fav_read/remove?email=test@test.com&bookId=zN6Ma8P0SxQC&type=read";
	$scope.docsAddReviewsURL = $scope.docsAPIURL + "reviews/add?bookId=zN6Ma8P0SxQC&isbn=1576906388&email=test@test.com&review=good%20book&rating=4&apiKey=" + $scope.docsAPIKey;
	$scope.docsUpdateReviewsURL = $scope.docsAPIURL + "reviews/update?bookId=zN6Ma8P0SxQC&isbn=1576906388&email=test@test.com&review=good%20book&rating=4&apiKey=" + $scope.docsAPIKey;
	$scope.docsUpdateUserURL = $scope.docsAPIURL + "updateUserDetails?fname=Mark&lname=Smith&email=msmith@email.com"
	$scope.docsUpdateUserTypeURL = $scope.docsAPIURL + "updateUserType?email=test@test.com&apiKey=" + $scope.docsAPIKey + "&userType=Limited"
	$scope.docRestrictUserURL = $scope.docsAPIURL + "restrictUser?email=test@test.com&apiKey=" + $scope.docsAPIKey;
	$scope.search = function() {
		$query = $scope.docsAPIURL + "search?apiKey=" + $scope.docsAPIKey; 
		$query = createURL($query, $scope.searchObj);
		$http.get($query).success(function(response) {
			$scope.searchResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.searchBookID = function() {
		$query = $scope.docsAPIURL + "search/" + $scope.searchBookIDObj.bookID + "?apiKey=" + $scope.docsAPIKey; 
		$http.get($query).success(function(response) {
			$scope.searchBookIDResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.createAccount = function() {
		$query = $scope.docsAPIURL + "register?fname=" + $scope.registerObj.fname + "&lname=" + $scope.registerObj.lname + "&email=" + $scope.registerObj.email + "&password=" + $scope.registerObj.password;
		$http.post($query).success(function(response) {
			$scope.createAccountResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.auth = function() {
		$query = $scope.docsAPIURL + "auth?email=" + $scope.authObj.email + "&password=" + $scope.authObj.password;
		$http.get($query).success(function(response) {
			$scope.authResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.profiles = function() {
		$query = $scope.docsAPIURL + "profiles?email=" + $scope.profileObj.email + "&apiKey=" + $scope.profileObj.apiKey; 
		$http.get($query).success(function(response) {
			$scope.profilesResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.changePassword = function() {
		$query = $scope.docsAPIURL + "changePassword?email=" + $scope.passwordObj.email + "&currentPassword=" + $scope.passwordObj.currentPass + "&newPassword=" + $scope.passwordObj.newPass;
		$http.put($query).success(function(response) {
			$scope.changePasswordResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.updateUserType = function() {
		$query = $scope.docsAPIURL + "updateUserType?email=" + $scope.userTypeObj.email + "&apiKey=" + $scope.userTypeObj.apiKey + "&userType=" + $scope.userTypeObj.userType;
		$http.put($query).success(function(response) {
			$scope.updateUserTypeResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.deleteUser = function() {
		$query = $scope.docsAPIURL + "deleteUser?email=" + $scope.deleteUserObj.email + "&apiKey=" + $scope.deleteUserObj.apiKey;
		$http.delete($query).success(function(response) {
			$scope.deleteUserResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.postFavRead = function() {
		$query = $scope.docsAPIURL + "fav_read/add?email=" + $scope.favReadPostObj.email + "&bookId=" + $scope.favReadPostObj.bookID + "&type=" + $scope.favReadPostObj.listType;
		$http.post($query).success(function(response) {
			$scope.postFavReadResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.getFavRead = function() {
		$query = $scope.docsAPIURL + "fav_read?email=" + $scope.favReadGetObj.email + "&type=" + $scope.favReadGetObj.listType;
		$http.get($query).success(function(response) {
			$scope.getFavReadResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.deleteFavRead = function() {
		$query = $scope.docsAPIURL + "fav_read/remove?email=" + $scope.favReadDeleteObj.email + "&type=" + $scope.favReadDeleteObj.listType + "&bookId=" + $scope.favReadDeleteObj.bookId;
		console.log($query);
		$http.delete($query).success(function(response) {
			$scope.deleteFavReadResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.addReview = function() {
		$query = $scope.docsAPIURL + "reviews/add?apiKey=" + $scope.docsAPIKey + "&bookId=" + $scope.addReviewObj.bookId + "&isbn=" + $scope.addReviewObj.isbn + "&email=" + $scope.addReviewObj.email 
			+ "&review=" + $scope.addReviewObj.review + "&rating=" + $scope.addReviewObj.rating;
		$http.post($query).success(function(response) {
			$scope.addReviewResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.updateReview = function() {
		$query = $scope.docsAPIURL + "reviews/update?apiKey=" + $scope.docsAPIKey + "&bookId=" + $scope.updateReviewObj.bookId + "&isbn=" + $scope.updateReviewObj.isbn + "&email=" + $scope.updateReviewObj.email 
			+ "&review=" + $scope.updateReviewObj.review + "&rating=" + $scope.updateReviewObj.rating;
		$http.put($query).success(function(response) {
			$scope.updateReviewResponse = JSON.stringify(response,null,2);
		});
	}

	$scope.getLogs = function() {
		$query = $scope.docsAPIURL + "reviews/update?apiKey=" + $scope.docsAPIKey + "&bookId=" + $scope.updateReviewObj.bookId + "&isbn=" + $scope.updateReviewObj.isbn + "&email=" + $scope.updateReviewObj.email 
			+ "&review=" + $scope.updateReviewObj.review + "&rating=" + $scope.updateReviewObj.rating;
		$http.put($query).success(function(response) {
			$scope.updateReviewResponse = JSON.stringify(response,null,2);
		});
	}

	var createURL = function(query, obj)
	{
		for(var i in obj) {
			if(obj[i] != "") {
				query += "&" + i + "=" + obj[i];
			}
		}
		return query;
	}
}]);

bookApp.controller('readController',['$rootScope', '$scope', '$http', '$window', '$location', '$cookies', 'DynamicPageInfoFactory', function($rootScope, $scope, $http, $window, $location, $cookies,DynamicPageInfoFactory) {
	DynamicPageInfoFactory.update();

	if($rootScope.loggedInUser == "invalid")
		$location.path("/");
	if (angular.isUndefined($rootScope.loggedInUser)) {
		$rootScope.loggedInUser = $cookies.globalUser;
		$rootScope.loggedEmail = $cookies.globalEmail;
		$rootScope.loggedAPIKey = $cookies.globalApiKey;
		$rootScope.baseAPISearchURL = $cookies.globalBaseAPIURL;
		$rootScope.userRestricted = $cookies.globalRestricted;
	};
	
	if($rootScope.userRestricted == "y")
		$scope.restrictedUser = true;
	else
		$scope.restrictedUser = false;
	
	$scope.startIndex = 0;
	$scope.maxResults = 10;
	$scope.numberOfPages = 0;
	$scope.nop = [];
	$scope.totalResults = 0;
	$scope.bookDetailsPage = false;
	$scope.currentPage = 1, $scope.numPerPage = 10, $scope.maxSize = 6;
	$scope.startRange = 1, $scope.endRange = 5;
	
	$scope.getRead = function() {
		$query = $rootScope.baseAPISearchURL + "fav_read?email=" + $rootScope.loggedEmail + "&type=read";
		$http.get($query).success(function(response) {
			$scope.favDetails = response.items;
			$scope.totalResults = response.totalItems;
		});
	}
	$scope.getRead();
	
	$scope.removeFromRead = function(bookId) {
		$query = $rootScope.baseAPISearchURL + "fav_read/remove?email=" + $rootScope.loggedEmail + "&bookId=" + bookId + "&type=read";
		$http.delete($query).success(function(response) {
			$scope.bookDetailsPage = false;
			$scope.addedToFavourites = null;
			$scope.getRead();
		});
	}
	
	$scope.addToFav = function(bookId) {
		$query = $rootScope.baseAPISearchURL + "fav_read/add?email=" + $rootScope.loggedEmail + "&bookId=" + bookId + "&type=fav";
		$http.post($query).success(function(response) {
			if(response.success == "true") {
				$scope.addedToFavourites = true;
				$scope.addedToRead = null;
			}
			else {
				$scope.addedToFavourites = false;
				$scope.addedToRead = null;
			}
		});
	}
	
	$scope.showBookDetails = function(itemId) {
		$rootScope.bookId = itemId;
		$query = $rootScope.baseAPISearchURL + "search/" + itemId;
		$http.get($query).success(function(response) {
			$scope.bookDetails = response;
			$rootScope.bookISBN = $scope.bookDetails.volumeInfo.industryIdentifiers[0].identifier;
			$scope.reviews = response.reviews;
			$scope.hideReviewSection = false;
			if($scope.reviews.length == 0)
				$scope.noReviews = true;
			else
				$scope.noReviews = false;
			if($scope.reviews.length > 0) {
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user == $rootScope.loggedEmail) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						$scope.hideReviewSection = true;
						$scope.reviewEmail = $rootScope.loggedEmail;
						break;
					}
					else {
						$scope.userRating = null;
						$scope.hideReviewSection = false;
					}
				}
			}
			else
				$scope.userRating = null;
			$scope.bookDetailsPage = true;
		}).error(function(response) {
			$location.path("/error");
		});
	}
	
	$scope.editReviewAndRating = false;
	$scope.editReview = function() {
		$scope.editReviewAndRating = true;
	}
	
	$scope.backToResultsPage = function() {
		$scope.bookDetailsPage = false;
		$scope.addedToRead = null;
		$scope.addedToFavourites = null;
	}
	
	$scope.getStars = function(rating) {
		width = (rating/5)*100;
		var style = "width: "+width+"%";
		return style;
	}
	$scope.reviewError = false;
	$rootScope.postReview = function() {
		$scope.reviewError = false;
		if($rootScope.newUserRating == 0 || angular.isUndefined($rootScope.newUserRating) || $scope.review == "" || angular.isUndefined($scope.review) || $scope.review == null) {
			$scope.reviewError = true;
		}
		else {
			$query = $rootScope.baseAPISearchURL + "reviews/add?bookId=" + $rootScope.bookId + "&isbn=" + $rootScope.bookISBN + "&email=" + $rootScope.loggedEmail + "&review=" + $scope.review + "&rating=" +$rootScope.newUserRating + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.post($query).success(function(response) {
				$scope.bookDetails = response;
				$scope.reviews = response.reviews;
				$scope.reviewEmail = $rootScope.loggedEmail;
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user == $rootScope.loggedEmail) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						break;
					}
				}
				$rootScope.rating = 0;
				$scope.review = null;
				$scope.bookDetailsPage = true;
				$scope.hideReviewSection = true;
				$scope.editReviewAndRating = false;
				$scope.noReviews = false;
			});
		}
	}
	
	$scope.editReviewError = false;
	$rootScope.submitEditedReview = function(editedReview) {
		if(editedReview == "") {
			$scope.editReviewError = true;
		}
		else {
			$query = $rootScope.baseAPISearchURL + "reviews/update?bookId=" + $rootScope.bookId + "&isbn=" + $rootScope.bookISBN + "&email=" + $rootScope.loggedEmail + "&review=" + editedReview + "&rating=" +$rootScope.newUserRating + "&apiKey=" + $rootScope.loggedAPIKey;
			$http.put($query).success(function(response) {
				$scope.bookDetails = response;
				$scope.reviews = response.reviews;
				$scope.reviewEmail = $rootScope.loggedEmail;
				for(var i=0; i< $scope.reviews.length; i++) {
					if($scope.reviews[i].user.indexOf($rootScope.loggedEmail) != -1) {
						$scope.userRating = $scope.reviews[i].rating;
						$rootScope.newUserRating = $scope.reviews[i].rating;
						$scope.editedReview = $scope.reviews[i].review;
						break;
					}
				}
				$scope.test = null;
				$scope.bookDetailsPage = true;
				$scope.hideReviewSection = true;
				$scope.editReviewAndRating = false;
				$scope.noReviews = false;
			});
		}
	}
	
	$scope.cancelEditReview = function() {
		$scope.editReviewAndRating = false;
		$scope.editReviewError = false;
	}
	
	$rootScope.updateError = function() {
		$scope.reviewError = false;
	}
	
	$rootScope.rating = 0;
	$rootScope.newUserRating = 0;
	$scope.rateFunction = function(rating) {
		$rootScope.newUserRating = rating;
	};
	
	
}]).directive("starRatingRead", function() {
  return {
    restrict : "E",
    template : "<ul class='rating'>" +
               "  <li ng-repeat='star in stars' ng-class='star' ng-click='toggle($index)'>" +
               "    <i class='fa fa-star'></i>" +
               "  </li>" +
               "</ul>",
    scope : {
	  controller: '=',
      ratingValue : "=",
      max : "=",
      onRatingSelected : "&",
    },
	replace: true,
	controllerAs: 'controller',
	controller: function($rootScope, $scope) {
		var api = this;
		$scope.stars = [];
		for ( var i = 0; i < $scope.max; i++) {
			$scope.stars.push({
				filled : i < $scope.ratingValue
			});
		}
		api.updateStars = function(ratingValue, action) {
			if(action == "submit")
				$rootScope.postReview();
			if(action == "cancel")
				$rootScope.updateError();
			$rootScope.newUserRating = ratingValue;			
			$scope.stars = [];
			for ( var i = 0; i < $scope.max; i++) {
			  $scope.stars.push({
				filled : i < ratingValue
			  });
			}
		};
		$scope.toggle = function(index) {
			$scope.ratingValue = index + 1;
			$scope.onRatingSelected({
			  rating : index + 1
			});
			api.updateStars($scope.ratingValue, '');
		};
      }
  };
});

function isNumeric(fname) {
	var arr = fname.split('');
	var containsNumber = false;
	for(var i=0; i<arr.length; i++) {
		switch(arr[i]) {
			case '0' : containsNumber = true; break;
			case '1' : containsNumber = true; break;
			case '2' : containsNumber = true; break;
			case '3' : containsNumber = true; break;
			case '4' : containsNumber = true; break;
			case '5' : containsNumber = true; break;
			case '6' : containsNumber = true; break;
			case '7' : containsNumber = true; break;
			case '8' : containsNumber = true; break;
			case '9' : containsNumber = true; break;
		}
	}
	return containsNumber;
}

function isEmailValid(email) {
	var atpos = email.indexOf("@");
	var dotpos = email.indexOf(".com");
	if(atpos < 1 || dotpos < atpos + 2 || dotpos + 2> email.length)
		return false;
	else
		return true;
}
/*
Filtering the returned data
*/
bookApp.filter('authorFilter', function () {
    return function(input) {
		if(input) {
			var authors = "";
			var len = input.length;
            for(var i=0; i<len; i++) {
				if(i == len-1)
					authors += input[i];
				else
					authors += input[i]+",";
			}
			return authors;
		}
		return "Unknown Author";
	}
});
bookApp.filter('dateFilter', function () {
    return function (input) {
        if (input) {
            var d = input.split("-");
            var day = d[2];
            var month = getMonth(Number(d[1]));
            var year = d[0];
			var date = "";
			if(day)
				date += day + "-";
			if(month)
				date += month + "-";
			if(year)
				date += year;
			return date;
        }
		return "";
    };
});
function getMonth(month) {
	switch(month) {
		case 1: return "Jan";
		case 2: return "Feb";
		case 3: return "Mar";
		case 4: return "Apr";
		case 5: return "May";
		case 6: return "Jun";
		case 7: return "Jul";
		case 8: return "Aug";
		case 9: return "Sep";
		case 10: return "Oct";
		case 11: return "Nov";
		case 12: return "Dec";
	}
}
bookApp.filter('snippetFilter', function () {
    return function(input) {
		if(input) return angular.element('<p>' + input + '</p>').text();
		return "No Snippets found for this book";
	}
});
bookApp.filter('descFilter', function () {
    return function(input) {
		if(input) return angular.element('<p>' + input + '</p>').text();
		return "No Description found for this book";
	}
});
bookApp.filter('costFilter', function() {
	return function(input) {
		if(input) return input;
		return '"NOT_FOR_SALE"';
	}
});
bookApp.filter('subtitleFilter', function() {
	return function(input) {
		if(input) return ("- "+input);
		return "";
	}
});