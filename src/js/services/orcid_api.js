define([
    'underscore',
    'bootstrap',
    'jquery',
    'backbone',
    'js/components/generic_module',
    'js/mixins/dependon',
    'js/services/orcid_api_constants'
  ],
  function (_,
            Bootstrap,
            $,
            Backbone,
            GenericModule,
            Mixins,
            OrcidApiConstants) {

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

    var OrcidApi = GenericModule.extend({
      orcidProxyUri: '',
      userData: {},

      activate: function (beehive) {
        this.setBeeHive(beehive);
        this.pubSub = this.getBeeHive().getService('PubSub');

        this.pubSubKey = this.pubSub.getPubSubKey();

        var _that = this;

        window.oauthAuthCodeReceived = function (code) {
          _that.oauthAuthCodeReceived(code, _that);
        }
      },
      initialize: function (options) {
        Backbone.Events.on(OrcidApiConstants.Events.OrcidAction, this.processOrcidAction)
      },
      oauthAuthCodeReceived: function (code, orcidApiObj) {

        var EXCHANGE_TOKEN_URI = 'http://localhost:3000/oauth/exchangeAuthCode';
        var ORCID_PROFILE_URL = 'https://api.sandbox.orcid.org/v1.1/{0}/orcid-profile';

        var deferred = $.Deferred();


        $.ajax({
          type: "GET",
          url: EXCHANGE_TOKEN_URI,
          data: {code: code}
        })
          .done(function (authData) {

            $.ajax({
              type: "GET",
              url: ORCID_PROFILE_URL.format(authData.orcid),
              headers: {
                Authorization: "Bearer {0}".format(authData.access_token)
              }
            })
              .done(function (orcidProfileXml) {
                orcidApiObj.userData.authData = authData;
                //orcidApiObj.userData.orcidProfile = $.xml2json(orcidProfileXml);

                deferred.resolve();

                var pubSub = orcidApiObj.pubSub;
                pubSub.publish(orcidApiObj.pubSubKey, pubSub.ORCID_ANNOUNCEMENT, {msgType: 'login', state: 'completed'})

                Backbone.Events.trigger('Orcid-Login-Success');
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

      triggerLoginSuccess: function(msg){
        Backbone.Events.trigger(OrcidApiConstants.Events.LoginSuccess, msg);
      },

      processOrcidAction: function(data){

      },

      showLoginDialog: function () {
        var ORCID_OAUTH_CLIENT_ID = 'APP-P5ANJTQRRTMA6GXZ';
        var ORCID_API_ENDPOINT = 'https://sandbox.orcid.org';
        var ORCID_REDIRECT_URI = 'http://localhost:3000/oauthRedirect.html';

        var url = ORCID_API_ENDPOINT
          + "/oauth/authorize?scope=/orcid-profile/read-limited&response_type=code&access_type=offline"
          + "&client_id=" + ORCID_OAUTH_CLIENT_ID
          + "&redirect_uri=" + ORCID_REDIRECT_URI;


        var WIDTH = 600;
        var HEIGHT = 650;
        var left = (screen.width / 2) - (WIDTH / 2);
        var top = (screen.height / 2) - (HEIGHT / 2);

        window.open(url, "ORCID Login", 'width=' + WIDTH + ', height=' + HEIGHT + ', top=' + top + ', left=' + left);
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
          context: {request: request, api: self},
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