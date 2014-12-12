define([
    'js/components/generic_module',
    'js/mixins/dependon',
    'jquery',
    'js/services/orcid_api',
    'underscore',
    'xml2json',
    'js/components/application',
    'js/services/orcid_api_constants'
  ],

  function (GenericModule, Mixins, $, OrcidApi, _, xml2json, Application, OrcidApiConstants) {

    var app = new Application();
    var config = {
      core: {
        services: {
          PubSub: 'js/services/pubsub',
          Api: 'js/services/api',
          LocalStorage: 'js/services/localStorage',
          OrcidApi: 'js/services/orcid_api',
          Json2Xml: 'js/services/json2xml'
        },
        objects: {
          QueryMediator: 'js/components/query_mediator'
        }
      },
      widgets: {
      }
    };

    app.activate();

    var beeHive = app.getBeeHive();

    describe("Orcid API service", function () {
      this.timeout(60000);

      var promise = app.loadModules(config);

      it('prepare', function (done) {
        promise.done(done);
      });

      it('input to spec is not undefined', function(done){

        expect(OrcidApi != undefined).to.be.true
        expect(OrcidApiConstants != undefined).to.be.true

        done();

      });
      it('should be GenericModule', function (done) {
        expect(new OrcidApi()).to.be.an.instanceof(GenericModule);
        expect(new OrcidApi()).to.be.an.instanceof(OrcidApi);
        done();
      });

      it('should have empty url', function (done) {
        var orcidApi = new OrcidApi();
        expect(orcidApi.orcidProxyUri == '').to.be.true;
        done();
      });

      it('should trigger success over backbone.events', function(done){
        var orcidApi = new OrcidApi();
      


        var callback = function(e){
          expect(e.dummy == 'dummy').to.be.true;

          Backbone.Events.off(OrcidApiConstants.Events.LoginSuccess, callback);

          done();
        };

        Backbone.Events.on(OrcidApiConstants.Events.LoginSuccess, callback);

        orcidApi.triggerLoginSuccess({dummy:'dummy'});

      });

      it('function should be called on event trigger', function(done){
        var orcidApi = new OrcidApi();
        orcidApi.activate(beeHive);

        orcidApi.signOut = function(){};
        var spy = sinon.spy(orcidApi, "signOut");
        Backbone.Events.trigger(OrcidApiConstants.Events.SignOut);
        expect(spy.called).to.be.ok;

        orcidApi.showLoginDialog = function(){};
        var spy = sinon.spy(orcidApi, "showLoginDialog");
        Backbone.Events.trigger(OrcidApiConstants.Events.LoginRequested);
        expect(spy.called).to.be.ok;

        orcidApi.processOrcidAction = function(){};
        var spy = sinon.spy(orcidApi, "processOrcidAction");
        Backbone.Events.trigger(OrcidApiConstants.Events.OrcidAction, {dummy:'dummy'});
        expect(spy.called).to.be.ok;

        done();
      });

      it('should delete userSession data on SignOut', function(done){
        var orcidApi = new OrcidApi();// beeHive.getService("OrcidApi");
        orcidApi.activate(beeHive);

        var LocalStorage = beeHive.getService("LocalStorage");

        LocalStorage.setObject('userSession', {dummy: 'data'});

        var userSession = LocalStorage.getObject("userSession");

        expect(userSession).to.be.an('object');

        orcidApi.signOut();

        userSession = LocalStorage.getObject("userSession");

        expect(userSession.isEmpty).to.be.true;

        done();
      });

      it('show login dialog', function (done) {
        var orcidApi = new OrcidApi();// beeHive.getService("OrcidApi");
        orcidApi.activate(beeHive);
        orcidApi.showLoginDialog();
        var oauthAuthCodeReceived_original = orcidApi.oauthAuthCodeReceived;

        orcidApi.oauthAuthCodeReceived = function (code, _that) {

          var deferred = $.Deferred();

          var promise = oauthAuthCodeReceived_original(code, _that);

          promise
            .done(function () {
              expect(code).to.be.a('string');

//              var beeHive = GenericModule.getBeeHive();
              var LocalStorage = beeHive.getService("LocalStorage");

              var userSession = LocalStorage.getObject("userSession");

              expect(userSession.orcidProfile).to.be.an('object');
              expect(userSession.authData).to.be.an('object');

              deferred.resolve();

              done();
            })
            .fail(function () {
              deferred.reject();
            });

          return deferred.promise();
        };
      });

      it('add orcid works', function (done) {
        var orcidApi = new OrcidApi();
        orcidApi.activate(beeHive);

        orcidApi.addWorks({
          "orcid-message": {
            "$": {
              "xmlns": "http://www.orcid.org/ns/orcid"
            },
            "message-version": "1.1",
            "orcid-profile": {
              "orcid-activities": {
                "$": {},
                "orcid-works": {
                  "$": {},
                  "orcid-work": {
                    "work-title": {
                      "$": {},
                      "title": "Testing publiction"
                    },
                    "work-type": "test"
                  }
                }
              }
            }
          }
        })
          .done(done);

        //done();
      });
    });
  }
);