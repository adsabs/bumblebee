define([
    'js/components/generic_module',
    'js/mixins/dependon',
    'jquery',
    'js/services/orcid_api',
    'underscore',
    'xml2json',
    'js/components/application'
  ],
  function (GenericModule, Mixins, $, OrcidApi, _, xml2json, Application) {

    var app = new Application();
    var config = {
      core: {
        services: {
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

    describe("JSON to XML", function () {
      var promise = app.loadModules(config);

      it('prepare', function (done) {
        promise.done(function() {
          done();
        });
      });

      it('xml2json', function (done) {
        var json2Xml = beeHive.getService("Json2Xml");
        var xml = json2Xml.xml({
          "orcid-message": {
            "$": {
              "xmlns": "http://www.orcid.org/ns/orcid"
            },
            "message-version": "1.1",
            "orcid-profile": {
              "$": {
                "type": "user"
              },
              "orcid-identifier": {
                "$": {},
                "uri": "http://sandbox.orcid.org/0000-0001-7016-4666",
                "path": "0000-0001-7016-4666",
                "host": "sandbox.orcid.org"
              },
              "orcid-preferences": {
                "$": {},
                "locale": "en"
              },
              "orcid-history": {
                "$": {},
                "creation-method": "website",
                "submission-date": "2014-12-05T09:58:18.525Z",
                "last-modified-date": "2014-12-11T14:27:18.151Z",
                "claimed": "true"
              },
              "orcid-bio": {
                "$": {},
                "personal-details": {
                  "$": {},
                  "given-names": "Martin",
                  "family-name": "Obrátil"
                }
              },
              "orcid-activities": {
                "$": {},
                "orcid-works": {
                  "$": {},
                  "orcid-work": {
                    "$": {
                      "put-code": "454227",
                      "visibility": "public"
                    },
                    "work-title": {
                      "$": {},
                      "title": "Testing publiction"
                    },
                    "work-type": "test",
                    "work-source": {
                      "$": {},
                      "uri": "http://sandbox.orcid.org/0000-0001-7016-4666",
                      "path": "0000-0001-7016-4666",
                      "host": "sandbox.orcid.org"
                    }
                  }
                }
              }
            }
          }
        }, { attributes_key: '$' });


        done();
      });
    });
  }
);