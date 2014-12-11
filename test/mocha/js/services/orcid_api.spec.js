define([
    'js/components/generic_module',
    'js/mixins/dependon',
    'js/services/orcid_api',
    'js/services/orcid_api_constants'

  ],
  function (GenericModule,
            Mixins,
            OrcidApi,
            OrcidApiConstants) {
    describe("Orcid API service", function () {
      this.timeout(60000);

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

      it('should call processOrcidAction function on OrcidApiConstants.Events.OrcidAction', function(done){
        var orcidApi = new OrcidApi();

        var spy = sinon.spy(orcidApi, "processOrcidAction");

        Backbone.Events.trigger(OrcidApiConstants.Events.OrcidAction, {dummy:'dummy'});

        expect(spy.called).to.be.ok;

        done();
      });

      it('show login dialog', function (done) {
        var orcidApi = new OrcidApi();
        orcidApi.showLoginDialog();
        var oauthAuthCodeReceived_original = orcidApi.oauthAuthCodeReceived;

        orcidApi.oauthAuthCodeReceived = function (code, _that) {

          var deferred = $.Deferred();

          var promise = oauthAuthCodeReceived_original(code, _that);

          promise
            .done(function () {
              expect(code).to.be.a('string');
              expect(orcidApi.userData.orcidProfile).to.be.an('object');
              expect(orcidApi.userData.authData).to.be.an('object');

              deferred.resolve();

              done();
            })
            .fail(function () {
              deferred.reject();
            });

          return deferred.promise();
        };
      });
    });
  }
)