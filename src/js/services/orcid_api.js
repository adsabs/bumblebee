define([
    'underscore',
    'bootstrap',
    'jquery',
    'xml2json',
    'backbone',
    'js/components/generic_module',
    'js/mixins/dependon',
    'js/services/orcid_api_constants',
    'js/components/pubsub_events'
  ],
  function (_,
            Bootstrap,
            $,
            Xml2json,
            Backbone,
            GenericModule,
            Mixins,
            OrcidApiConstants,
			      PubSubEvents) {
    function addXmlHeadersToOrcidMessage(message) {
      var messageCopy = $.extend(true, {}, message);
      messageCopy.$ = {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation": "http://www.orcid.org/ns/orcid https://raw.github.com/ORCID/ORCID-Source/master/orcid-model/src/main/resources/orcid-message-1.1.xsd",
        "xmlns": "http://www.orcid.org/ns/orcid"
      };
      return messageCopy;
    }

    // TODO: move this to some commonUtils.js
    String.prototype.format = function () {
      var args = arguments;
      return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
        if (m == "{{") {
          return "{";
        }
        if (m == "}}") {
          return "}";
        }
        return args[n];
      });
    };

    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var ORCID_OAUTH_CLIENT_ID = 'APP-P5ANJTQRRTMA6GXZ';
    var ORCID_ENDPOINT = 'https://sandbox.orcid.org';
    var ORCID_API_ENDPOINT = 'https://api.sandbox.orcid.org/v1.1';
    var ORCID_PROFILE_URL = ORCID_API_ENDPOINT + '/{0}/orcid-profile';
    var ORCID_WORKS_URL = ORCID_API_ENDPOINT + '/{0}/orcid-works';
    var ORCID_OAUTH_LOGIN_URL = ORCID_ENDPOINT
      + "/oauth/authorize?scope=/orcid-profile/read-limited,/orcid-works/create,/orcid-works/update&response_type=code&access_type=offline"
      + "&client_id=" + ORCID_OAUTH_CLIENT_ID
      + "&redirect_uri={0}";
    var EXCHANGE_TOKEN_URI = 'http://localhost:3000/oauth/exchangeAuthCode';


    var OrcidApi = GenericModule.extend({
      orcidProxyUri: '',
      userData: {},

      activate: function (beehive) {
        this.setBeeHive(beehive);
        this.pubSub = this.getBeeHive().getService('PubSub');
        this.pubSubKey = this.pubSub.getPubSubKey();

        var _that = this;

        window.oauthAuthCodeReceived = _.bind(this.oauthAuthCodeReceived, this);
        this.pubSub.subscribe(this.pubSubKey, PubSubEvents.BOOTSTRAP_CONFIGURED, function(page) {
          var code = getParameterByName("code");
          _that.oauthAuthCodeReceived(code, window.location.origin, _that);
        });

        Backbone.Events.on(OrcidApiConstants.Events.RedirectToLogin, function(){
          _that.redirectToLogin();
        });

        Backbone.Events.on(OrcidApiConstants.Events.LoginRequested, function(){
          _that.showLoginDialog();
        });

        Backbone.Events.on(OrcidApiConstants.Events.SignOut, function(){
          _that.signOut();
        });

        Backbone.Events.on(OrcidApiConstants.Events.OrcidAction, function(){
          _that.processOrcidAction();
        });
      },
      initialize: function (options) {

      },
      cleanLoginWindow: function() {
        if (this.loginWindow) {
          this.loginWindow.onbeforeunload = null;
          this.loginWindow = null;
        }
      },
      redirectToLogin: function() {
        var url = ORCID_OAUTH_LOGIN_URL.format(window.location.origin);

        window.location.replace(url);
      },
      oauthAuthCodeReceived: function (code, redirectUri) {

        this.cleanLoginWindow();

        if (!code || !redirectUri) {
          return;
        }

        var deferred = $.Deferred();

        var _that = this;

        this.sendData({
          type: "GET",
          url: EXCHANGE_TOKEN_URI,
          data: {
            code: code,
            redirectUri: redirectUri
          }
        })
          .done(function (authData) {
            var beeHive = _that.getBeeHive();
            var LocalStorage = beeHive.getService("LocalStorage");
            LocalStorage.setObject("userSession", {
              authData: authData
            });

            _that.refreshUserProfile()
              .done(function () {

                deferred.resolve();

                var userSession = LocalStorage.getObject("userSession");

                Backbone.Events.trigger(
                  OrcidApiConstants.Events.LoginSuccess,
                  userSession.orcidProfile['#document']['orcid-message']['orcid-profile']['orcid-bio']['personal-details']);
              })
              .fail(function (error) {
                deferred.reject(error);
              });

          })
          .fail(function (error) {
            deferred.reject(error);
          });

        return deferred.promise();
      },

      signOut : function(){
        this.getBeeHive()
          .getService('LocalStorage')
          .setObject("userSession", {isEmpty:true});
      },

      triggerLoginSuccess: function(msg){
        Backbone.Events.trigger(OrcidApiConstants.Events.LoginSuccess, msg);
      },

      processOrcidAction: function(data){

      },

      refreshUserProfile: function() {
        var _that = this;

        return this.getUserProfile()
          .done(function (orcidProfileXml) {
            var beeHive = _that.getBeeHive();
            var LocalStorage = beeHive.getService("LocalStorage");
            var userSession = LocalStorage.getObject("userSession");

            userSession.orcidProfile = $.xml2json(orcidProfileXml);

            LocalStorage.setObject("userSession", userSession);

            Backbone.Events.trigger(
              OrcidApiConstants.Events.UserProfileRefreshed,
              userSession.orcidProfile['#document']['orcid-message']['orcid-profile']['orcid-bio']['personal-details']);
          })
      },

      getUserProfile: function() {
        var beeHive = this.getBeeHive();
        var LocalStorage = beeHive.getService("LocalStorage");
        var userSession = LocalStorage.getObject("userSession");

        return this.sendData({
          type: "GET",
          url: ORCID_PROFILE_URL.format(userSession.authData.orcid),
          headers: {
            Authorization: "Bearer {0}".format(userSession.authData.access_token)
          }
        })
      },

      showLoginDialog: function () {
        var ORCID_REDIRECT_URI = 'http://localhost:3000/oauthRedirect.html';

        var url = ORCID_OAUTH_LOGIN_URL.format(ORCID_REDIRECT_URI);

        var WIDTH = 600;
        var HEIGHT = 650;
        var left = (screen.width / 2) - (WIDTH / 2);
        var top = (screen.height / 2) - (HEIGHT / 2);

        this.cleanLoginWindow();

        this.loginWindow = window.open(url, "ORCID Login", 'width=' + WIDTH + ', height=' + HEIGHT + ', top=' + top + ', left=' + left);
        this.loginWindow.onbeforeunload = _.bind(function(e) {
          this.cleanLoginWindow();
          Backbone.Events.trigger(OrcidApiConstants.Events.LoginCancelled);
        }, this);
      },

      addWorks: function(orcidWorks) {
        var beeHive = this.getBeeHive();
        var LocalStorage = beeHive.getService("LocalStorage");
        var userSession = LocalStorage.getObject("userSession");
        var Json2Xml = beeHive.getService("Json2Xml");

        orcidWorks = addXmlHeadersToOrcidMessage(orcidWorks);

        var _that = this;

        return this.sendData({
          type: "POST",
          url: ORCID_WORKS_URL.format(userSession.authData.orcid),
          data: Json2Xml.xml(orcidWorks, { attributes_key: '$', header: true }),
          headers: {
            Authorization: "Bearer {0}".format(userSession.authData.access_token),
            "Content-Type": "application/orcid+xml"
          }})
          .done(function() {
            _that.refreshUserProfile();
          });
      },

      replaceAllWorks: function(orcidWorks) {
        var beeHive = this.getBeeHive();
        var LocalStorage = beeHive.getService("LocalStorage");
        var userSession = LocalStorage.getObject("userSession");
        var Json2Xml = beeHive.getService("Json2Xml");

        orcidWorks = addXmlHeadersToOrcidMessage(orcidWorks);

        var _that = this;

        return this.sendData({
          type: "PUT",
          url: ORCID_WORKS_URL.format(userSession.authData.orcid),
          data: Json2Xml.xml(orcidWorks, { attributes_key: '$', header: true }),
          headers: {
            Authorization: "Bearer {0}".format(userSession.authData.access_token),
            "Content-Type": "application/orcid+xml"
          }})
          .done(function() {
            _that.refreshUserProfile();
          });
      },

      sendData: function (opts) {

        var request = '';

        var _opts = {
          type: 'GET',
          url: opts.url,
          dataType: 'json',
          data: opts.data,
          contentType: 'application/x-www-form-urlencoded',
          cache: false,
          headers: opts.headers || {},
          context: {request: request, api: self },
          done: opts.done,
          fail: opts.fail,
          always: opts.always
        };

        var jqXhr = $.ajax(opts)
          .always(_opts.always ? [this.always, _opts.always] : this.always)
          .done(_opts.done || this.done)
          .fail(_opts.fail || this.fail);

        jqXhr = jqXhr.promise(jqXhr);

        return jqXhr;
      },

      done: function () {

      },
      fail: function () {

      },
      always: function () {

      },

      getHardenedInstance: function () {
        return this;
      }
    });

    _.extend(OrcidApi.prototype, Mixins.BeeHive);

    return OrcidApi;
  });