
/*
 * This module contains a set of utilities to bootstrap Discovery app
 */
define([
    'underscore',
    'backbone',
    'js/components/api_query',
    'js/components/api_request',
    'js/components/pubsub_events',
    'hbs'
    ],
  function(
    _,
    Backbone,
    ApiQuery,
    ApiRequest,
    PubSubEvents,
    HandleBars) {

  var Mixin = {

    configure: function() {

      var conf = this.getObject('DynamicConfig');

      if (conf) {

        var beehive = this.getBeeHive();
        var api = beehive.getService('Api');

        if (conf.root) {
          api.url = conf.root + "/" + api.url;
          this.root = conf.root;
        }
        if (conf.debug !== undefined) {
          beehive.debug = conf.debug;
          this.getController('QueryMediator').debug = conf.debug;
        }

        if (conf.apiRoot) {
          api.url = conf.apiRoot;
        }

        var orcidApi = beehive.getService('OrcidApi');

        if (conf.orcidProxy){
          orcidApi.orcidProxyUri = location.origin + conf.orcidProxy;
        }

        this.bootstrapUrls = conf.bootstrapUrls;

        if (conf.useCache) {
          this.triggerMethodOnAll('activateCache');
        }

        var pubSub = beehive.getService('PubSub');
        var pubSubKey = pubSub.getPubSubKey();
        pubSub.publish(pubSubKey, PubSubEvents.BOOTSTRAP_CONFIGURED);
      }
    },

    bootstrap: function() {
      // XXX:rca - solve this better, through config
      var beehive = this.getBeeHive();
      var results = this.getWidget('Results');
      var runtime = {};
      beehive.addObject('RuntimeConfig', runtime);
      if (results) {
        runtime.pskToExecuteFirst = results.pubsub.getCurrentPubSubKey().getId(); // TODO: get psk from the app (do not look inside widget)
      }


      var defer = $.Deferred();

      // this is the application dynamic config
      var api = this.getBeeHive().getService('Api');

      // load configuration from remote endpoints
      if (this.bootstrapUrls) {

        var pendingReqs = this.bootstrapUrls.length;
        var retVal = {};

        // harvest information from the remote urls and merge it into one object
        var opts = {
          done: function (data) {
            pendingReqs--;
            _.extend(retVal, data);
            if (pendingReqs <= 0) defer.resolve(retVal);
          },
          fail: function () {
            pendingReqs--;
            if (pendingReqs <= 0) defer.resolve(retVal);
          },
          type: 'GET'
        };
        var redirect_uri = location.origin + location.pathname;

        _.each(this.bootstrapUrls, function (url) {
          if (url.indexOf('http') > -1) {
            opts.u = url;
            api.request(new ApiRequest({
                query: new ApiQuery({redirect_uri: redirect_uri}),
                target: ''}),
              opts);
          }
          else {
            delete opts.u;
            api.request(new ApiRequest({
                query: new ApiQuery({redirect_uri: redirect_uri}),
                target: url}),
              opts);
          }
        });

        setTimeout(function() {
            if (defer.state() == 'resolved')
              return;
            defer.reject();
          },
          3000);
      }
      else {
        setTimeout(function() {
          defer.resolve({}),
            1
        });
      }
      return defer;
    },

    /**
     * Reload the application - by simply changing the URL (append bbbRedirect=1)
     * If the url already contains 'bbbRedirect', redirect to the error page.
     * @param errorPage
     */
    reload: function(endPage) {
      if (location.search.indexOf('debug') > -1) {
        console.warn('Debug stop, normally would reload to: ' + endPage);
        return; // do nothing
      }

      if (location.search && location.search.indexOf('bbbRedirect=1') > -1) {
        return this.redirect(endPage);
      }
      location.search = location.search ? location.search + '&bbbRedirect=1' : 'bbbRedirect=1';
    },

    redirect: function(endPage) {
      if (this.router) {
        location.pathname = this.router.root + endPage;
      }
      // let's replace the last element from pathname - this code will run only when
      // router is not yet available; therefore it should hit situations when the app
      // was not loaded (but it is not bulletproof - the urls can vary greatly)
      // TODO: intelligently explore the rigth url (by sending HEAD requests)
      location.href = location.protocol + '//' + location.hostname + ':' + location.port +
        location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/' + endPage;
    },

    start: function(Router) {
      var app = this;
      var beehive = this.getBeeHive();
      var api = beehive.getService("Api");
      var conf = this.getObject('DynamicConfig');

      var complain = function(x) {
        throw new Error("Ooops. Check you config! There is no " + x + " component @#!")
      };

      var navigator = app.getBeeHive().Services.get('Navigator');
      if (!navigator)
        complain('services.Navigator');


      var masterPageManager = app.getObject('MasterPageManager');
      if (!masterPageManager)
        complain('objects.MasterPageManager');

      // get together all pages and insert widgets there
      masterPageManager.assemble(app);

      // attach the master page to the body
      $('div#body-template-container').empty().append(masterPageManager.view.el);


      // kick off routing
      app.router = new Router();
      app.router.activate(beehive.getHardenedInstance());

      // get ready to handle navigation signals
      navigator.start(this);
      navigator.router = app.router; // this feels hackish


      // Trigger the initial route and enable HTML5 History API support
      Backbone.history.start(conf ? conf.routerConf : {});


      // All navigation that is relative should be passed through the navigate
      // method, to be processed by the router. If the link has a `data-bypass`
      // attribute, bypass the delegation completely.
      $(document).on("click", "a[href]:not([data-bypass])", function (evt) {

        var attr = $(this).attr("href");

        //getting rid of first character so router.routes can easily do regex matches
        var withoutSlashOrHash = attr.match(/^[#/]*(.*)/);
        withoutSlashOrHash = withoutSlashOrHash.length === 2 ? withoutSlashOrHash[1] : attr;

        var route = _.find(Backbone.history.handlers, function (h) {
          //testing to see if it matches any router route other than the "catchall" 404 route
          if (h.route.test(withoutSlashOrHash) && h.route.toString() !== /^(.*?)$/.toString()) {

            return true
          }
        });

        if (route !== undefined) {

          evt.preventDefault();
          Backbone.history.navigate(attr, true);
        }
      });

      $(document).on("scroll", function () {

        if ($("#landing-page-layout").length > 0) {
          return
        }
        //navbar is currently 40 px height
        if ($(window).scrollTop() > 50) {
          $(".s-quick-add").addClass("hidden");
          $(".s-search-bar-full-width-container").addClass("s-search-bar-motion");
        }
        else {
          $(".s-search-bar-full-width-container").removeClass("s-search-bar-motion");
          $(".s-quick-add").removeClass("hidden");

        }
      });


    },

    /**
     * After bootstrap receives all data, this routine should decide what to do with
     * them
     */
    onBootstrap: function(data) {
      // set the API key
      if (data.access_token) {
        var api = this.getBeeHive().getService('Api');
        if (api.access_token) {
          console.warn('Redefining access_token: ' + api.access_token);
        }
        api.access_token = data.token_type + ':' + data.access_token;
        api.refresh_token = data.refresh_token;
        api.expires_in = data.expires_in;
      }
    },

    getApiAccess: function(options) {
      var api = this.getBeeHive().getService('Api');
      var redirect_uri = location.origin + location.pathname;
      var self = this;
      var defer = $.Deferred();
      api.request(new ApiRequest({
          query: new ApiQuery({redirect_uri: redirect_uri}),
          target: '/bootstrap'}),
         {
          done: function (data) {
            if (options.reconnect) {
              self.onBootstrap(data);
            }
            defer.resolve(data);
          },
          fail: function () {
            defer.reject(arguments);
          },
          type: 'GET'
        });
      return defer;
    }


  };

  return Mixin;
});
