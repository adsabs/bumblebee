define([
  'jquery',
  'js/mixins/openurl_generator'
], function ($, OpenURLGenerator) {

  const {
    getOpenUrl
  } = OpenURLGenerator;

  describe('OpenURL generator function (openurl_generator.spec.js',
    function () {
      const metadata = {
        page: ['foo'],
        doi: ['bar'],
        doctype: 'baz',
        bibcode: 'quxMsT',
        author: 'quux, corge',
        issue: 'grault',
        volume: 'garply',
        pub: 'waldo',
        year: 'fred',
        title: ['plugh'],
        issn: ['xyzzy'],
        isbn: ['thud']
      };

      const linkServer = 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL';

      /**
       * Parse a url with query params into an object
       * @param {string} url the url to parse
       * @returns {object}
       */
      const getParams = (url = '') => {
        const iter = new URLSearchParams(url.split('?')[1]);
        let params = {};
        for (let [key, val] of iter) {
          if (params[key]) {
            if (_.isArray(params[key])) {
              params[key].push(val);
            } else {
              let tmp = params[key];
              params[key] = [tmp, val];
            }
          } else {
            params[key] = val;
          }
        }
        return params;
      };

      /**
       * Run a set of asserts with a metadata object that has a property
       * set to undefined.
       * @param {string} paramToClear param to set undefined on the metadata
       * @param {string} expected the expected url to test
       */
      const withUndefinedParam = (paramToClear, expected) => {
        const openURL = getOpenUrl({
          metadata: {
            ...metadata,
            [paramToClear]: undefined
          },
          linkServer
        });
        expect(openURL).to.eql(expected, `with "${paramToClear}" undefined`);
        expect(getParams(openURL)).to.eql(getParams(expected), `with "${paramToClear}" undefined`);
      }

      it('generates an openURL correctly', () => {
        withUndefinedParam(null, 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('page', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('doi', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&genre=baz&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('doctype', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:article&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=article&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=article&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('bibcode', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('author', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('issue', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('volume', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('pub', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('year', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&isbn=thud&issn=xyzzy');
        withUndefinedParam('title', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy');
        withUndefinedParam('issn', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud');
        withUndefinedParam('isbn', 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&issn=xyzzy');
      });

      it('appends extra fields already present on linkserver', () => {
        const openUrl = getOpenUrl({
          metadata,
          linkServer: linkServer + '?foo=bar&baz=biz'
        });
        const expected = 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?foo=bar&baz=biz&url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=baz&rft_id=info:doi/bar&rft_id=info:bibcode/quxMsT&rft.degree=Masters&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=baz&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy';
        expect(openUrl).to.eql(expected);
        expect(getParams(openUrl)).to.eql(getParams(expected));
      });

      it('handles bad input gracefully', () => {
        const openUrl = getOpenUrl({
          metadata: undefined,
          linkServer: undefined
        });
        const expected = '?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:article&rfr_id=info:sid/ADS&sid=ADS&genre=article&&rft.genre=article';
        expect(openUrl).to.eql(expected);
        expect(getParams(openUrl)).to.eql(getParams(expected));
      });

      it('handles no input gracefully', () => {
        const openUrl = getOpenUrl();
        const expected = '?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:article&rfr_id=info:sid/ADS&sid=ADS&genre=article&&rft.genre=article';
        expect(openUrl).to.eql(expected);
        expect(getParams(openUrl)).to.eql(getParams(expected));
      });

      it('selects degree correctly when bibcode has "PhDT"', () => {
        const openUrl = getOpenUrl({
          metadata: {
            ...metadata,
            bibcode: 'fooPhDTbar'
          },
          linkServer
        });
        const expected = 'https://hollis.harvard.edu/openurl/01HVD/HVD_URL?url_ver=Z39.88-2004&rft_val_fmt=info:ofi/fmt:kev:mtx:baz&rfr_id=info:sid/ADS&sid=ADS&rft.spage=foo&id=doi:bar&genre=dissertation&rft_id=info:doi/bar&rft_id=info:bibcode/fooPhDTbar&rft.degree=PhD&rft.aulast=quux&rft.aufirst=corge&rft.issue=grault&rft.volume=garply&rft.jtitle=waldo&rft.date=fred&rft.atitle=plugh&rft.issn=xyzzy&rft.isbn=thud&rft.genre=dissertation&spage=foo&volume=garply&title=waldo&atitle=plugh&aulast=quux&aufirst=corge&date=fred&isbn=thud&issn=xyzzy';
        expect(openUrl).to.eql(expected);
        expect(getParams(openUrl)).to.eql(getParams(expected));
      });
    });
});
