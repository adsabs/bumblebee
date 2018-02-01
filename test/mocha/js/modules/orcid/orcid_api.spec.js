define([
    'js/components/generic_module',
    'js/mixins/dependon',
    'jquery',
    'js/modules/orcid/orcid_api',
    'js/components/persistent_storage',
    'underscore',
    'js/bugutils/minimal_pubsub',
    'js/components/pubsub_events',
    'js/modules/orcid/module'
  ],

  function (
    GenericModule,
    Mixins,
    $,
    OrcidApi,
    LocalStorage,
    _,
    MinimalPubsub,
    PubSubEvents,
    OrcidModule
  ) {


    describe("Orcid API service (orcid_api.spec.js)", function () {

      describe("OAuth", function() {
        var minsub, beehive;
        beforeEach(function(done) {
          minsub = new (MinimalPubsub.extend({
            request: function (apiRequest) {
              if (apiRequest.get('target').indexOf('/exchangeOAuthCode') > -1) {
                expect(apiRequest.get('query').get('code')).to.eql(['secret']);
                return {
                  "access_token":"4274a0f1-36a1-4152-9a6b-4246f166bafe",
                  "token_type":"bearer",
                  "expires_in":3599,
                  "scope":"/orcid-works/create /orcid-profile/read-limited /orcid-works/update",
                  "orcid":"0000-0001-8178-9506",
                  "name":"Roman Chyla"};
              }
              else if (apiRequest.get('target').indexOf('test-query') > -1) {
                var opts = apiRequest.get('options');
                expect(opts.headers["Orcid-Authorization"]).to.eql('Bearer 4274a0f1-36a1-4152-9a6b-4246f166bafe');
                expect(opts.data).to.eql('{"data":{"foo":"bar"}}');
                return {success: true};
              }
            }
          }))({verbose: false});
          beehive = minsub.beehive;
          done();
        });

        afterEach(function(done) {
          //this.server.restore();
          done();
        });

        var getOrcidApi = function() {
          beehive.addObject('DynamicConfig', {
            orcidClientId: 'APP-P5ANJTQRRTMA6GXZ',
            orcidApiEndpoint: 'https://api.orcid.org',
            orcidRedirectUrlBase: 'http://localhost:8000',
            orcidLoginEndpoint: 'https://api.orcid.org/oauth/authorize'
          });


          var oModule = new OrcidModule();
          oModule.activate(beehive);
          return beehive.getService('OrcidApi');
        };
        
        it("has methods to extract access code", function() {
          var oApi = getOrcidApi();
          // it receives window.location.search
          expect(oApi.getUrlParameter('code', '?foo=bar&code=H1trXI')).to.eql('H1trXI');
          expect(oApi.hasExchangeCode('?foo=bar&code=H1trXI')).to.eql(true);
          expect(oApi.getExchangeCode('?foo=bar&code=H1trXI')).to.eql('H1trXI');
        });

        it("can exchange code for access_token (auth data)", function(done) {
          var oApi = getOrcidApi();
          var r = oApi.getAccessData('secret');
          expect(r.done).to.be.defined;
          //this.server.respond();
          r.done(function(res) {
            expect(res).to.eql({
              "access_token":"4274a0f1-36a1-4152-9a6b-4246f166bafe",
              "token_type":"bearer",
              "expires_in":3599,
              "scope":"/orcid-works/create /orcid-profile/read-limited /orcid-works/update",
              "orcid":"0000-0001-8178-9506",
              "name":"Roman Chyla"});

            oApi.saveAccessData(res);

            expect(oApi.authData).to.eql(res);

            // the expires was added
            expect(oApi.authData.expires).to.be.gt(new Date().getTime());

            // now request uses access_token
            var req = oApi.sendData('test-query', {data: {foo: 'bar'}});
            req.done(function(res) {
              expect(res).to.eql({success: true});
              done();
            });

          })
        });

        it("should handle ORCID sign in", function(){

          var oApi = getOrcidApi();

          beehive.getService("PubSub").publish = sinon.spy();

          oApi.signIn();

          expect(JSON.stringify(beehive.getService("PubSub").publish.args[0])).to.eql('[{},"[App]-Exit",{"type":"orcid","url":"https://api.orcid.org/oauth/authorize?scope=/orcid-profile/read-limited%20/orcid-works/create%20/orcid-works/update&response_type=code&access_type=offline&show_login=true&client_id=APP-P5ANJTQRRTMA6GXZ&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2F%23%2Fuser%2Forcid"}]');
          expect(JSON.stringify(beehive.getService("PubSub").publish.args[1])).to.eql('[{},"[PubSub]-Orcid-Announcement","login"]')
        });

        it("signOut forgets authentication details", function() {
          var oApi = getOrcidApi();
          expect(oApi.hasAccess()).to.be.eql(false);
          oApi.authData = {foo: 'bar'};
          expect(oApi.hasAccess()).to.be.eql(true);
          oApi.signOut();
          expect(oApi.hasAccess()).to.be.eql(false);

          oApi.authData = {expires: new Date().getTime() + 100};
          expect(oApi.hasAccess()).to.be.eql(true);
          oApi.authData = {expires: new Date().getTime() - 100};
          expect(oApi.hasAccess()).to.be.eql(false);
        });

      });

      describe("Orcid Actions", function() {

        var minsub, beehive, defaultResponse;
        beforeEach(function (done) {

          defaultResponse = function() {
            return {
              "message-version": "1.2",
              "orcid-profile": {
                "orcid": null,
                "orcid-identifier": {
                  "value": null,
                  "uri": "http://sandbox.orcid.org/0000-0001-8178-9506",
                  "path": "0000-0001-8178-9506",
                  "host": "sandbox.orcid.org"
                },
                "orcid-preferences": {
                  "locale": "EN"
                },
                "orcid-history": {
                  "creation-method": "DIRECT",
                  "submission-date": {
                    "value": 1422645321288
                  },
                  "last-modified-date": {
                    "value": 1423688425823
                  },
                  "claimed": {
                    "value": true
                  },
                  "source": null,
                  "verified-email": {
                    "value": false
                  },
                  "verified-primary-email": {
                    "value": false
                  },
                  "visibility": null
                },
                "orcid-activities": {
                  "affiliations": null,
                  "orcid-works": {
                    "orcid-work": [
                      {
                        "language-code": "es",
                        "put-code": "469257",
                        "source": {
                          "source-client-id": {
                            "path": "APP-P5ANJTQRRTMA6GXZ",
                            "host": "sandbox.orcid.org",
                            "uri": "http://sandbox.orcid.org/client/APP-P5ANJTQRRTMA6GXZ",
                            "value": null
                          },
                          "source-name": {
                            "value": "nasa ads"
                          },
                          "source-date": {
                            "value": 1424194783005
                          }
                        },
                        "work-title": {
                          "subtitle": null,
                          "title": {
                            "value": "Tecnologias XXX"
                          }
                        },
                        "last-modified-date": {
                          "value": 1424194783005
                        },
                        "created-date": {
                          "value": 1424194783005
                        },
                        "visibility": "PUBLIC",
                        "work-type": "JOURNAL_ARTICLE",
                        "publication-date": {
                          "month": {
                            "value": "11"
                          },
                          "day": null,
                          "media-type": null,
                          "year": {
                            "value": "2014"
                          }
                        },
                        "journal-title": {
                          "value": "El Profesional de la Informacion"
                        },
                        "work-external-identifiers": {
                          "scope": null,
                          "work-external-identifier": [
                            {
                              "work-external-identifier-id": {
                                "value": "test-bibcode"
                              },
                              "work-external-identifier-type": "BIBCODE"
                            }
                          ]
                        },
                        "url": null,
                        "work-contributors": {
                          "contributor": null
                        }
                      },
                      {
                        "put-code": "466190",
                        "work-title": {
                          "title": {
                            "value": "ADS 2.0"
                          },
                          "subtitle": null
                        },
                        "journal-title": {
                          "value": "foo"
                        },
                        "work-external-identifiers": {
                          "scope": null,
                          "work-external-identifier": [
                            {
                              "work-external-identifier-id": {
                                "value": "bibcode-foo"
                              },
                              "work-external-identifier-type": "bibcode"
                            }
                          ]
                        },
                        "work-type": "JOURNAL_ARTICLE",
                        "publication-date": {
                          "year": {
                            "value": "2015"
                          },
                          "month": {
                            "value": "01"
                          },
                          "day": {
                            "value": "01"
                          },
                          "media-type": null
                        },
                        "url": null,
                        "source": {
                          "source-orcid": {
                            "value": null,
                            "uri": "http://sandbox.orcid.org/0000-0001-8178-9506",
                            "path": "0000-0001-8178-9506",
                            "host": "sandbox.orcid.org"
                          },
                          "source-name": {
                            "value": "Roman Chyla"
                          },
                          "source-date": {
                            "value": 1422645668284
                          }
                        },
                        "created-date": {
                          "value": 1422645668284
                        },
                        "last-modified-date": {
                          "value": 1422645668284
                        },
                        "visibility": "PUBLIC"
                      }
                    ],
                    "scope": null
                  }
                },
                "type": "USER",
                "group-type": null,
                "client-type": null
              }
            };
          };

          minsub = new (MinimalPubsub.extend({
            request: function (apiRequest) {
              var target = apiRequest.get('target');
              var opts = apiRequest.get('options');

              if (target.indexOf('/orcid-profile') > -1) {
                expect(opts.headers["Orcid-Authorization"]).to.eql('Bearer 4274a0f1-36a1-4152-9a6b-4246f166bafe');
                return defaultResponse();
              }
              else if (target.indexOf('orcid-works') > -1) {
                expect(opts.headers["Orcid-Authorization"]).to.eql('Bearer 4274a0f1-36a1-4152-9a6b-4246f166bafe');
                if (opts.type == 'GET')
                  return defaultResponse();
                return opts;
              }
              else if (target.indexOf('query')) {
                return {
                  "responseHeader": {
                    "status": 0,
                    "QTime": 2,
                    "params": {
                      "fl": "id,bibcode,alternate_bibcode,doi",
                      "indent": "true",
                      "q": "doi:\"*\" and alternate_bibcode:2015*",
                      "_": "1427847655704",
                      "wt": "json",
                      "rows": "5"
                    }
                  },
                  "response": {
                    "numFound": 2441,
                    "start": 0,
                    "docs": [
                      {
                        "alternate_bibcode": [
                          "2015arXiv150105026H"
                        ],
                        "doi": [
                          "10.1103/PhysRevLett.84.3823"
                        ],
                        "id": "5796418",
                        "bibcode": "test-bibcode"
                      },
                      {
                        "alternate_bibcode": [
                          "bibcode-foo"
                        ],
                        "doi": [
                          "10.1126/science.276.5309.88"
                        ],
                        "id": "1135646",
                        "bibcode": "1997Sci...276...88V"
                      },
                      {
                        "alternate_bibcode": [
                          "2015CeMDA.tmp....1D"
                        ],
                        "doi": [
                          "10.1007/s10569-014-9601-4"
                        ],
                        "id": "10734037",
                        "bibcode": "2015CeMDA.121..301D"
                      }
                    ]
                  }
                };
              }
            }
          }))({verbose: false});

          beehive = minsub.beehive;

          done();
        });

        var getOrcidApi = function() {
          beehive.addObject('DynamicConfig', {
            orcidClientId: 'APP-P5ANJTQRRTMA6GXZ',
            orcidApiEndpoint: 'https://api.orcid.org',
            orcidRedirectUrlBase: 'http://localhost:8000'
          });
          var oModule = new OrcidModule();
          oModule.activate(beehive);
          var oApi = beehive.getService('OrcidApi');
          oApi.saveAccessData({
            "access_token":"4274a0f1-36a1-4152-9a6b-4246f166bafe",
            "orcid":"0000-0001-8178-9506"
          });
          return beehive.getService('OrcidApi');
        };

        it('getUserProfile', function(done) {
          var oApi = getOrcidApi();
          oApi.getUserProfile()
            .done(function(res) {
              expect(res['orcid-identifier']).to.be.defined;
              done();
            });
        });

        it('getWorks', function(done) {
          var oApi = getOrcidApi();
          oApi.getWorks()
            .done(function(res) {
              expect(res['orcid-work']).to.be.defined;
              done();
            });
        });

        it('getExternalIds and isWorkFromADS', function(done){
          var oApi = getOrcidApi();
          oApi.getWorks()
            .done(function(res) {
              var ids = oApi.getExternalIds(res);
              expect(ids).to.eql({
                "test-bibcode":{"idx":0,"type":"BIBCODE","put-code":"469257"},
                "bibcode-foo":{"idx":1,"type":"bibcode","put-code":"466190"}
              });

              expect(oApi.isWorkCreatedByUs(res['orcid-work'][0])).to.be.true;
              expect(oApi.isWorkCreatedByUs(res['orcid-work'][1])).to.be.false;
              expect(oApi.isWorkCreatedByUs({})).to.be.false;

              done();
            });
        });
        it('checks for orcid-api limits', function() {
          var oApi = getOrcidApi();
          var test = new Array(5005);
          for(var i = 0; i <= 5005; i++){
            test[i] = 'a';
          };

          var res = oApi.formatOrcidWork({title: ['title'], id:1, bibcode: 'bibcode',
            abstract: test.join('')});

          expect(res['short-description'].length).to.eql(5000);
        });

        it('properly formats ads papers into orcid-message', function() {
          var oApi = getOrcidApi();
          var res = oApi.formatOrcidWork({title: ['title'], author: ['one', 'two', 'three'], id:1, bibcode: 'bibcode'});
          expect(res).to.eql({
            "work-type": "JOURNAL_ARTICLE",
            "url": "https://ui.adsabs.harvard.edu/#abs/bibcode",
            "work-external-identifiers": {
              "work-external-identifier": [
                {
                  "work-external-identifier-type": "BIBCODE",
                  "work-external-identifier-id": {
                    "value": "bibcode"
                  }
                },
                {
                  "work-external-identifier-type": "OTHER_ID",
                  "work-external-identifier-id": {
                    "value": 1
                  }
                }
              ]
            },
            "work-title": {
              "title": "title"
            },
            "work-contributors": {
              "contributor": [
                {
                  "credit-name": "one",
                  "contributor-attributes": {
                    "contributor-role": "AUTHOR"
                  }
                },
                {
                  "credit-name": "two",
                  "contributor-attributes": {
                    "contributor-role": "AUTHOR"
                  }
                },
                {
                  "credit-name": "three",
                  "contributor-attributes": {
                    "contributor-role": "AUTHOR"
                  }
                }
              ]
            }
          });

          res = oApi.formatOrcidWorks([{title: ['title'], author: ['one', 'two', 'three'], id: 1, bibcode: 'bibcode'}]);
          expect(res).to.eql({
            "message-version": "1.2",
            "orcid-profile": {
              "orcid-activities": {
                "orcid-works": {
                  "orcid-work": [
                    {
                      "work-type": "JOURNAL_ARTICLE",
                      "url": "https://ui.adsabs.harvard.edu/#abs/bibcode",
                      "work-external-identifiers": {
                        "work-external-identifier": [
                          {
                            "work-external-identifier-type": "BIBCODE",
                            "work-external-identifier-id": {
                              "value": "bibcode"
                            }
                          },
                          {
                            "work-external-identifier-type": "OTHER_ID",
                            "work-external-identifier-id": {
                              "value": 1
                            }
                          }
                        ]
                      },
                      "work-title": {
                        "title": "title"
                      },
                      "work-contributors": {
                        "contributor": [
                          {
                            "credit-name": "one",
                            "contributor-attributes": {
                              "contributor-role": "AUTHOR"
                            }
                          },
                          {
                            "credit-name": "two",
                            "contributor-attributes": {
                              "contributor-role": "AUTHOR"
                            }
                          },
                          {
                            "credit-name": "three",
                            "contributor-attributes": {
                              "contributor-role": "AUTHOR"
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            }
          });

          res = oApi.formatOrcidWorks([{title: ['title'], author: ['one', 'two', 'three'], id: 1, bibcode: 'bibcode', doi: ['doifoo']}]);
          expect(res).to.eql({
            "message-version": "1.2",
            "orcid-profile": {
              "orcid-activities": {
                "orcid-works": {
                  "orcid-work": [
                    {
                      "work-type": "JOURNAL_ARTICLE",
                      "url": "https://ui.adsabs.harvard.edu/#abs/bibcode",
                      "work-external-identifiers": {
                        "work-external-identifier": [
                          {
                            "work-external-identifier-type": "BIBCODE",
                            "work-external-identifier-id": {
                              "value": "bibcode"
                            }
                          },
                          {
                            "work-external-identifier-type": "OTHER_ID",
                            "work-external-identifier-id": {
                              "value": 1
                            }
                          },
                          {
                            "work-external-identifier-type": "DOI",
                            "work-external-identifier-id": {
                              "value": "doifoo"
                            }
                          }
                        ]
                      },
                      "work-title": {
                        "title": "title"
                      },
                      "work-contributors": {
                        "contributor": [
                          {
                            "credit-name": "one",
                            "contributor-attributes": {
                              "contributor-role": "AUTHOR"
                            }
                          },
                          {
                            "credit-name": "two",
                            "contributor-attributes": {
                              "contributor-role": "AUTHOR"
                            }
                          },
                          {
                            "credit-name": "three",
                            "contributor-attributes": {
                              "contributor-role": "AUTHOR"
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            }
          });

          expect(function() {
            oApi.formatOrcidWorks({title: ['title'], author: ['one', 'two', 'three'], bibcode: 'bibcode'});
          }).to.throw.Exception;
        });


        it('add records in orcid', function(done){
          var oApi = getOrcidApi();
          oApi.addWorks([{title: 'Test 1', type: 'test'}, {title: 'Test 2', type: 'test'}])
            .done(function(res) {
              expect(res.type).to.eql('POST');
              expect(res.dataType).to.eql('json');
              expect(res.converters['text json']('')).to.eql({});
              expect(res.data).to.eql('{"message-version":"1.2","orcid-profile":{"orcid-activities":{"orcid-works":{"orcid-work":[{"work-type":"JOURNAL_ARTICLE","url":"https://ui.adsabs.harvard.edu/#abs/undefined","work-title":{"title":"Test 1"}},{"work-type":"JOURNAL_ARTICLE","url":"https://ui.adsabs.harvard.edu/#abs/undefined","work-title":{"title":"Test 2"}}]}}}}');
              done();
            });

        });

        it('set records in orcid', function(done){
          // update just replaces everything with the new set
          var oApi = getOrcidApi();
          oApi.setWorks([{title: 'Test 1', type: 'test'}, {title: 'Test 2', type: 'test'}])
            .done(function(res) {
              expect(res.type).to.eql('PUT');
              expect(res.dataType).to.eql('json');
              expect(res.converters['text json']('')).to.eql({});
              expect(res.data).to.eql('{"message-version":"1.2","orcid-profile":{"orcid-activities":{"orcid-works":{"orcid-work":[{"work-type":"JOURNAL_ARTICLE","url":"https://ui.adsabs.harvard.edu/#abs/undefined","work-title":{"title":"Test 1"}},{"work-type":"JOURNAL_ARTICLE","url":"https://ui.adsabs.harvard.edu/#abs/undefined","work-title":{"title":"Test 2"}}]}}}}');
              done();
            });
        });

        it('delete orcid works', function (done) {
          var oApi = getOrcidApi();
          sinon.spy(oApi, 'getWorks');
          sinon.spy(oApi, 'setWorks');
          sinon.spy(oApi, 'deleteWorks');
          sinon.spy(oApi, 'sendData');

          oApi.deleteWorks(['test-bibcode'])
            .done(function(res) {
              expect(oApi.getWorks.called).to.eql(true);
              expect(oApi.setWorks.called).to.eql(false);
              expect(oApi.deleteWorks.called).to.eql(true);
              expect(oApi.sendData.callCount).to.eql(2);

              expect(res.deleted).to.eql(1);
              expect(res.adsTotal).to.eql(0);
              expect(res.response.type).to.eql('PUT');
              expect(res.totalRecs).to.eql(2);
              done();
            });
        });


        it('delete orcid works (try to delete non-ads rec)', function (done) {

          var oApi = getOrcidApi();
          sinon.spy(oApi, 'getWorks');
          sinon.spy(oApi, 'setWorks');
          sinon.spy(oApi, 'sendData');

          oApi.deleteWorks(['bibcode-foo'])
            .done(function(res) {
              expect(oApi.getWorks.called).to.eql(true);
              expect(oApi.setWorks.called).to.eql(false);
              expect(oApi.sendData.callCount).to.eql(1);

              expect(res.deleted).to.eql(0);
              expect(res.totalRecs).to.eql(2);
              expect(res.adsTotal).to.eql(1);
              done();
            });
        });


        it('should be GenericModule', function (done) {
          expect(new OrcidApi()).to.be.an.instanceof(GenericModule);
          expect(new OrcidApi()).to.be.an.instanceof(OrcidApi);
          done();
        });


        it("exports hardened interface", function(done) {
          var oApi = getOrcidApi();
          var hardened = oApi.getHardenedInstance();
          expect(hardened.getRecordInfo).to.be.defined;
          expect(hardened.hasAccess).to.be.defined;
          expect(hardened.updateOrcid).to.be.defined;
          expect(hardened.config).to.be.undefined;
          done();
        });

        it("has methods to query status of a record", function(done) {
          var oApi = getOrcidApi();
          sinon.spy(oApi, 'updateDatabase');
          sinon.spy(oApi, '_checkOrcidIdsInAds');

          // for testing purpose, force split into many queries
          oApi.maxQuerySize = 2;


          oApi.getRecordInfo({bibcode: 'test-bibcode'})
            .done(function(recInfo) {

              expect(oApi._checkOrcidIdsInAds.called).to.eql(true);
              expect(oApi._checkOrcidIdsInAds.calledTwice).to.eql(true);
              expect(oApi._checkOrcidIdsInAds.args[0][0].get('q')).eql(["alternate_bibcode:(\"bibcode-foo\" OR \"test-bibcode\")"]);
              expect(oApi._checkOrcidIdsInAds.args[1][0].get('q')).eql(["bibcode:(\"bibcode-foo\" OR \"test-bibcode\")"]);


              expect(recInfo.isCreatedByUs).to.eql(true);
              expect(recInfo.isCreatedByOthers).to.eql(false);

              // this one should return immediately
              oApi.getRecordInfo({bibcode: 'bibcode-foo'})
                .done(function(recInfo) {
                  expect(recInfo.isCreatedByUs).to.eql(false);
                  expect(recInfo.isCreatedByOthers).to.eql(true);
                  expect(recInfo.isKnownToAds).to.eql(true);
                });

              oApi.getRecordInfo({doi: '10.1126/science.276.5309.88'}) // doi of bibcode-foo
                .done(function(recInfo) {
                  expect(recInfo.isCreatedByUs).to.eql(false);
                  expect(recInfo.isCreatedByOthers).to.eql(true);
                  expect(recInfo.isKnownToAds).to.eql(true);
                });

              oApi.getRecordInfo({doi: '10.1103/physrevlett.84.3823'}) // test-bibcode
                .done(function(recInfo) {
                  expect(recInfo.isCreatedByUs).to.eql(true);
                  expect(recInfo.isCreatedByOthers).to.eql(false);
                  expect(recInfo.isKnownToAds).to.eql(true);
                });

              oApi.getRecordInfo({bibcode: '1997Sci...276...88V'}) // alternate bibcode of bibcode-foo
                .done(function(recInfo) {
                  expect(recInfo.isCreatedByUs).to.eql(false);
                  expect(recInfo.isCreatedByOthers).to.eql(true);
                  expect(recInfo.isKnownToAds).to.eql(true);
                });

              // found by one of the queries, but could not be mapped to bibcode
              // this should not normally be happening, but i've added the logic
              // to accomodate it - just in case...
              oApi.getRecordInfo({bibcode: '2015CeMDA.tmp....1D'})
                .done(function(recInfo) {
                  expect(recInfo.isCreatedByUs).to.eql(false);
                  expect(recInfo.isCreatedByOthers).to.eql(true);
                  expect(recInfo.isKnownToAds).to.eql(false);
                });

              // non-ADS record
              oApi.getRecordInfo({bibcode: 'sfasdfsdfsdfsdfsdf'})
                .done(function(recInfo) {
                  expect(recInfo.isCreatedByUs).to.eql(false);
                  expect(recInfo.isCreatedByOthers).to.eql(false);
                  expect(recInfo.isKnownToAds).to.eql(false);
                });

              done();
            });

        });

        it("updateOrcid(add)", function(done) {
          var oApi = getOrcidApi();
          sinon.spy(oApi, 'addWorks');
          sinon.spy(oApi, 'updateWorks');
          sinon.spy(oApi, 'deleteWorks');
          sinon.spy(oApi, 'updateDatabase');

          oApi.updateOrcid('add', {title: 'foo', bibcode: 'bar'})
            .done(function(recInfo) {
              expect(recInfo.isCreatedByUs).to.eql(true);
              expect(oApi.addWorks.called).to.eql(true);
              expect(oApi.updateWorks.called).to.eql(false);
              expect(oApi.deleteWorks.called).to.eql(false);
              expect(oApi.updateDatabase.called).to.eql(true);
              done();
            });
        });

        it("updateOrcid(update)", function(done) {
          var oApi = getOrcidApi();
          sinon.spy(oApi, 'addWorks');
          sinon.spy(oApi, 'updateWorks');
          sinon.spy(oApi, 'deleteWorks');
          sinon.spy(oApi, 'updateDatabase');

          oApi.updateDatabase()
            .done(function() {
              oApi.updateDatabase.reset();

              oApi.updateOrcid('update', {title: 'foo', bibcode: 'test-bibcode'})
                .done(function(recInfo) {
                  expect(recInfo.isCreatedByUs).to.eql(true);
                  expect(oApi.addWorks.called).to.eql(false);
                  expect(oApi.updateWorks.called).to.eql(true);
                  expect(oApi.deleteWorks.called).to.eql(true);
                  expect(oApi.updateDatabase.called).to.eql(true);
                  done();
                });
            })

        });

        it("has translateOrcidWorks function", function(done) {
          var oApi = getOrcidApi();

          oApi.getUserProfile()
            .done(function(res) {
              var ads = oApi.transformOrcidProfile(res);
              expect(ads).to.eql({
                "responseHeader": {
                  "params": {
                    "orcid": "0000-0001-8178-9506",
                    "firstName": null,
                    "lastName": null
                  }
                },
                "response": {
                  "numFound": 2,
                  "start": 0,
                  "docs": [
                    {
                      "bibcode": "bibcode-foo",
                      "putcode": "466190",
                      "title": "ADS 2.0",
                      "visibility": "PUBLIC",
                      "formattedDate": "2015/01",
                      "pub": "foo",
                      "abstract": null,
                      "author": [],
                      "identifier": "bibcode-foo",
                      "source_name": "Roman Chyla",
                      "source_date": 1422645668284
                    },
                    {
                      "bibcode": "test-bibcode",
                      "putcode": "469257",
                      "title": "Tecnologias XXX",
                      "visibility": "PUBLIC",
                      "formattedDate": "2014/11",
                      "pub": "El Profesional de la Informacion",
                      "abstract": null,
                      "author": [],
                      "identifier": "test-bibcode",
                      "source_name": "nasa ads",
                      "source_date": 1424194783005
                    }
                  ]
                }
              });
              done();
            });
        });

      });



    });
  });