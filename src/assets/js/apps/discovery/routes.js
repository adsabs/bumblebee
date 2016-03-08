define([

], function(

){

  var routes = {
        "": "index",
        'classic-form' : 'classicForm',
        'paper-form' : 'paperForm',
        'index/(:query)': 'index',
        'search/(:query)(/)(:widgetName)': 'search',
        'execute-query/(:query)': 'executeQuery',
        'abs/:bibcode(/)(:subView)': 'view',
        /*
         * user endpoints require user to be logged in, either
         * to orcid or to ads
         * */
        'user/orcid*(:subView)' : 'orcidPage',
        'user/account(/)(:subView)' : 'authenticationPage',
        'user/account/verify/(:subView)/(:token)' : 'routeToVerifyPage',
        'user/settings(/)(:subView)(/)' : 'settingsPage',
        'user/libraries(/)(:id)(/)(:subView)(/)(:subData)(/)' : 'librariesPage',
        'user/home' : 'homePage',
        /*end user routes*/

        'orcid-instructions' : 'orcidInstructions',

        'public-libraries/(:id)(/)' : 'publicLibraryPage',
        '*invalidRoute': 'noPageFound'
      };

  return routes;


})