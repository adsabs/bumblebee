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

    function objectEquals(x, y) {

      if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
      // after this just checking type of one would be enough
      if (x.constructor !== y.constructor) { return false; }
      // if they are functions they should exactly refer to same one
      if (x instanceof Function) { return x === y; }
      if (x === y || x.valueOf() === y.valueOf()) { return true; }
      if (Array.isArray(x) && x.length !== y.length) { return false; }

      // if they are dates, they must had equal valueOf
      if (x instanceof Date) { return false; }

      // if they are strictly equal, they both need to be object at least
      if (!(x instanceof Object)) { return false; }
      if (!(y instanceof Object)) { return false; }

      // recursive object equality check
      var p = Object.keys(x);
      return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) ?
        p.every(function (i) { return objectEquals(x[i], y[i]); }) :
        false;
    }

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

      it('simple xml2json', function (done) {
        var json2Xml = beeHive.getService("Json2Xml");

        var originalJson = {
          root: {
            $: {
              a: "a"
            },
            b: "b"
          }
        };

        var xml = json2Xml.xml(originalJson, { attributes_key: '$' });

        var json = $.xml2json(xml);

        expect(objectEquals(originalJson, json)).to.be.true;

        done();
      });

      it('complex xml2json', function (done) {
        var json2Xml = beeHive.getService("Json2Xml");
        var originalJson = {
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
        };

        var xml = json2Xml.xml(originalJson , { attributes_key: '$' });
        var json = $.xml2json(xml);

        expect(objectEquals(originalJson, json)).to.be.true;

        done();
      });
    });
  }
);