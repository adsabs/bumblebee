define([
    'underscore',
    'bootstrap',
    'jquery',
    'xml2json',
    'backbone',
    'js/components/generic_module',
    'js/mixins/dependon',
    'js/services/orcid_api_constants'
  ],
  function (_,
            Bootstrap,
            $,
            Xml2json,
            Backbone,
            GenericModule,
            Mixins,
            OrcidApiConstants) {

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

    var ORCID_ENDPOINT = 'https://sandbox.orcid.org';
    var ORCID_API_ENDPOINT = 'https://api.sandbox.orcid.org/v1.1';
    var ORCID_PROFILE_URL = ORCID_API_ENDPOINT + '/{0}/orcid-profile';
    var ORCID_WORKS_URL = ORCID_API_ENDPOINT + '/{0}/orcid-works';
    var EXCHANGE_TOKEN_URI = 'http://localhost:3000/oauth/exchangeAuthCode';


    var OrcidApi = GenericModule.extend({
      orcidProxyUri: '',
      userData: {},

      activate: function (beehive) {
        this.setBeeHive(beehive);
        //this.pubSub = this.getBeeHive().getService('PubSub');
        ////
        //this.pubSubKey = this.pubSub.getPubSubKey();
      },
      initialize: function (options) {

        var _that = this;

        window.oauthAuthCodeReceived = function (code) {
          _that.oauthAuthCodeReceived(code, _that);
        }

        Backbone.Events.on(OrcidApiConstants.Events.Login, function(){
          _that.showLoginDialog();
        });

        Backbone.Events.on(OrcidApiConstants.Events.SignOut, function(){
          _that.signOut();
        });

        Backbone.Events.on(OrcidApiConstants.Events.OrcidAction, function(){
          _that.processOrcidAction();
        });
      },
      oauthAuthCodeReceived: function (code, orcidApiObj) {

        var deferred = $.Deferred();

        orcidApiObj.sendData({
          type: "GET",
          url: EXCHANGE_TOKEN_URI,
          data: {code: code}
        })
          .done(function (authData) {

            orcidApiObj.sendData({
              type: "GET",
              url: ORCID_PROFILE_URL.format(authData.orcid),
              headers: {
                Authorization: "Bearer {0}".format(authData.access_token)
              }
            })
              .done(function (orcidProfileXml) {
                var userSession = {
                  authData: authData,
                  orcidProfile: $.xml2json(orcidProfileXml)
                };

                var beeHive = orcidApiObj.getBeeHive();
                var LocalStorage = beeHive.getService("LocalStorage");

                LocalStorage.setObject("userSession", userSession);

                deferred.resolve();

                //var pubSub = orcidApiObj.pubSub;
                //pubSub.publish(orcidApiObj.pubSubKey, pubSub.ORCID_ANNOUNCEMENT, {msgType: 'login', state: 'completed'})

                Backbone.Events.trigger(OrcidApiConstants.Events.LoginSuccess, userSession.orcidProfile['#document']['orcid-message']['orcid-profile']['orcid-bio']['personal-details']);
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
          .setObject("userSession", undefined);
      },

      triggerLoginSuccess: function(msg){
        Backbone.Events.trigger(OrcidApiConstants.Events.LoginSuccess, msg);
      },

      processOrcidAction: function(data){

      },

      showLoginDialog: function () {
        var ORCID_OAUTH_CLIENT_ID = 'APP-P5ANJTQRRTMA6GXZ';
        var ORCID_REDIRECT_URI = 'http://localhost:3000/oauthRedirect.html';

        var url = ORCID_ENDPOINT
          + "/oauth/authorize?scope=/orcid-profile/read-limited&response_type=code&access_type=offline"
          + "&client_id=" + ORCID_OAUTH_CLIENT_ID
          + "&redirect_uri=" + ORCID_REDIRECT_URI;


        var WIDTH = 600;
        var HEIGHT = 650;
        var left = (screen.width / 2) - (WIDTH / 2);
        var top = (screen.height / 2) - (HEIGHT / 2);

        window.open(url, "ORCID Login", 'width=' + WIDTH + ', height=' + HEIGHT + ', top=' + top + ', left=' + left);
      },

      addWorks: function(orcidWorks) {
        var beeHive = this.getBeeHive();
        var LocalStorage = beeHive.getService("LocalStorage");

        var userSession = LocalStorage.getObject("userSession");

        var Json2Xml = beeHive.getService("Json2Xml");

        return this.sendData({
          type: "POST",
          url: ORCID_WORKS_URL.format(userSession.authData.orcid),
          // TODO: Find better way how to do this
          data: Json2Xml.xml(orcidWorks, { attributes_key: '$', header: true }).replace('<orcid-message>', '<orcid-message xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.orcid.org/ns/orcid https://raw.github.com/ORCID/ORCID-Source/master/orcid-model/src/main/resources/orcid-message-1.1.xsd" xmlns="http://www.orcid.org/ns/orcid">'),
          headers: {
            Authorization: "Bearer {0}".format(userSession.authData.access_token),
            "Content-Type": "application/orcid+xml"
          }});
      },

      replaceAllWorks: function(orcidWorks) {
        var beeHive = this.getBeeHive();
        var LocalStorage = beeHive.getService("LocalStorage");

        var userSession = LocalStorage.getObject("userSession");

        var Json2Xml = beeHive.getService("Json2Xml");

        return this.sendData({
          type: "PUT",
          url: ORCID_WORKS_URL.format(userSession.authData.orcid),
          // TODO: Find better way how to do this
          data: Json2Xml.xml(orcidWorks, { attributes_key: '$', header: true }).replace('<orcid-message>', '<orcid-message xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.orcid.org/ns/orcid https://raw.github.com/ORCID/ORCID-Source/master/orcid-model/src/main/resources/orcid-message-1.1.xsd" xmlns="http://www.orcid.org/ns/orcid">'),
          headers: {
            Authorization: "Bearer {0}".format(userSession.authData.access_token),
            "Content-Type": "application/orcid+xml"
          }});
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