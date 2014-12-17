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

      routeOrcidPubSub: function(msg){

        switch(msg.msgType){
          case OrcidApiConstants.Events.LoginRequested:
            this.showLoginDialog();
            break;
          case OrcidApiConstants.Events.SignOut:
            this.signOut();
            break;
          case OrcidApiConstants.Events.OrcidAction:
            this.processOrcidAction(msg.data);
            break;
        }
      },

      activate: function (beehive) {
        this.setBeeHive(beehive);
        this.pubSub = this.getBeeHive().getService('PubSub').getHardenedInstance();
        this.pubSubKey = this.pubSub.getPubSubKey();

        var _that = this;

        window.oauthAuthCodeReceived = _.bind(this.oauthAuthCodeReceived, this);
        this.pubSub.subscribe(this.pubSubKey, PubSubEvents.BOOTSTRAP_CONFIGURED, function(page) {
          var code = getParameterByName("code");
          _that.oauthAuthCodeReceived(code, window.location.origin, _that);
        });

        this.pubSub.subscribe(this.pubSub.ORCID_ANNOUNCEMENT, _.bind(this.routeOrcidPubSub, this));

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

                var orcidProfile = userSession.orcidProfile['#document']['orcid-message']['orcid-profile'];

                var pubSub = _that.pubSub;
                pubSub.publish(pubSub.ORCID_ANNOUNCEMENT, {msgType: OrcidApiConstants.Events.LoginSuccess, data: orcidProfile});
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

      processOrcidAction: function(adsData){
        if (data.actionType == 'insert'){
          // create the orcid works message

          var orcidWorksMessage = {
            "orcid-message": {
              "$": {
                "xmlns": "http://www.orcid.org/ns/orcid"
              },
              "message-version": "1.1",
              "orcid-profile": {
                "orcid-activities": {
                  "$": {},
                  "orcid-works": [
                    {
                      "$" : {"visibility" : "public"},
                      "orcid-work": {
                        "work-title": {
                          "$": {},
                          "title": adsData.title // TODO : this as array, so probably concat all items
                        },

                        "short-description" : adsData.abstract,
                        "publication-date": {
                          "year": adsData.year
                        },

                        "work-external-identifiers": {
                          "$": {},
                          "work-external-identifier": {
                            "work-external-identifier-type": 'other-id', // TODO : look at the  http://support.orcid.org/knowledgebase/articles/118807
                            "work-external-identifier-id": adsData.bibcode
                          },
                          "work-external-identifier": {
                            "work-external-identifier-type": 'ads-identifier', // TODO : look at the  http://support.orcid.org/knowledgebase/articles/118807
                            "work-external-identifier-id": adsData.id
                          }
                        },
                        "work-type": "test", // TODO : check http://support.orcid.org/knowledgebase/articles/118795

                        "work-contributors": { // TODO : do in loop over adsData.author
                          "contributor": {
                            "credit-name": "LastName, FirstName",
                            "contributor-attributes": {
                              "contributor-sequence": "first",
                              "contributor-role": "author"
                            }
                          }
                        },

                        "url" : "www.orcid" // TODO: do in loop over adsData.links

                      }
                    }
                  ]
                }
              }
            }
          };


          //"{"abstract":"Laser active imaging systems are widespread tools used in region surveillance and threat identification. However, the photoelectric imaging detector in the imaging systems is easy to be disturbed and this leads to errors of the recognition and even the missing of the target. In this paper, a novel wavelet-weighted multi-scale structural similarity (WWMS-SSIM) algorithm is proposed. 2-D four-level wavelet decomposition is performed for the original and disturbed images. Each image can be partitioned into one low-frequency subband (LL) and a series of octave high-frequency subbands (HL, LH and HH). Luminance, contrast and structure comparison are computed in different subbands with different weighting factors. Based on the results of the above, we can construct a modified WWMS-SSIM. Cross-distorted image quality assessment experiments show that the WWMS-SSIM algorithm is more suitable for the subjective visual feeling comparing with NMSE and SSIM. In the laser-dazzling image quality assessment experiments, the WWMS-SSIM gives more reasonable evaluations to the images with different power and laser spot positions, which can be useful to give the guidance of the laser active imaging system defense and application.","pub":"Optics Laser Technology","volume":"67","email":["-","-","-","-"],"bibcode":"2015OptLT..67..183Q","year":"2015","id":"10666236","keyword":["Image quality assessment","Laser-dazzling effect","Wavelet decomposition"],"author":["Qian, Fang","Guo, Jin","Sun, Tao","Wang, Tingfeng"],"aff":["State Key Laboratory of Laser Interaction with Matter, Changchun Institute of Optics, Fine Mechanics and Physics Chinese Academy of Sciences, Changchun 130033, Jilin, China","State Key Laboratory of Laser Interaction with Matter, Changchun Institute of Optics, Fine Mechanics and Physics Chinese Academy of Sciences, Changchun 130033, Jilin, China","State Key Laboratory of Laser Interaction with Matter, Changchun Institute of Optics, Fine Mechanics and Physics Chinese Academy of Sciences, Changchun 130033, Jilin, China","State Key Laboratory of Laser Interaction with Matter, Changchun Institute of Optics, Fine Mechanics and Physics Chinese Academy of Sciences, Changchun 130033, Jilin, China"],"title":["Quantitative assessment of laser-dazzling effects through wavelet-weighted multi-scale SSIM measurements"],"[citations]":{"num_citations":0,"num_references":2},"identifier":"2015OptLT..67..183Q","resultsIndex":0,"details":{"highlights":["-frequency subband <em>(LL)</em> and a series of octave high-frequency subbands (HL, LH and HH). Luminance, contrast"]},"num_citations":0,"links":{"text":[],"list":[{"letter":"R","title":"References (2)","link":"/#abs/2015OptLT..67..183Q/references"}],"data":[]},"emptyPlaceholder":false,"visible":true,"actionsVisible":true,"orcidActionsVisible":false}"


        }

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
        // TODO : expose just necassary functions

        return this;
      }
    });

    _.extend(OrcidApi.prototype, Mixins.BeeHive);

    return OrcidApi;
  });