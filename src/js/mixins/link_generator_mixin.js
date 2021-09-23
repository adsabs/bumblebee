define(['underscore', 'js/mixins/openurl_generator'], function(
  _,
  { getOpenUrl }
) {
  const GATEWAY_BASE_URL = '/link_gateway/';

  const DEFAULT_ORDERING = [
    'ADS PDF',
    'ADS Scanned Article',
    'My Institution',
    'Publisher Article',
    'Publisher PDF',
    'arXiv PDF',
  ];

  /**
   * @typedef {Object} LinkType
   * @property {string} name - Full name
   * @property {string} shortName - shorter name for display
   * @property {string} description - longer description
   * @property {('PDF' | 'SCAN' | 'HTML')} type - Resource type
   */

  /**
   * set of link types and descriptions
   * @type {Object.<string, LinkType>}
   */
  const LINK_TYPES = {
    '4TU.ResearchData': {
      shortName: '4TU.ResearchData',
      description:
        'International data repository for science, engineering and design',
    },
    AcA: {
      shortName: 'AcA',
      description: 'Acta Astronomica Data Files',
    },
    ADS_PDF: {
      name: 'ADS PDF',
      shortName: 'ADS',
      description: 'ADS PDF',
      type: 'PDF',
    },
    ADS_SCAN: {
      name: 'ADS Scanned Article',
      description: 'ADS scanned article',
      shortName: 'ADS',
      type: 'SCAN',
    },
    AHED: {
      shortName: 'AHED',
      description: 'Astrobiology Habitable Environments Database',
    },
    ALMA: {
      shortName: 'ALMA',
      description: 'Atacama Large Millimeter/submillimeter Array',
    },
    ArcticData: {
      shortName: 'ArcticData',
      description: 'Arctic Data Center',
    },
    ARI: {
      shortName: 'ARI',
      description: 'Astronomisches Rechen-Institut',
    },
    ARTEMIS: {
      shortName: 'ARTEMIS',
      description:
        'Acceleration Reconnection Turbulence & Electrodynamics of Moon Interaction with the Sun',
    },
    AstroGeo: {
      shortName: 'AstroGeo',
      description: 'USGS Astrogeology Science Center',
    },
    Astroverse: {
      shortName: 'Astroverse',
      description: 'CfA Dataverse',
    },
    ASU: {
      shortName: 'ASU',
      description: 'Arizona State University',
    },
    ATNF: {
      shortName: 'ATNF',
      description: 'Australia Telescope Online Archive',
    },
    Author: {
      shortName: 'Author',
      description: 'Author Hosted Dataset',
    },
    AUTHOR_HTML: {
      name: 'Author Article',
      shortName: 'Author',
      description: 'Link to HTML page provided by author',
      type: 'HTML',
    },
    AUTHOR_PDF: {
      name: 'Author PDF',
      shortName: 'Author',
      description: 'Link to PDF page provided by author',
      type: 'PDF',
    },
    BAS: {
      shortName: 'BAS',
      description: 'British Antarctic Survey',
    },
    BAVJ: {
      shortName: 'BAVJ',
      description: 'Data of the German Association for Variable Stars',
    },
    BICEP2: {
      shortName: 'BICEP2',
      description: 'BICEP/Keck Data',
    },
    CADC: {
      shortName: 'CADC',
      description: 'Canadian Astronomy Data Center',
    },
    Caltech: {
      shortName: 'Caltech',
      description: 'California Institute of Technology',
    },
    CDS: {
      shortName: 'CDS',
      description: 'Strasbourg Astronomical Data Center',
    },
    Chandra: {
      shortName: 'Chandra',
      description: 'Chandra X-Ray Observatory',
    },
    ClimateDataStore: {
      shortName: 'ClimateDataStore',
      description: 'Climate Data Store',
    },
    CMDN: {
      shortName: 'CMDN',
      description: 'China Meteorological Data Service Centre',
    },
    CXO: {
      shortName: 'CXO',
      description: 'Chandra Data Archive',
    },
    DARTS: {
      shortName: 'DARTS',
      description: 'Data ARchives and Transmission System',
    },
    Dataverse: {
      shortName: 'Dataverse',
      description: 'Dataverse Project',
    },
    Dryad: {
      shortName: 'Dryad',
      description: 'International Repository of Research Data',
    },
    EARTHCHEM: {
      shortName: 'EARTHCHEM',
      description: 'Open-access repository for geochemical datasets',
    },
    ECMWF: {
      shortName: 'ECMWF',
      description: 'European Centre for Medium-Range Weather Forecasts',
    },
    EMFISIS: {
      shortName: 'EMFISIS',
      description: 'An instrument suite on the Van Allen Probes',
    },
    EPRINT_HTML: {
      name: 'arXiv Article',
      shortName: 'arXiv',
      description: 'Arxiv article',
      type: 'HTML',
    },
    EPRINT_PDF: {
      name: 'arXiv PDF',
      shortName: 'arXiv',
      description: 'ArXiv eprint',
      type: 'PDF',
    },
    ERGSC: {
      shortName: 'ERGSC',
      description: 'ERG Science Center',
    },
    ESA: {
      shortName: 'ESA',
      description: 'ESAC Science Data Center',
    },
    ESGF: {
      shortName: 'ESGF',
      description: 'Earth System Grid Federation',
    },
    ESO: {
      shortName: 'ESO',
      description: 'European Southern Observatory',
    },
    ETHZ: {
      shortName: 'ETHZ',
      description: 'ETH Zurich Research Collection',
    },
    FDSN: {
      shortName: 'FDSN',
      description: 'International Federation of Digital Seismograph Networks',
    },
    Figshare: {
      shortName: 'Figshare',
      description: 'Online Open Access Repository',
    },
    figshare: {
      shortName: 'figshare',
      description: 'Online Open Access Repository',
    },
    GCPD: {
      shortName: 'GCPD',
      description: 'The General Catalogue of Photometric Data',
    },
    Gemini: {
      shortName: 'Gemini',
      description: 'Gemini Observatory Archive',
    },
    Github: {
      shortName: 'Github',
      description:
        'Web-based version-control and collaboration platform for software developers.',
    },
    GRAS: {
      shortName: 'GRAS',
      description:
        'Lunar and Planet Exploration Program Ground Application System',
    },
    GTC: {
      shortName: 'GTC',
      description: 'Gran Telescopio CANARIAS Public Archive',
    },
    HEASARC: {
      shortName: 'HEASARC',
      description:
        'NASA High Energy Astrophysics Science Archive Research Center',
    },
    Herschel: {
      shortName: 'Herschel',
      description: 'Herschel Science Center',
    },
    IBVS: {
      shortName: 'IBVS',
      description: 'Information Bulletin on Variable Stars',
    },
    INES: {
      shortName: 'INES',
      description: 'IUE Newly Extracted Spectra',
    },
    IRIS: {
      shortName: 'IRIS',
      description: 'Incorporated Research Institutions for Seismology',
    },
    IRSA: {
      shortName: 'IRSA',
      description: 'NASA/IPAC Infrared Science Archive',
    },
    ISO: {
      shortName: 'ISO',
      description: 'Infrared Space Observatory',
    },
    JOSS: {
      shortName: 'JOSS',
      description: 'Journal of Open Source Software',
    },
    JWST: {
      shortName: 'JWST',
      description: 'JWST Proposal Info',
    },
    KOA: {
      shortName: 'KOA',
      description: 'Keck Observatory Archive',
    },
    LAADS: {
      shortName: 'LAADS',
      description:
        'Level-1 and Atmosphere Archive & Distribution System Distributed Active Archive Center',
    },
    label: {
      shortName: 'label',
      description: 'name',
    },
    LASP: {
      shortName: 'LASP',
      description: 'Laboratory for Atmospheric and Space Physics',
    },
    LPL: {
      shortName: 'LPL',
      description: 'Lunar and Planetary Laboratory',
    },
    MAST: {
      shortName: 'MAST',
      description: 'Mikulski Archive for Space Telescopes',
    },
    MetOffice: {
      shortName: 'MetOffice',
      description: 'Met Office',
    },
    MIT: {
      shortName: 'MIT',
      description: 'Massachusetts Institute of Technology',
    },
    NASA: {
      shortName: 'NASA',
      description: 'NASA Data Portal',
    },
    NCAR: {
      shortName: 'NCAR',
      description: 'National Center for Atmospheric Research',
    },
    NED: {
      shortName: 'NED',
      description: 'NASA/IPAC Extragalactic Database',
    },
    NExScI: {
      shortName: 'NExScI',
      description: 'NASA Exoplanet Archive',
    },
    NOAA: {
      shortName: 'NOAA',
      description: 'National Oceanic and Atmospheric Administration',
    },
    NOAO: {
      shortName: 'NOAO',
      description: 'National Optical Astronomy Observatory',
    },
    OSF: {
      shortName: 'OSF',
      description: 'Open Science Foundation',
    },
    PANGAEA: {
      shortName: 'PANGAEA',
      description:
        'Digital Data Library and a Data Publisher for Earth System Science',
    },
    pangaea: {
      shortName: 'pangaea',
      description:
        'Digital Data Library and a Data Publisher for Earth System Science',
    },
    PASA: {
      shortName: 'PASA',
      description:
        'Publication of the Astronomical Society of Australia Datasets',
    },
    PDG: {
      shortName: 'PDG',
      description: 'Particle Data Group',
    },
    PDS: {
      shortName: 'PDS',
      description: 'The NASA Planetary Data System',
    },
    PDSS: {
      shortName: 'PDSS',
      description: 'The NASA Planetary Data System',
    },
    PIK: {
      shortName: 'PIK',
      description: 'Potsdam Institute for Climate Impact Research',
    },
    protocols: {
      shortName: 'protocols',
      description:
        'Collaborative Platform and Preprint Server for Science Methods and Protocols',
    },
    PUB_HTML: {
      name: 'Publisher Article',
      shortName: 'Publisher',
      description: 'Electronic on-line publisher article (HTML)',
      type: 'HTML',
    },
    PUB_PDF: {
      name: 'Publisher PDF',
      shortName: 'Publisher',
      description: 'Publisher PDF',
      type: 'PDF',
    },
    ScienceBase: {
      shortName: 'ScienceBase',
      description: 'ScienceBase',
    },
    SIMBAD: {
      shortName: 'SIMBAD',
      description: 'SIMBAD Database at the CDS',
    },
    Spitzer: {
      shortName: 'Spitzer',
      description: 'Spitzer Space Telescope',
    },
    TDR: {
      shortName: 'TDR',
      description: 'Texas Data Respository',
    },
    THEMIS: {
      shortName: 'THEMIS',
      description:
        'Time History of Events and Macroscopic Interactions During Substorms',
    },
    TNS: {
      shortName: 'TNS',
      description: 'Transient Name Server',
    },
    UNAVCO: {
      shortName: 'UNAVCO',
      description: 'UNAVCO',
    },
    Vizier: {
      shortName: 'VizieR',
      description: 'VizieR Catalog Service',
    },
    XMM: {
      shortName: 'XMM',
      description: 'XMM Newton Science Archive',
    },
    Zenodo: {
      shortName: 'Zenodo',
      description: 'Zenodo Archive',
    },
  };

  const enc = function(str) {
    return encodeURIComponent(str);
  };

  /**
   * Create the resolver url
   * @param {string} bibcode - the bibcode
   * @param {string} target - the source target (i.e. PUB_HTML)
   * @returns {string} - the new url
   */
  const _createGatewayUrl = function(bibcode, target) {
    if (_.isString(bibcode) && _.isString(target)) {
      return GATEWAY_BASE_URL + enc(bibcode) + '/' + target;
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
  const _processLinkData = function(data) {
    const createGatewayUrl = this._createGatewayUrl;
    let fullTextSources = [];
    let dataProducts = [];
    let countOpenUrls = 0;
    const property = data.property;

    // check the esources property
    _.forEach(data.esources, function(el) {
      const parts = el.split('_');
      const linkInfo = LINK_TYPES[el];
      const linkServer = data.link_server;
      const identifier = data.doi || data.issn || data.isbn;

      // Create an OpenURL
      // Only create an openURL if the following is true:
      //   - The article HAS an Identifier (doi, issn, isbn)
      //   - The user is authenticated
      //   - the user HAS a library link server
      if (identifier && linkServer && countOpenUrls < 1) {
        fullTextSources.push({
          url: getOpenUrl({ metadata: data, linkServer }),
          openUrl: true,
          type: 'INSTITUTION',
          shortName: 'My Institution',
          name: 'My Institution',
          description: 'Find Article At My Institution',
        });
        countOpenUrls += 1;
      }

      if (parts.length > 1) {
        fullTextSources.push({
          url: createGatewayUrl(data.bibcode, el),
          open: _.contains(property, parts[0] + '_OPENACCESS'),
          shortName: (linkInfo && linkInfo.shortName) || el,
          name: (linkInfo && linkInfo.name) || el,
          type: (linkInfo && linkInfo.type) || 'HTML',
          description: linkInfo && linkInfo.description,
        });

        // if entry cannot be split, then it will not be open access
      } else {
        fullTextSources.push({
          url: createGatewayUrl(data.bibcode, el),
          open: false,
          shortName: (linkInfo && linkInfo.shortName) || el,
          name: (linkInfo && linkInfo.name) || el,
          type: (linkInfo && linkInfo.type) || 'HTML',
          description: linkInfo && linkInfo.description,
        });
      }
    });

    // if no arxiv link is present, check links_data as well to make sure
    const hasEprint = _.find(fullTextSources, {
      name: LINK_TYPES.EPRINT_PDF.name,
    });
    if (!hasEprint && _.isArray(data.links_data)) {
      _.forEach(data.links_data, function(linkData) {
        const link = JSON.parse(linkData);
        if (/preprint/i.test(link.type)) {
          const info = LINK_TYPES.EPRINT_PDF;
          fullTextSources.push({
            url: link.url,
            open: true,
            shortName: (info && info.shortName) || link.type,
            name: (info && info.name) || link.type,
            type: (info && info.type) || 'HTML',
            description: info && info.description,
          });
        }
      });
    }

    // reorder the full text sources based on our default ordering
    fullTextSources = _.sortBy(fullTextSources, function(source) {
      const rank = DEFAULT_ORDERING.indexOf(source.name);
      return rank > -1 ? rank : 9999;
    });

    // check the data property
    _.forEach(data.data, function(product) {
      const parts = product.split(':');
      const linkInfo = LINK_TYPES[parts[0]];

      // are there any without a count? just make them 1
      if (parts.length > 1) {
        dataProducts.push({
          url: createGatewayUrl(data.bibcode, parts[0]),
          count: parts[1],
          name: linkInfo ? linkInfo.shortName : parts[0],
          description: linkInfo ? linkInfo.description : parts[0],
        });
      } else {
        dataProducts.push({
          url: createGatewayUrl(data.bibcode, product),
          count: '1',
          name: linkInfo ? linkInfo.shortName : product,
          description: linkInfo ? linkInfo.description : product,
        });
      }
    });

    // sort the data products by descending by count
    dataProducts = _.sortBy(dataProducts, 'count').reverse();

    return {
      fullTextSources: fullTextSources,
      dataProducts: dataProducts,
    };
  };

  /**
   * Parse a data object to pull out the references/citations and table of contents
   * it will also return a copy of the data object with a links property added
   * @param {object} _data - the data object to parse
   * @returns {object} - copy of the data object with links prop added
   */
  const _parseLinksDataForModel = function(_data, linksData) {
    let links = { list: [], data: [], text: [] };
    const data = _.extend({}, _data, { links: links });

    // map linksData to links object
    if (_.isPlainObject(linksData)) {
      links = _.assign(links, {
        data: links.data.concat(linksData.dataProducts || []),
        text: links.text.concat(linksData.fullTextSources || []),
      });
    }

    if (_.isPlainObject(data)) {
      // check for the citations property
      if (_.isPlainObject(data['[citations]']) && _.isString(data.bibcode)) {
        const citations = data['[citations]'];

        // push it onto the links if the citation count is higher than 0
        if (
          _.isNumber(citations.num_citations) &&
          citations.num_citations > 0
        ) {
          links.list.push({
            letter: 'C',
            name: 'Citations (' + citations.num_citations + ')',
            url: '#abs/' + enc(data.bibcode) + '/citations',
          });
        }

        // push onto the links if the reference count is higher than 0
        if (
          _.isNumber(citations.num_references) &&
          citations.num_references > 0
        ) {
          links.list.push({
            letter: 'R',
            name: 'References (' + citations.num_references + ')',
            url: '#abs/' + enc(data.bibcode) + '/references',
          });
        }
      }

      // check that we have property and whether table of contents is found
      if (_.isArray(data.property) && _.isString(data.bibcode)) {
        if (_.contains(data.property, 'TOC')) {
          links.list.push({
            letter: 'T',
            name: 'Table of Contents',
            url: '#abs/' + enc(data.bibcode) + '/toc',
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
  const parseLinksData = function(data) {
    const parseLinksDataForModel = _.bind(this._parseLinksDataForModel, this);
    const parseResourcesData = _.bind(this.parseResourcesData, this);
    if (_.isArray(data)) {
      return _.map(data, function(d) {
        try {
          const linkData = parseResourcesData(d);
          return parseLinksDataForModel(d, linkData);
        } catch (e) {
          return d;
        }
      });
    }
    return [];
  };

  /**
   * Check that data is an object and that it has the correct properties
   *
   * @param {object} data - the data to parse
   */
  const parseResourcesData = function(data) {
    const processLinkData = _.bind(this._processLinkData, this);

    // data must have 'property' and sub-props
    if (_.isPlainObject(data)) {
      if (_.isArray(data.property) && _.isString(data.bibcode)) {
        // make sure if property has a esource or data, we find it on data as well
        if (_.contains(data.property, 'ESOURCE') && !_.has(data, 'esources')) {
          throw new Error(
            'if `property` property contains `ESOURCE`, then data must have `esources` field'
          );
        }
        if (_.contains(data.property, 'DATA') && !_.has(data, 'data')) {
          throw new Error(
            'if `property` property contains `DATA`, then data must have `data` field'
          );
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
  const createUrlByType = function(bibcode, type, identifier) {
    let id = identifier;
    if (_.isArray(id)) {
      id = id[0];
    }

    if (_.isString(bibcode) && _.isString(type) && _.isString(id)) {
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
    _parseLinksDataForModel: _parseLinksDataForModel,
  };
});
