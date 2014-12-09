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

            it ('should call the server', function(done){
                var orcidApi = new OrcidApi();
                orcidApi.orcidProxyUri = 'http://localhost:3000/oauth/';

                orcidApi.getOAuthCode(function(){
                    done();
                });
            });

            it('something new 123', function(done)
            {
                done();
            });
        });
    }
)