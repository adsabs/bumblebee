define([
        'js/components/generic_module',
        'js/mixins/dependon',
        'js/services/orcid_api'
    ],
    function(
        GenericModule,
        Mixins,
        OrcidApi
    ){
        describe("Orcid API service", function () {
            this.timeout(60000);

            it ('should be GenericModule', function(done) {
                expect(new OrcidApi()).to.be.an.instanceof(GenericModule);
                expect(new OrcidApi()).to.be.an.instanceof(OrcidApi);
                done();
            });

            it ('should have empty url', function(done){
                var orcidApi = new OrcidApi();
                expect(orcidApi.orcidProxyUri == '').to.be.true;
                done();
            });

            it('show login dialog', function(done)
            {
                var orcidApi = new OrcidApi();
                orcidApi.showLoginDialog();
                var oauthAuthCodeReceived_original = orcidApi.oauthAuthCodeReceived;

                orcidApi.oauthAuthCodeReceived = function(code, _that){

					var deferred = $.Deferred();

                    var promise = oauthAuthCodeReceived_original(code, _that);

					promise
					  .done(function() {
						  expect(code).to.be.a('string');
						  expect(orcidApi.userData.orcidProfile).to.be.an('object');
						  expect(orcidApi.userData.authData).to.be.an('object');

						  deferred.resolve();

						  done();
					  })
					  .fail(function() {
						  deferred.reject();
					  });

					return deferred.promise();
                };
            });
        });
    }
)