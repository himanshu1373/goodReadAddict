angular.module('goodReadsAddict.com')
	
	.factory('DynamicPageInfoFactory',['SiteName','Navigation','$location', function(SiteName, Navigation, $location) {
    var title="";
    var active="";
    var path;
    
    var nav = {};
    jQuery.extend(nav,Navigation);

    return {
      getTitle: function() { return title; },
      getActive: function() { return active; },
      getPageTitle: function() { return title + ' | ' + SiteName},
      getNav: function() { 
        return nav;
      },
      update: function() { 
        newPath = $location.path();
        if(newPath != "/read" && newPath != "/search" && newPath != "/favourites")
        {
          active = "none";
          if(newPath === "/changePassword")
          {
            title = "Change Password";
          }
          else if(newPath === "/profile")
          {
            title = "Profile";
          }
          else if(newPath === "/")
          {
            title = "Login";
          }
          else if(newPath === "/signUp")
          {
            title ="Sign Up";
          }
          else if(newPath === "/admin")
          {
            title ="Admin";
          }
          else if(newPath === "/adminProfile")
          {
            title ="Profile";
          }
          else if(newPath === "/adminChangePassword")
          {
            title ="Change Password";
          }
          else if(newPath === "/docs")
          {
            title ="API Docs";
          }
        }
        else
        {
          $.each(Navigation, function(key,value) {
            if (value.path === newPath) {
              title = value.title;
              active = value.title;
              path = '/#/' + value.path;
              return false;
            }
          });
       }
      }
    }
  }]);