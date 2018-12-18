'use strict';
define([
  'underscore',
  'js/mixins/link_generator_mixin'
], function (_, LinkGeneratorMixin) {

  const init = function () {
    this.sb = sinon.sandbox.create();

    // create a copy, so we don't play with the actual object
    this.m = _.assign({}, LinkGeneratorMixin);
    const m = this.m;

    // simple partial-creating function for help testing methods that throw errors
    this.fn = function (prop) {
      const args = _.rest(arguments);
      return function () {
        return m[prop].apply(m, args);
      };
    };
  };

  const teardown = function () {
    this.m = null;
    this.fn = null;
    this.sb.restore();
  };

  describe("Link Generator Mixin", function() {

    describe('_createGatewayUrl', function () {
      beforeEach(init);
      afterEach(teardown);
      it('returns empty string if either input is not a string', function (done) {
        const m = this.m;
        _.forEach([
          [], ['', 1], [1, ''], [1, 1]
        ], function (input) {
          expect(m._createGatewayUrl(input)).to.eql('');
        });
        done();
      });
      it('returns a url in the correct format', function (done) {
        const expected = '/link_gateway/foo/test';
        expect(this.m._createGatewayUrl('foo', 'test')).to.contain(expected);
        done();
      });
    });

    describe('_createUrlByType', function () {
      beforeEach(init);
      afterEach(teardown);
      it('returns empty string if any of the params are the wrong type', function (done) {
        const m = this.m;
        _.forEach([
          ['', '', 0],
          ['', 0, []],
          [0, '', []]
        ], function (input) {
          expect(m.createUrlByType.apply(m, input)).to.eql('');
        });
        done();
      });
      it('returns correct url based on type', function (done) {
        const m = this.m;
        _.forEach([
          ['/link_gateway/foo/bar:baz', 'foo', 'bar', 'baz'],
          ['/link_gateway/foo/bar:baz', 'foo', 'bar', ['baz']],
          ['/link_gateway/foo/doi:baz/yo/hey/there', 'foo', 'doi', ['baz/yo/hey/there']]
        ], function (input) {
          const expected = input[0];
          const args = _.rest(input);
          expect(m.createUrlByType.apply(m, args)).to.contain(expected);
        });
        done();
      });
    });

    describe('parseResourcesData', function () {
      beforeEach(init);
      afterEach(teardown);
      it('Checks that data is an object', function (done) {
        expect(this.fn('parseResourcesData', 100)).to.throw('data must be a plain object');
        done();
      });
      it('Checks that data has property and bibcode', function (done) {
        const msg = 'data must have `property` and `bibcode`';
        expect(this.fn('parseResourcesData', {})).to.throw(msg);
        done();
      });
      it('checks that property and bibcode are the correct type', function (done) {
        const msg = 'data must have `property` and `bibcode`';
        expect(this.fn('parseResourcesData', { property: [] })).to.throw(msg);
        expect(this.fn('parseResourcesData', { bibcode: '' })).to.throw(msg);
        expect(this.fn('parseResourcesData', { property: 0, bibcode: 0 })).to.throw(msg);
        done();
      });
      it('if property has `esources`, find `esources` on the main object as well', function (done) {
        const msg = 'if `property` property contains `ESOURCE`, then data must have `esources` field';
        expect(this.fn('parseResourcesData', { property: ['ESOURCE'], bibcode: 'foo' })).to.throw(msg);
        done();
      });
      it('if property has `data`, find `data` on the main object as well', function (done) {
        const msg = 'if `property` property contains `DATA`, then data must have `data` field';
        expect(this.fn('parseResourcesData', { property: ['DATA'], bibcode: 'foo' })).to.throw(msg);
        done();
      });
      it('calls _processLinkData with passed in data', function (done) {
        const data = { property: [], bibcode: 'foo' };
        this.m._processLinkData = this.sb.spy();
        this.m.parseResourcesData(data);
        expect(this.m._processLinkData.calledWith(data)).to.eql(true);
        done();
      });
    });

    describe('_processLinkData', function () {
      beforeEach(init);
      afterEach(teardown);
      it('always returns an object in the correct format', function (done) {
        const data = { property: [], bibcode: 'foo' };
        const expected = { fullTextSources: [], dataProducts: [] };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('if no esources it returns empty array', function (done) {
        const data = { property: ['ESOURCE'], bibcode: 'foo', esources: [] };
        const expected = { fullTextSources: [], dataProducts: [] };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('if no data it returns empty array', function (done) {
        const data = { property: ['DATA'], bibcode: 'foo', data: [] };
        const expected = { fullTextSources: [], dataProducts: [] };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('esources properly creates fullText closed access source', function (done) {
        const data = { property: ['ESOURCE'], bibcode: 'foo', esources: ['PUB_HTML'] };
        const expected = {
          "fullTextSources": [
            {
              "url": "/link_gateway/foo/PUB_HTML",
              "open": false,
              "shortName": "Publisher",
              "name": "Publisher Article",
              "type": "HTML",
              "description": "Electronic on-line publisher article (HTML)"
            }
          ],
          "dataProducts": []
        };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('esources properly creates fullText non-open access html source', function (done) {
        const data = { property: ['ESOURCE', 'OPENACCESS'], bibcode: 'foo', esources: ['PUB_HTML'] };
        const expected = {
          "fullTextSources": [
            {
              "url": "/link_gateway/foo/PUB_HTML",
              "open": false,
              "shortName": "Publisher",
              "name": "Publisher Article",
              "type": "HTML",
              "description": "Electronic on-line publisher article (HTML)"
            }
          ],
          "dataProducts": []
        };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('esources properly creates fullText open access non-html source', function (done) {
        const data = { property: ['ESOURCE', 'PUB_OPENACCESS'], bibcode: 'foo', esources: ['PUB_PDF'] };
        const expected = {
          "fullTextSources": [
            {
              "url": "/link_gateway/foo/PUB_PDF",
              "open": true,
              "shortName": "Publisher",
              "name": "Publisher PDF",
              "type": "PDF",
              "description": "Publisher PDF"
            }
          ],
          "dataProducts": []
        };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('esources properly creates openUrl fullText open access source', function (done) {
        const data = { property: ['ESOURCE'], bibcode: 'foo', doi: 'baz', esources: ['PUB_PDF'], link_server: 'bar' };
        const expected = {
          "fullTextSources": [
            {
              "url": "bar?&url_ver=Z39.88-2004&rfr_id=info:sid/ADS&rft_val_fmt=info:ofi/fmt:kev:mtx:article&rft_id=info:doi/b&rft_id=info:bibcode/foo&id=doi:b&rft.genre=article&sid=ADS&genre=article",
              "openUrl": true,
              "type": "INSTITUTION",
              "shortName": "My Institution",
              "name": "My Institution",
              "description": "Find Article At My Institution"
            },
            {
              "url": "/link_gateway/foo/PUB_PDF",
              "open": false,
              "shortName": "Publisher",
              "name": "Publisher PDF",
              "type": "PDF",
              "description": "Publisher PDF"
            }
          ],
          "dataProducts": []
        };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('esources properly handles entries without underscores', function (done) {
        const data = { property: ['ESOURCE'], bibcode: 'foo', esources: ['BAR'] };
        const expected = {
          "fullTextSources": [
            {
              "description": undefined,
              "url": "/link_gateway/foo/BAR",
              "open": false,
              "shortName": "BAR",
              "name": "BAR",
              "type": "HTML"
            }
          ],
          "dataProducts": []
        };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });

      it('data properly creates a record given an object and count', function (done) {
        const data = { property: ['DATA'], bibcode: 'foo', data: ['NED:22'] };
        const expected = {
          "fullTextSources": [],
          "dataProducts": [
            {
              "url": "/link_gateway/foo/NED",
              "count": "22",
              "name": "NED",
              "description": "NASA/IPAC Extragalactic Database"
            }
          ]
        };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
      it('data properly handles records without a count', function (done) {
        const data = { property: ['DATA'], bibcode: 'foo', data: ['NED'] };
        const expected = {
          "fullTextSources": [],
          "dataProducts": [
            {
              "url": "/link_gateway/foo/NED",
              "count": "0",
              "name": "NED",
              "description": "NASA/IPAC Extragalactic Database"
            }
          ]
        };
        expect(this.m._processLinkData(data)).to.eql(expected);
        done();
      });
    });

    describe('_parseLinksDataForModel', function () {
      beforeEach(init);
      afterEach(teardown);
      it('does not add to list if data is not an object', function (done) {
        const data = null;
        const expected = { links: { list: [], data: [], text: [] } };
        expect(this.m._parseLinksDataForModel(data)).to.eql(expected);
        done();
      });
      it('does not add to list if no [citations] and no bibcode', function (done) {
        const data = { '[citations]': null, 'bibcode': null };
        const expected = _.assign(data, { links: { list: [], data: [], text: [] } });
        expect(this.m._parseLinksDataForModel(data)).to.eql(expected);
        done();
      });
      it('does not add if has [citations] and bibcode but no counts', function (done) {
        const data = { '[citations]': {}, 'bibcode': 'foo' };
        const expected = _.assign(data, { links: { list: [], data: [], text: [] } });
        expect(this.m._parseLinksDataForModel(data)).to.eql(expected);
        done();
      });
      it('adds to list if has [citations] and bibcode, and has counts', function (done) {
        const data = {
          '[citations]': {
            num_citations: 10,
            num_references: 20
          },
          'bibcode': 'foo'
        };
        const expected = _.assign(data, {
          links: { data: [], text: [],
            list: [
              {
                letter: 'C',
                name: 'Citations (10)',
                url: '/abs/foo/citations'
              },
              {
                letter: 'R',
                name: 'References (20)',
                url: '/abs/foo/references'
              }
            ],
          }
        });
        expect(this.m._parseLinksDataForModel(data)).to.eql(expected);
        done();
      });
      it('adds a TOC link if property and bibcode are present', function (done) {
        const data = {
          property: ['TOC'],
          bibcode: 'foo'
        };
        const expected = _.assign(data, {
          links: { data: [], text: [],
            list: [
              {
                letter: 'T',
                name: 'Table of Contents',
                url: '/abs/foo/tableofcontents'
              }
            ],
          }
        });
        expect(this.m._parseLinksDataForModel(data)).to.eql(expected);
        done();
      });
      it('adds data and text links if present', function (done) {
        const linksData = {
          fullTextSources: [{ foo: 'bar' }],
          dataProducts: [{ baz: 'boo' }]
        };
        const data = {};
        const expected = {
          links: {
            list: [],
            text: [{ foo: 'bar' }],
            data: [{ baz: 'boo' }]
          }
        };
        expect(this.m._parseLinksDataForModel(data, linksData)).to.eql(expected);
        done();
      });
    });
  });
});
