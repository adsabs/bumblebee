/**
 * Quickfield descriptions for showing tooltips with next to the quick field options
 *
 * Each property in this file should match the `value` attribute
 * in the template file (../templates/option-dropdown.html)
 * for each item
 */

define({
  abs: {
    title: 'abstract',
    description: 'Search for word or phrase in abstract, title and keywords',
    syntax: ['abs:"phrase"'],
    example: ['abs:"dark energy"'],
  },
  abstract: {
    title: 'abstract only',
    description: 'Search for a word or phrase in an abstract only',
    syntax: ['abstract:"phrase"'],
    example: ['abstract:"dark energy"'],
  },
  ack: {
    title: 'acknowledgements',
    description: 'Search for a word or phrase in the acknowledgements extracted from fulltexts.',
    syntax: ['ack:"phrase"'],
    example: ['ack:"ADS"'],
  },
  aff: {
    title: 'affiliation',
    description: 'Search for word or phrase in the raw, provided affiliation field',
    syntax: ['aff:"phrase"'],
    example: ['aff:"harvard"'],
  },
  arxiv_class: {
    title: 'arXiv category',
    description: 'Finds all arXiv pre-prints in the class specified',
    syntax: ['arxiv_class:arxivclass'],
    example: ['arxiv_class:"High Energy Physics - Experiment"'],
  },
  author_count: {
    title: 'author count',
    description: 'Find records that have a specific number of authors, or a range of author counts',
    syntax: ['author_count:count', 'author_count:[min_count TO max_count]'],
    example: ['author_count:40', 'author_count:[10 TO 100]'],
  },
  author: {
    title: 'author',
    description: 'Author name may include just lastname and initial, or stricter author search (recommended)',
    syntax: ['author:"Last, F"', 'author:"Last, First […]"'],
    example: ['author:"huchra, john p"', 'author:"huchra, john p"'],
  },
  bibcode: {
    title: 'bibcode',
    description: 'Find a specific record using the ADS bibcode (ADS identifier of a paper)',
    syntax: ['bibcode:adsbib'],
    example: ['bibcode:2003AJ….125..525J'],
  },
  bibgroup: {
    title: 'bibliographic group',
    description: 'Limit search to papers in HST bibliography',
    syntax: ['bibgroup:name'],
    example: ['bibgroup:HST'],
  },
  bibstem: {
    title: 'bib abbrev',
    description: 'Find records that contain a specific bibstem in their bibcode',
    syntax: ['bibstem:adsbibstem'],
    example: ['bibstem:ApJ'],
  },
  body: {
    title: 'body of article',
    description: 'Search for a word or phrase in (only) the full text',
    syntax: ['body:"phrase"'],
    example: ['body:"gravitational waves"'],
  },
  data: {
    title: 'data archive',
    description: 'Limit search to papers with data from specified',
    syntax: ['data:archive'],
    example: ['data:NED'],
  },
  collection: {
    title: 'collection',
    description: 'Search from the astronomy, physics, or general collection',
    syntax: ['collection:collection'],
    example: ['collection:general'],
  },
  citation_count: {
    title: 'citation count',
    description: 'Find records that have a specific number of citations, or a range of citation counts',
    syntax: ['citation_count:count', 'citation_count:[min_count TO max_count]'],
    example: ['citation_count:40', 'citation_count:[10 TO 100]'],
  },
  doctype: {
    title: 'doctype',
    description: 'Limit search to records corresponding to data catalogs',
    syntax: ['doctype:type'],
    example: ['doctype:catalog'],
  },
  doi: {
    title: 'doi',
    description: 'finds a specific record using its digital object id',
    syntax: ['doi:DOI'],
    example: ['doi:10.1086/345794'],
  },
  entdate: {
    title: 'entdate',
    description: 'Creation date of ADS record in user-friendly format (YYYY-MM-DD)',
    syntax: ['entdate:YYYY-MM-DD'],
    example: ['entdate:2019-05-20'],
  },
  'first-author': {
    title: 'first author',
    description: 'Search by first author of the paper',
    syntax: ['first_author:"Last, F"'],
    example: ['first_author:"huchra, j"'],
  },
  full: {
    title: 'fulltext',
    description: 'Search for word or phrase in fulltext, acknowledgements, abstract, title and keywords',
    syntax: ['full:"phrase"'],
    example: ['full:"gravitational waves"'],
  },
  identifier: {
    title: 'identifier',
    description: 'Find a paper using any of its identifiers, arXiv, bibcode, doi, etc.',
    syntax: ['identifier:bibcode'],
    example: ['identifier:2003AJ….125..525J'],
  },
  inst: {
    title: 'institution',
    description:
      'Search by author\'s canonical affiliation. Click <a href="https://github.com/adsabs/CanonicalAffiliations/blob/master/parent_child.tsv" ref="noopener noreferrer" target="_blank">here</a> for a full list',
    syntax: ['inst:id'],
    example: ['inst:CfA'],
  },
  keyword: {
    title: 'keyword',
    description: 'Search publisher- or author-supplied keywords',
    syntax: ['keyword:"phrase"'],
    example: ['keyword:sun'],
  },
  object: {
    title: 'object',
    description: 'Search for papers tagged with a specific astronomical object or at or near a set of coordinates',
    syntax: ['object:"object"'],
    example: ['object:Andromeda'],
  },
  orcid: {
    title: 'orcid',
    description: 'Search for papers that are associated with a specific ORCiD iD',
    syntax: ['orcid:id'],
    example: ['orcid:0000-0000-0000-0000'],
  },
  page: {
    title: 'page',
    description: 'Search for papers with a given page number',
    syntax: ['page:number'],
    example: ['page:410'],
  },
  property: {
    title: 'property',
    description:
      'An array of miscellaneous flags associated with the record. Possible values include: refereed, notrefereed, article, nonarticle, ads_openaccess, eprint_openaccess, pub_openaccess, openaccess, ocrabstract',
    syntax: ['property:type'],
    example: ['property:openaccess'],
  },
  pub: {
    title: 'publication full name',
    description: 'Limit search to a specific publication',
    syntax: ['bibstem:adsbibstem'],
    example: ['bibstem:ApJ'],
  },
  pubdate: {
    title: 'date published',
    description: 'Use fine-grained dates for publication range',
    syntax: ['pubdate:[YYYY-MM TO YYYY-MM]'],
    example: ['pubdate:[2005-10 TO 2006-09]'],
  },
  title: {
    title: 'title',
    description: 'Search for word or phrase in title field',
    syntax: ['title:"phrase"'],
    example: ['title:"weak lensing"'],
  },
  volume: {
    title: 'volume',
    description: 'Search for papers with a given volume',
    syntax: ['volume:volume'],
    example: ['volume:10'],
  },
  year: {
    title: 'year',
    description: 'Year of publication',
    syntax: ['year:YYYY', 'year:YYYY-YYYY'],
    example: ['year:2000', 'year:2000-2005'],
  },
  citations: {
    title: 'citations()',
    description: 'Returns list of citations from given papers; use [citations] to get the field contents',
    syntax: ['citations(query)'],
    example: ['citations(author:"huchra, john")'],
  },
  pos: {
    title: 'pos()',
    description:
      'Search for an item within a field by specifying the position in the field. The example for this operator is pos(fieldedquery,position,[endposition]). If no endposition is given, then it is assumed to be endposition = position, otherwise this performs a query within the range [position, endposition].',
    syntax: ['pos(fieldedquery,position,[endposition])'],
    example: ['pos(author:"Oort, J",2)'],
  },
  references: {
    title: 'references()',
    description: 'Returns list of references from given papers',
    syntax: ['references(query)'],
    example: ['references(bibcode:2003AJ....125..525J)'],
  },
  reviews: {
    title: 'reviews()',
    description:
      'Returns the list of documents citing the most relevant papers on the topic being researched; these are papers containing the most extensive reviews of the field.',
    syntax: ['reviews(query)'],
    example: ['reviews("weak lensing")'],
  },
  similar: {
    title: 'similar()',
    description: 'Return similar documents, based on the similarity of the abstract text',
    syntax: ['similar(query)'],
    example: ['similar(bibcode:2000A&AS..143...41K)'],
  },
  topn: {
    title: 'topn()',
    description: 'Return the top N number of documents',
    syntax: ['topn(N, query)'],
    example: ['topn(100, database:astronomy, citation_count desc)'],
  },
  trending: {
    title: 'trending()',
    description:
      'Returns the list of documents most read by users who read recent papers on the topic being researched; these are papers currently being read by people interested in this field.',
    syntax: ['trending(query)'],
    example: ['trending(exoplanets)'],
  },
  useful: {
    title: 'useful()',
    description:
      'Returns the list of documents frequently cited by the most relevant papers on the topic being researched; these are studies which discuss methods and techniques useful to conduct research in this field.',
    syntax: ['useful(query)'],
    example: ['useful("galaxy surveys")'],
  },
  '?': {
    title: 'single wildcard: ?',
    description: 'Matches a single character',
    syntax: ['?'],
    example: ['title:(k? star)'],
  },
  '*': {
    title: 'wildcard: *',
    description: 'Matches zero or more sequential characters',
    syntax: ['*'],
    example: ['title:(gravit* wave)'],
  },
  '=': {
    title: 'exact match: =',
    description: 'Exact match',
    syntax: ['=query'],
    example: ['=author:"murray, stephen"'],
  },
});
