
/*
 * This module contains a set of utilities to bootstrap Discovery app
 */
define([
  'underscore',
  'jquery',
  'backbone',
  'js/components/api_query',
  'js/components/api_request',
  'js/components/pubsub_events'
],
  function(
    _,
    $,
    Backbone,
    ApiQuery,
    ApiRequest,
    PubSubEvents
  ) {
    var Mixin = {
      configure: function() {
        var conf = this.getObject('DynamicConfig');
        if (conf) {
          var beehive = this.getBeeHive();
          var api = beehive.getService('Api');

          if (conf.root) {
            api.url = conf.root + '/' + api.url;
            this.root = conf.root;
          }
          if (conf.debug !== undefined) {
            beehive.debug = conf.debug;
            this.getController('QueryMediator').debug = conf.debug;
          }

          if (conf.apiRoot) {
            api.url = conf.apiRoot;
          }
          this.bootstrapUrls = conf.bootstrapUrls;
        }
      },

      bootstrap: function() {
        var defer = $.Deferred();
        var api = this.getBeeHive().getService('Api');

        // load configuration from remote endpoints
        if (this.bootstrapUrls) {
          var pendingReqs = this.bootstrapUrls.length;
          var retVal = {};

          // harvest information from the remote urls and merge it into one object
          var opts = {
            done: function(data) {
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
          var redirectUri = location.origin + location.pathname;

          _.each(this.bootstrapUrls, function(url) {
            if (url.indexOf('http') > -1) {
              opts.u = url;
              api.request(new ApiRequest({
                query: new ApiQuery({redirect_uri: redirectUri}),
                target: ''}),
              opts);
            }
            else {
              delete opts.u;
              api.request(new ApiRequest({
                query: new ApiQuery({redirect_uri: redirectUri}),
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

      reload: function(endPage) {
        throw new Error('Should never be called by an embedded app.');
      },

      redirect: function(endPage) {
        throw new Error('Should never be called by an embedded app.');
      },

      start: function(Router) {
        var app = this;
        var beehive = this.getBeeHive();
        var api = beehive.getService("Api");
        var conf = this.getObject('DynamicConfig');

        this.getBeeHive().getObject("AppStorage").setConfig(conf);

        var complain = function(x) {
          throw new Error("Ooops. Check your config! There is no " + x + " component @#!")
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
        $(conf.targetElement || 'div#body-template-container').empty().append(masterPageManager.view.el);

        // kick off routing
        app.router = new Router();
        app.router.activate(beehive.getHardenedInstance());

        // get ready to handle navigation signals
        navigator.start(this);
        navigator.router = app.router; // this feels hackish

        // Trigger the initial route and enable HTML5 History API support
        Backbone.history.start(conf ? conf.routerConf : {});
      }
    };

    return Mixin;
  });
