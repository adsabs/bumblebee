define(["underscore", "js/mixins/openurl_generator"], function(_, OpenURLGenerator){
  const GATEWAY_BASE_URL = '/link_gateway/';

  const DEFAULT_ORDERING = [
    'ADS PDF', 'ADS Scanned Article', 'Find it at your Institution', 
    'Publisher Article', 'Publisher PDF', 'arXiv PDF'
  ];

  // set of link types and descriptions
  const LINK_TYPES = {
    'PUB_PDF': {
      shortName: 'Publisher PDF',
      description: 'Publisher PDF'
    },
    'EPRINT_PDF': {
      shortName: 'arXiv PDF',
      description: 'Arxiv eprint'
    },
    'AUTHOR_PDF': {
      shortName: 'Author PDF',
      description: 'Link to PDF page provided by author'
    },
    'ADS_PDF': {
      shortName: 'ADS PDF',
      description: 'ADS PDF'
    },
    'PUB_HTML': {
      shortName: 'Publisher Article',
      description: 'Electronic on-line publisher article (HTML)'
    },
    'EPRINT_HTML': {
      shortName: 'arXiv Article',
      description: 'Arxiv article'
    },
    'AUTHOR_HTML': {
      shortName: 'Author Article',
      description: 'Link to HTML page provided by author'
    },
    'ADS_SCAN': {
      shortName: 'ADS Scanned Article',
      description: 'ADS scanned article'
    },
    'ACA': {
      shortName: 'ACA',
      description: 'Acta Astronomica Data Files'
    },
    'ALMA': {
      shortName: 'ALMA',
      description: 'Atacama Large Millimeter/submillimeter Array'
    },
    'ARI': {
      shortName: 'ARI',
      description: 'Astronomisches Rechen-Institut'
    },
    'ASTROVERSE': {
      shortName: 'ASTROVERSE',
      description: 'CfA Dataverse'
    },
    'ATNF': {
      shortName: 'ATNF',
      description: 'Australia Telescope Online Archive'
    },
    'AUTHOR': {
      shortName: 'AUTHOR',
      description: 'Author Hosted Dataset'
    },
    'BICEP2': {
      shortName: 'BICEP2',
      description: 'BICEP/Keck Data'
    },
    'CADC': {
      shortName: 'CADC',
      description: 'Canadian Astronomy Data Center'
    },
    'CDS': {
      shortName: 'CDS',
      description: 'Strasbourg Astronomical Data Center'
    },
    'CXO': {
      shortName: 'CXO',
      description: 'Chandra X-Ray Observatory'
    },
    'ESA': {
      shortName: 'ESA',
      description: 'ESAC Science Data Center'
    },
    'ESO': {
      shortName: 'ESO',
      description: 'European Southern Observatory'
    },
    'GCPD': {
      shortName: 'GCPD',
      description: 'The General Catalogue of Photometric Data'
    },
    'GTC': {
      shortName: 'GTC',
      description: 'Gran Telescopio CANARIAS Public Archive'
    },
    'HEASARC': {
      shortName: 'HEASARC',
      description: 'NASA\'s High Energy Astrophysics Science Archive Research Center'
    },
    'HERSCHEL': {
      shortName: 'HERSCHEL',
      description: 'Herschel Science Center'
    },
    'IBVS': {
      shortName: 'IBVS',
      description: 'Information Bulletin on Variable Stars'
    },
    'INES': {
      shortName: 'INES',
      description: 'IUE Newly Extracted Spectra'
    },
    'ISO': {
      shortName: 'ISO',
      description: 'Infrared Space Observatory'
    },
    'KOA': {
      shortName: 'KOA',
      description: 'Keck Observatory Archive'
    },
    'MAST': {
      shortName: 'MAST',
      description: 'Mikulski Archive for Space Telescopes'
    },
    'NED': {
      shortName: 'NED',
      description: 'NASA/IPAC Extragalactic Database'
    },
    'NEXSCI': {
      shortName: 'NEXSCI',
      description: 'NASA Exoplanet Archive'
    },
    'NOAO': {
      shortName: 'NOAO',
      description: 'National Optical Astronomy Observatory'
    },
    'PASA': {
      shortName: 'PASA',
      description: 'Publication of the Astronomical Society of Australia Datasets'
    },
    'PDG': {
      shortName: 'PDG',
      description: 'Particle Data Group'
    },
    'PDS': {
      shortName: 'PDS',
      description: 'The NASA Planetary Data System'
    },
    'SIMBAD': {
      shortName: 'SIMBAD',
      description: 'SIMBAD Database at the CDS'
    },
    'SPITZER': {
      shortName: 'SPITZER',
      description: 'Spitzer Space Telescope'
    },
    'TNS': {
      shortName: 'TNS',
      description: 'Transient Name Server'
    },
    'VIZIER': {
      shortName: 'VIZIER',
      description: 'VizieR Catalog Service'
    },
    'XMM': {
      shortName: 'XMM',
      description: 'XMM Newton Science Archive'
    },
    'ZENODO': {
      shortName: 'ZENODO',
      description: 'Zenodo Archive'
    }
  };

  /**
   * Create the resolver url
   * @param {string} bibcode - the bibcode
   * @param {string} target - the source target (i.e. PUB_HTML)
   * @returns {string} - the new url
   */
  const _createGatewayUrl = function (bibcode, target) {
    if (_.isString(bibcode) && _.isString(target)) {
      return GATEWAY_BASE_URL + bibcode + '/' + target;
    }
    return '';
  };

  /**
   * process the link data
   *
   * Proceeds in this manner:
   * 1. Check the property to find ESOURCE and DATA
   * 2. If there, find the property on the parent object
   * 3. Process by some rules
   *  3.1. If OPENACCESS property is present, then all esourses ending with _HTML are open
   *  3.2. If <field>_OPENACCESS property is present, then the corresponding esource field is open
   *  3.3. If electr field is present, check if a linkServer is provided among some other things
   *
   * @param {object} data - the data object to process
   * @returns {object} - the fulltext and data sources
   */
  const _processLinkData = _.memoize(function (data) {
    const createGatewayUrl = this._createGatewayUrl;
    let fullTextSources = [];
    const dataProducts = [];
    const property = data.property;
    const hasHTMLOpenAccess = _.contains(property, 'OPENACCESS');

    if (_.contains(property, 'ESOURCE')) {

      // check the esources property
      _.forEach(data.esources, function (el, ids, sources) {
        const parts = el.split('_');
        const linkInfo = LINK_TYPES[el];
        const hasScan = _.contains(sources, 'ADS_SCAN');
        const linkServer = data.link_server;
        const identifier = data.doi || data.issn || data.isbn;

        // Create an OpenURL
        // Only create an openURL if the following is true:
        //   - The article HAS an Identifier (doi, issn, isbn)
        //   - There is NO open access available
        //   - There is NO scan available from the ADS
        //   - The user is authenticated
        //   - the user HAS a library link server
        if (identifier && linkServer && !hasHTMLOpenAccess && !hasScan) {
          const openUrl = new OpenURLGenerator(data, linkServer);
          openUrl.createOpenURL();
          fullTextSources.push({
            url: openUrl.openURL,
            openUrl: true,
            name: 'Find it at your Institution',
            description: linkInfo && linkInfo.description
          });
        }

        if (parts.length > 1) {
          // if entry has _HTML then also check for OPENACCESS on property
          if (parts[1] === 'HTML') {
            fullTextSources.push({
              url: createGatewayUrl(data.bibcode, el),
              open: hasHTMLOpenAccess,
              name: linkInfo && linkInfo.shortName,
              description: linkInfo && linkInfo.description
            });

          // otherwise, just check for the <field>_OPENACCESS
          } else {
            fullTextSources.push({
              url: createGatewayUrl(data.bibcode, el),
              open: _.contains(property, parts[0] + '_OPENACCESS'),
              name: linkInfo && linkInfo.shortName,
              description: linkInfo && linkInfo.description
            });
          }

        // if entry cannot be split, then it will not be open access
        } else {
          fullTextSources.push({
            url: createGatewayUrl(data.bibcode, el),
            open: false,
            name: linkInfo && linkInfo.shortName,
            description: linkInfo && linkInfo.description
          });
        }
      });
    }

    // reorder the full text sources based on our default ordering
    fullTextSources = _.sortBy(fullTextSources, function (source) {
      const rank = DEFAULT_ORDERING.indexOf(source.name);
      return rank > -1 ? rank : 9999;
    });

    // check the data property
    if (_.contains(property, 'DATA')) {
      _.forEach(data.data, function (product) {
        const parts = product.split(':');
        const linkInfo = LINK_TYPES[parts[0]];

        // are there any without a count? just make them 0
        if (parts.length > 1) {
          dataProducts.push({
            url: createGatewayUrl(data.bibcode, parts[0]),
            count: parts[1],
            name: linkInfo && linkInfo.shortName,
            description: linkInfo && linkInfo.description
          });
        } else {
          dataProducts.push({
            url: createGatewayUrl(data.bibcode, product),
            count: '0',
            name: product,
            description: linkInfo && linkInfo.description
          });
        }
      });
    }

    return {
      fullTextSources: fullTextSources,
      dataProducts: dataProducts
    };
  }, function (data) {
    
    // provide a resolver string, to help with the memoizer
    return JSON.stringify(_.pick(data, ['bibcode', 'property', 'esources', 'data']));
  });

  /**
   * Parse a data object to pull out the references/citations and table of contents
   * it will also return a copy of the data object with a links property added
   * @param {object} _data - the data object to parse
   * @returns {object} - copy of the data object with links prop added
   */
  const _parseLinksDataForModel = function (_data, linksData) {
    let links = { list : [], data: [], text: [] };
    const data = _.extend({}, _data, { links: links });

    // map linksData to links object
    if (_.isPlainObject(linksData)) {
      links = _.assign(links, {
        data: links.data.concat(linksData.dataProducts || []),
        text: links.text.concat(linksData.fullTextSources || [])
      });
    }

    if (_.isPlainObject(data)) {

      // check for the citations property
      if (_.isPlainObject(data['[citations]']) && _.isString(data.bibcode)) {
        const citations = data['[citations]'];

        // push it onto the links if the citation count is higher than 0
        if (_.isNumber(citations.num_citations) && citations.num_citations > 0) {
          links.list.push({
            letter: 'C',
            name: 'Citations (' + citations.num_citations + ')',
            url: '#abs/' + data.bibcode + '/citations'
          });
        }

        // push onto the links if the reference count is higher than 0
        if (_.isNumber(citations.num_references) && citations.num_references > 0) {
          links.list.push({
            letter: 'R',
            name: 'References (' + citations.num_references + ')',
            url: '#abs/' + data.bibcode + '/references'
          });
        }
      }

      // check that we have property and whether table of contents is found
      if (_.isArray(data.property) && _.isString(data.bibcode)) {
        if (_.contains(data.property, 'TOC')) {
          links.list.push({
            letter: 'T',
            name: 'Table of Contents',
            url: '#abs/' + data.bibcode + '/tableofcontents'
          });
        }
      }
    } else {
      throw new Error('data must be a plain object');
    }

    return data;
  };

  /**
   * Takes data--a json object from apiResponse--and augments it with a "links"
   * object. This is used for item views in the results widget. This is to be called
   * by the processData method of a widget.
   *
   */
  const parseLinksData = function (data) {
    const parseLinksDataForModel = _.bind(this._parseLinksDataForModel, this);
    const parseResourcesData = _.bind(this.parseResourcesData, this);
    if (_.isArray(data)) {
      return _.map(data, (d) => {
        const linkData = parseResourcesData(d);
        return parseLinksDataForModel(d, linkData);
      });
    }
    return [];
  };

  /**
   * Check that data is an object and that it has the correct properties
   *
   * @param {object} data - the data to parse
   */
  const parseResourcesData = function (data) {
    const processLinkData = _.bind(this._processLinkData, this);

    // data must have 'property' and sub-props
    if (_.isPlainObject(data)) {
      if (_.isArray(data.property) && _.isString(data.bibcode)) {

        // make sure if property has a esource or data, we find it on data as well
        if (_.contains(data.property, 'ESOURCE') && !_.has(data, 'esources')) {
          throw new Error('if `property` property contains `ESOURCE`, then data must have `esources` field');
        }
        if (_.contains(data.property, 'DATA') && !_.has(data, 'data')) {
          throw new Error('if `property` property contains `DATA`, then data must have `data` field');
        }
        return processLinkData(_.extend({}, data));
      }
      throw new Error('data must have `property` and `bibcode`');
    } else {
      throw new Error('data must be a plain object');
    }
  };

  /**
   * Takes in a type and an identifier and will generate a link
   * @param {string} bibcode - the bibcode
   * @param {string} type - the type of identifier
   * @param {string|array} identifier - the identifier to use to build the url
   * @returns {string}
   */
  const createUrlByType = function (bibcode, type, identifier) {
    let id = identifier;
    if (_.isArray(id)) {
      id = id[0];
    }

    if (_.isString(bibcode) && _.isString(type) && _.isString(id)) {

      // replace any forward slashes in id with underscores (requirement of gateway)
      id = id.replace(/\//g, ',');
      return GATEWAY_BASE_URL + bibcode + '/' + type + ':' + id;
    }
    return '';
  };

  return {
    LINK_TYPES: LINK_TYPES,
    parseLinksData: parseLinksData,
    parseResourcesData: parseResourcesData,
    createUrlByType: createUrlByType,
    _createGatewayUrl: _createGatewayUrl,
    _processLinkData: _processLinkData,
    _parseLinksDataForModel: _parseLinksDataForModel
  };
});
