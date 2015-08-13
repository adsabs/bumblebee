define([
    'jquery',
    'backbone',
    'js/components/api_query',
    'js/mixins/dependon',
    'js/components/api_feedback',
    'js/components/api_request',
    'js/components/api_targets',
    'js/mixins/api_access',
    'js/components/api_query_updater'

  ],
  function (
    $,
    Backbone,
    ApiQuery,
    Dependon,
    ApiFeedback,
    ApiRequest,
    ApiTargets,
    ApiAccessMixin,
    ApiQueryUpdater

    ) {

    "use strict";

    var Router = Backbone.Router.extend({

      initialize : function(options){
        options = options || {};
        this.history = options.history;
        this.queryUpdater = new ApiQueryUpdater('Router');
      },

      activate: function (beehive) {
        this.setBeeHive(beehive);
        this.pubsub = beehive.Services.get('PubSub');
        if (!this.pubsub) {
          throw new Exception("Ooops! Who configured this #@$%! There is no PubSub service!")
        }
      },

      /*
      * if you don't want the navigator to duplicate the route in history,
      * use this function instead of pubsub.publish(pubsub.NAVIGATE ...)
      * */

      routerNavigate: function (route, options) {

        var options = options || {};
        //this tells navigator not to create 2 history entries, which causes
        //problems with the back button
        _.extend(options, {replace : true});
       this.pubsub.publish(this.pubsub.NAVIGATE, route, options);

      },

      routes: {
        "": "index",
        'index/(:query)': 'index',
        'search/(:query)': 'search',
        'execute-query/(:query)': 'executeQuery',
        'abs/:bibcode(/)(:subView)': 'view',
        'user/orcid*(:subView)' : 'orcidPage',

        'user/account(/)(:subView)' : 'authenticationPage',
        'user/account/verify/(:subView)/(:token)' : 'routeToVerifyPage',
        'user/settings(/)(:subView)(/)' : 'settingsPage',

        'user/libraries(/)(:id)(/)(:subView)(/)(:subData)(/)' : 'librariesPage',
        'user/home' : 'homePage',

        //"(:query)": 'index',
        '*invalidRoute': 'noPageFound'
      },

      index: function (query) {
        this.routerNavigate('index-page');
      },

      search: function (query) {
        if (query) {
          try {
            var q= new ApiQuery().load(query);
            this.pubsub.publish(this.pubsub.START_SEARCH, q);
          }
          catch (e) {
            console.error('Error parsing query from a string: ', query, e);
            this.pubsub.publish(this.pubsub.BIG_FIRE, new ApiFeedback({
              code: ApiFeedback.CODES.CANNOT_ROUTE,
              reason: 'Cannot parse query',
              query: query}));
          }
        }
        else {
          this.pubsub.publish(this.pubsub.NAVIGATE, 'index-page');
        }
      },

      executeQuery: function(queryId) {
        this.pubsub.publish(this.pubsub.NAVIGATE, 'execute-query', queryId);
      },

      view: function (bibcode, subPage) {

        // check we are using the canonical bibcode and redirect to it if necessary
        var q, req, self;
        self = this;
        q = new ApiQuery({'q': 'identifier:' + this.queryUpdater.quoteIfNecessary(bibcode), 'fl': 'bibcode'});
        req = new ApiRequest({query: q, target: ApiTargets.SEARCH, options: {
          done: function(resp) {
            var navigateString, href;
            if (resp.response && resp.response.docs && resp.response.docs[0]) {
              bibcode = resp.response.docs[0].bibcode;
              self.pubsub.publish(self.pubsub.DISPLAY_DOCUMENTS, new ApiQuery({'q': 'bibcode:' + bibcode}));
            }
            if (!subPage) {
              navigateString = 'ShowAbstract';
              href = "#abs/" + bibcode + "/abstract"
            }
            else {
              navigateString = "Show"+ subPage[0].toUpperCase() + subPage.slice(1);
              href =  "#abs/" + bibcode + "/" + subPage;
            }
            self.routerNavigate(navigateString, {href : href});
          },
          fail: function() {
            console.log('Cannot identify page to load, bibcode: ' + bibcode);
            self.pubsub.publish(this.pubsub.NAVIGATE, 'index-page');
          }
        }});

        this.pubsub.publish(this.pubsub.EXECUTE_REQUEST, req);

      },


      routeToVerifyPage : function(subView, token){

        var failMessage, failTitle, route, done, request, type, that = this;

        if (subView == "register") {
          failTitle = "Registration failed.";
          failMessage = "<p>Please try again, or contact <b> adshelp@cfa.harvard.edu for support </b></p>";
          route = ApiTargets.VERIFY + "/" + token;

          done = function(reply) {
            //user has been logged in already by server
            //request bootstrap
            this.getApiAccess({reconnect : true}).done(function(){
              //redirect to index page
              that.pubsub.publish(that.pubsub.NAVIGATE, 'index-page');
              //call alerts widget
              var title = "Welcome to ADS";
              var msg = "<p>You have been successfully registered with the username</p> <p><b>"+ reply.email +"</b></p>";
              that.pubsub.publish(that.pubsub.ALERT, new ApiFeedback({code: 0, title : title, msg: msg, modal : true, type : "success"}));
            }).fail(function(){
              //fail function defined below
              fail();
            });

          };
        }
        else if (subView == "change-email") {
          failTitle = "Attempt to change email failed";
          failMessage = "Please try again, or contact adshelp@cfa.harvard.edu for support";
          route = ApiTargets.VERIFY + "/" + token;

          done = function(reply) {
            //user has been logged in already
            //request bootstrap
            this.getApiAccess({reconnect : true}).done(function(){
              //redirect to index page
              that.pubsub.publish(that.pubsub.NAVIGATE, 'index-page');
              //call alerts widget
              var title = "Email has been changed.";
              var msg = "Your new ADS email is <b>" + reply.email + "</b>";
              that.pubsub.publish(that.pubsub.ALERT, new ApiFeedback({code: 0, title : title, msg: msg, modal : true, type : "success"}));
            }).fail(function(){
              //fail function defined below
              this.apply(fail, arguments);
            });
          };
        }
        else if (subView == "reset-password") {

          done = function() {
            //route to reset-password-2 form
            //set the token so that session can use it in the put request with the new password
            this.getBeeHive().getObject("Session").setChangeToken(token);
            this.pubsub.publish(this.pubsub.NAVIGATE, 'authentication-page', {subView: "reset-password-2"});
          };

          failMessage = "Reset password token was invalid.";
          route = ApiTargets["RESET_PASSWORD"] + "/" + token;
          type = "GET";

        }
        function fail(jqXHR, status, errorThrown) {
          //redirect to index page
          this.pubsub.publish(this.pubsub.NAVIGATE, 'index-page');
          var error = (jqXHR.responseJSON && jqXHR.responseJSON.error) ? jqXHR.responseJSON.error : "error unknown";
          //call alerts widget
          this.pubsub.publish(this.pubsub.ALERT, new ApiFeedback({code: 0, title: failTitle, msg: " <b>" + error + "</b> <br/>" + failMessage, modal : true, type : "danger"}));
        };

        request = new ApiRequest({
          target : route,
          options : {
            type : type || "GET",
            context : this,
            done : done,
            fail : fail
          }
        });

        this.getBeeHive().getService("Api").request(request);
      },

      orcidPage :function(){
        this.pubsub.publish(this.pubsub.NAVIGATE, 'orcid-page');
      },

      authenticationPage: function(subView){
        //possible subViews: "login", "register", "reset-password"
        if (subView && !_.contains(["login", "register", "reset-password-1", "reset-password-2"], subView)){
          throw new Error("that isn't a subview that the authentication page knows about")
        }
        this.routerNavigate('authentication-page', {subView: subView});
      },

      settingsPage : function(subView){
        //possible subViews: "token", "password", "email", "preferences"
        if (_.contains(["token", "password", "email", "delete"], subView)){
          this.routerNavigate('UserSettings', {subView: subView});
        }
        else if ("preferences" == subView || !subView){
          //show preferences if no subview provided
          this.routerNavigate('UserPreferences');
        }
        else {
          throw new Error("did not recognize user page");
        }
      },

      librariesPage : function(id, subView, subData){

        if (id){
          //individual libraries view
          var subView = subView || "library";
          if (_.contains(["library", "admin"], subView )){

            this.routerNavigate('IndividualLibraryWidget', {sub : subView, id : id});
          }
          else if(_.contains(["export", "metrics", "visualization"], subView)) {

            subView = "library-" + subView;

            if (subView == "library-export"){
              this.routerNavigate(subView, {sub : subData || "bibtex", id : id});
            }
            else if (subView == "library-metrics"){
              this.routerNavigate(subView, { id : id});

            }
            else if (subView == "library-visualization"){
              //not implemented yet
            }

          }
          else {
            throw new Error("did not recognize subview for library view");
          }
        }
        else {
          //main libraries view
          this.routerNavigate("AllLibrariesWidget", "libraries");
        }
      },

      homePage : function(subView){
        this.routerNavigate('home-page', {subView: subView});
      },

      noPageFound : function() {
        //i will fix this later
        $("#body-template-container").html(ErrorTemplate())
      },

      // backbone default behaviour is to automatically decodeuri parameters
      // however this behaviour breaks our apiquery loading, so we'll detect
      // this situation and avoid decoding when there are multiple parameters
      _extractParameters: function(route, fragment) {
        var params = route.exec(fragment).slice(1);
        return _.map(params, function(param) {
          return param ? ((param.indexOf('%26C') > -1) ? param : decodeURIComponent(param)) : null;
        });
      }


    });

    _.extend(Router.prototype, Dependon.BeeHive, ApiAccessMixin);

    return Router;

  });