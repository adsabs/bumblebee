
define([
  'underscore',
  'jsonpath'
], function (_, jp) {
  var ADSPATHS = {
    status: '$.status',
    title: '$.title',
    publicationDateMonth: '$.pubmonth',
    publicationDateYear: '$.pubyear',
    lastModifiedDate: '$.updated',
    sourceName: '$.source',
    putCode: '$.putcode',
    identifier: '$.identifier'
  };
  var ORCIDPATHS = {
    createdDate: '$["created-date"].value',
    lastModifiedDate: '$["last-modified-date"].value',
    sourceOrcidIdUri: '$.source["source-orcid"].uri',
    sourceOrcidIdPath: '$.source["source-orcid"].path',
    sourceOrcidIdHost: '$.source["source-orcid"].host',
    sourceClientIdUri: '$.source["source-client-id"].uri',
    sourceClientIdPath: '$.source["source-client-id"].path',
    sourceClientIdHost: '$.source["source-client-id"].host',
    sourceName: '$.source["source-name"].value',
    putCode: '$["put-code"]',
    path: '$.path',
    title: '$["title"].title.value',
    subtitle: '$["title"].subtitle.value',
    translatedTitle: '$["title"]["translated-title"].value',
    translatedTitleLang: '$["title"]["translated-title"]["language-code"]',
    journalTitle: '$["journal-title"].value',
    shortDescription: '$["short-description"]',
    citationType: '$.citation["citation-type"]',
    citationValue: '$.citation["citation-value"]',
    type: '$.type',
    publicationDateYear: '$["publication-date"].year.value',
    publicationDateMonth: '$["publication-date"].month.value',
    publicationDateDay: '$["publication-date"].day.value',
    publicationDateMedia: '$["publication-date"]["media-type"]',
    url: '$.url.value',
    contributorOrcidUri: '$["contributors"].contributor..["contributor-orcid"].uri',
    contributorOrcidPath: '$["contributors"].contributor..["contributor-orcid"].path',
    contributorOrcidHost: '$["contributors"].contributor..["contributor-orcid"].host',
    contributorName: '$["contributors"].contributor..["credit-name"].value',
    contributorEmail: '$["contributors"].contributor..["contributor-email"].value',
    contributorAttributes: '$["contributors"].contributor..["contributor-attributes"]',
    contributorSequence: '$["contributors"].contributor..["contributor-attributes"]["contributor-sequence"]',
    contributorRole: '$["contributors"].contributor..["contributor-attributes"]["contributor-role"]',
    externalIdValue: '$["external-ids"]["external-id"]..["external-id-value"]',
    externalIdType: '$["external-ids"]["external-id"]..["external-id-type"]',
    externalIdUrl: '$["external-ids"]["external-id"]..["external-id-url"]',
    externalIdRelationship: '$["external-ids"]["external-id"]..["external-id-relationship"]',
    country: '$.country.value',
    visibility: '$.visibility.value',
    identifier: '$.identifier'
  };

  /**
   * Convenience class that allows easy conversion between ADS and ORCiD works.
   * @module Work
   * @param work
   * @param useOrcidPaths
   * @constructor
   */
  var Work = function Work(work, useOrcidPaths) {
    work = work || {};
    this.useOrcidPaths = useOrcidPaths;

    // find the inner summary as the root
    this._root = work;

    this.sources = [];

    /**
     * get the sources array
     * if the array is empty, it returns an array containing the single source name
     *
     * @returns {Array} - the sources
     */
    this.getSources = function () {
      if (_.isEmpty(this.sources)) {
        return [this.getSourceName()];
      }

      return this.sources;
    };

    /**
     * Set the sources array
     *
     * @param {Array} sources
     * @returns {Array} - the sources
     */
    this.setSources = function (sources) {
      if (_.isArray(sources)) {
        this.sources = sources;
      }
      return this.sources;
    };

    /**
     * Get the value at path
     *
     * @param {string} path - path on _root element to find
     * @returns {*} - value found at path
     */
    this.get = function (path) {
      var val = jp.query(this._root, path);
      if (_.isEmpty(val)) {
        return null;
      } if (_.isArray(val) && val.length <= 1) {
        return val[0];
      }
      return val;
    };

    /**
     * Returns the generated ORCiD work from the current _root object.
     * The object will be based on the paths in ADSPATHS
     *
     * @returns {*} - ORCiD formatted object
     */
    this.getAsOrcid = function () {
      return _.reduce(ORCIDPATHS, _.bind(function (res, p) {
        var val = this.get(p);
        if (val) {
          if (_.isArray(val)) {
            _.forEach(val, function (v, i) {
              jp.value(res, p.replace('..', '[' + i + ']'), v);
            });
          } else {
            jp.value(res, p, val);
          }
        }
        return res;
      }, this), {});
    };

    /**
     * Creates an ADS formatted object
     *
     * @returns {*} - ADS formatted object
     */
    this.toADSFormat = function () {

      var ids;
      if (this.useOrcidPaths) {
        ids = this.getExternalIds();
        if (ids.doi) {
          ids.doi = [ids.doi];
        }
        ids.identifier = _.values(ids)[0];
      }

      return _.extend({}, {
        'title': [this.getTitle()],
        'formattedDate': this.getFormattedPubDate(),
        'source_name': this.getSources().join('; '),
        'identifier': this.getIdentifier(),
        '_work': this
      }, ids);
    };
      
    /**
     * Creates an object containing all external ids
     * @example
     * { bibcode: ["2018CNSNS..56..270Q"], doi: [...] }
     *
     * @returns {Object} - object containing external ids
     */
    this.getExternalIds = function () {
      var types = this.getExternalIdType();
      var values = this.getExternalIdValue();
      types = _.isArray(types) ? types : [types];
      values = _.isArray(values) ? values : [values];
      if (types.length !== values.length) {
        return {};
      }

      return _.reduce(types, function (res, t, i) {
        res[t] = values[i];
        return res;
      }, {});
    };

    /**
     * Format publication date
     *
     * @returns {string} - formatted pub date
     */
    this.getFormattedPubDate = function () {
      var year = this.getPublicationDateYear() || '????';
      var month = this.getPublicationDateMonth() || '??';
      return year + '/' + month;
    };

    // get correct set of paths based on options
    var paths = this.useOrcidPaths ? ORCIDPATHS : ADSPATHS;

    // create getters for each of the PATHS
    _.reduce(paths, function (obj, p, k) {
      if (_.isString(k) && k.slice) {
        var prop = k[0].toUpperCase() + k.slice(1);
        obj['get' + prop] = _.partial(obj.get, p);
      }
      return obj;
    }, this);
  };

  /**
   * Creates an ORCiD Work from an ADS record.
   *
   * @static
   * @param {Object} adsWork - the ads record
   * @param {Number} [putCode] putCode - putcode to apply to work
   * @returns {Object} - the ORCiD work
   */
  Work.adsToOrcid = function (adsWork, putCode) {
    var ads = {
      'pubdate': '$.pubdate',
      'abstract': '$.abstract',
      'bibcode': '$.bibcode',
      'pub': '$.pub',
      'doi': '$.doi[0]',
      'author': '$.author[*]',
      'title': '$.title[0]',
      'type': '$.doctype',
      'all_ids': '$.all_ids'
    };

    var put = function (obj, p, val) {
      if (val) {
        if (_.isArray(val)) {
          _.forEach(val, function (v, i) {
            jp.value(obj, p.replace('..', '[' + i + ']'), v);
          });
        } else {
          jp.value(obj, p, val);
        }
      }
      return obj;
    };
    var get = function (path) {
      var val = jp.query(adsWork, path);
      if (_.isEmpty(val)) {
        return null;
      } if (_.isArray(val) && val.length <= 1) {
        return val[0] || '';
      }
      return val || '';
    };
    var work = {};
    var worktype = function (adsType) {
      var oType = {
        'article': 'JOURNAL_ARTICLE',
        'inproceedings': 'CONFERENCE_PAPER',
        'abstract': 'CONFERENCE_ABSTRACT',
        'eprint': 'WORKING_PAPER',
        'phdthesis': 'DISSERTATION',
        'techreport': 'RESEARCH_TECHNIQUE',
        'inbook': 'BOOK_CHAPTER',
        'circular': 'RESEARCH_TOOL',
        'misc': 'OTHER',
        'book': 'BOOK',
        'proceedings': 'BOOK',
        'bookreview': 'BOOK_REVIEW',
        'erratum': 'JOURNAL_ARTICLE',
        'proposal': 'OTHER',
        'newsletter': 'NEWSLETTER_ARTICLE',
        'catalog': 'DATA_SET',
        'intechreport': 'RESEARCH_TECHNIQUE',
        'mastersthesis': 'DISSERTATION',
        'obituary': 'OTHER',
        'pressrelease': 'OTHER',
        'software': 'RESEARCH_TECHNIQUE',
        'talk': 'LECTURE_SPEECH'
      };
      return oType[adsType] || 'JOURNAL_ARTICLE';
    };
    try {
      var exIds = {
        types: [],
        values: [],
        relationships: []
      };

      // handle doi or bibcode not existing
      var bib = get(ads.bibcode);
      var doi = get(ads.doi);
      if (bib) {
        exIds.types.push('bibcode');
        exIds.values.push(bib);
        exIds.relationships.push('SELF');
      }
      if (doi) {
        exIds.types.push('doi');
        exIds.values.push(doi);
        exIds.relationships.push('SELF');
      }
      var all_ids = get(ads.all_ids);
      if (Array.isArray(all_ids)) {
        var arxiv = all_ids.find(function (element) {
          return element.toLowerCase().startsWith('arxiv')
          });
      } else {
        var arxiv = false;
      }
      if (arxiv) {
        arxiv = arxiv.substr(6);
        exIds.types.push('arxiv');
        exIds.values.push(arxiv);
        exIds.relationships.push('SELF');
      }

      put(work, ORCIDPATHS.publicationDateYear, get(ads.pubdate).split('-')[0]);
      if (get(ads.pubdate).split('-')[1] === '00') {
        put(work, ORCIDPATHS.publicationDateMonth, null);
      } else {
        put(work, ORCIDPATHS.publicationDateMonth, get(ads.pubdate).split('-')[1]);
      }
      put(work, ORCIDPATHS.shortDescription, get(ads.abstract).slice(0, 4997) + '...');
      put(work, ORCIDPATHS.externalIdType, exIds.types);
      put(work, ORCIDPATHS.externalIdValue, exIds.values);
      put(work, ORCIDPATHS.externalIdRelationship, exIds.relationships);
      put(work, ORCIDPATHS.journalTitle, get(ads.pub));
      put(work, ORCIDPATHS.type, worktype(get(ads.type)));
      var author = get(ads.author);
      author = (_.isArray(author)) ? author : [author];
      put(work, ORCIDPATHS.contributorName, author);
      var roles = _.map(author, function () {
        return 'AUTHOR';
      });
      put(work, ORCIDPATHS.contributorRole, roles);
      put(work, ORCIDPATHS.title, get(ads.title));
      if (putCode) {
        put(work, ORCIDPATHS.putCode, putCode);
      }
    } catch (e) {
      return null;
    }

    return work;
  };

  return Work;
});
