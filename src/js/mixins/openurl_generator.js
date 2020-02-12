define(['underscore'], function(_) {
  /**
   * @typedef Metadata
   * @property {string[]} page
   * @property {string[]} doi
   * @property {string} doctype
   * @property {string} bibcode
   * @property {string} author
   * @property {string} issue
   * @property {string} volume
   * @property {string} pub
   * @property {string} year
   * @property {string[]} title
   * @property {string[]} issn
   * @property {string[]} isbn
   */

  /**
   * check if value is string
   * @param {any} val value to test
   * @returns {boolean}
   */
  const isString = (val) => _.isString(val);

  /**
   * Check if value is an array
   * @param {any} val value to test
   * @returns {boolean}
   */
  const isArray = (val) => _.isArray(val);

  /**
   * ADS specific fields
   */
  const STATIC_FIELDS = {
    url_ver: 'Z39.88-2004',
    rft_val_fmt: 'info:ofi/fmt:kev:mtx:',
    rfr_id: 'info:sid/ADS',
    sid: 'ADS',
  };

  /**
   * Generates an OpenUrl using metadata and a linkServer
   * @param {object} options
   * @param {Metadata} options.metadata field data from database
   * @param {string} options.linkServer base url to use for generating link
   * @returns {string} the openUrl url
   */
  const getOpenUrl = (options) => {
    const { metadata, linkServer = '' } = options || {};

    const {
      page,
      doi,
      doctype,
      bibcode,
      author,
      issue,
      volume,
      pub,
      year,
      title,
      issn,
      isbn,
    } = metadata || {};

    // parse out degree based on bibcode
    const degree =
      isString(bibcode) &&
      (bibcode.includes('PhDT')
        ? 'PhD'
        : bibcode.includes('MsT')
        ? 'Masters'
        : false);

    // genre is "disseration" for phd thesis, otherwise use doctype/article
    const genre =
      isString(doctype) && isString(bibcode) && bibcode.includes('PhDT')
        ? 'dissertation'
        : isString(doctype)
        ? doctype
        : 'article';

    // parse various fields to create a context object
    const parsed = {
      ...STATIC_FIELDS,
      'rft.spage': isArray(page) ? page[0].split('-')[0] : false,
      id: isArray(doi) ? 'doi:' + doi[0] : false,
      genre: genre,
      rft_id: [
        isArray(doi) ? 'info:doi/' + doi[0] : false,
        isString(bibcode) ? 'info:bibcode/' + bibcode : false,
      ],
      'rft.degree': degree,
      'rft.aulast': isString(author) ? author.split(', ')[0] : false,
      'rft.aufirst': isString(author) ? author.split(', ')[1] : false,
      'rft.issue': isString(issue) ? issue : false,
      'rft.volume': isString(volume) ? volume : false,
      'rft.jtitle': isString(pub) ? pub : false,
      'rft.date': isString(year) ? year : false,
      'rft.atitle': isArray(title) ? title[0] : false,
      'rft.issn': isArray(issn) ? issn[0] : false,
      'rft.isbn': isArray(isbn) ? isbn[0] : false,
      'rft.genre': genre,
      rft_val_fmt:
        STATIC_FIELDS.rft_val_fmt + (isString(doctype) ? doctype : 'article'),
    };

    // add extra fields to context object
    const context = {
      ...parsed,
      spage: parsed['rft.spage'],
      volume: parsed['rft.volume'],
      title: parsed['rft.jtitle'],
      atitle: parsed['rft.atitle'],
      aulast: parsed['rft.aulast'],
      aufirst: parsed['rft.aufirst'],
      date: parsed['rft.date'],
      isbn: parsed['rft.isbn'],
      issn: parsed['rft.issn'],
    };

    // if the linkServer has query string, just append to the end
    const openUrl = linkServer.includes('?')
      ? linkServer + '&'
      : linkServer + '?';

    // generate array of query params from the context object
    const fields = Object.keys(context)
      .filter((k) => context[k])
      .map((key) => {
        if (context[key]) {
          if (isArray(context[key])) {
            return context[key]
              .filter((v) => v)
              .map((val) => `${key}=${val}`)
              .join('&');
          }
          return `${key}=${context[key]}`;
        }
      });

    return encodeURI(openUrl + fields.join('&'));
  };

  return {
    getOpenUrl,
  };
});
