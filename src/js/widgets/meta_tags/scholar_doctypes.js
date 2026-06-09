/**
 * Doctypes permitted to emit Google Scholar-compatible (Highwire
 * citation_*) meta tags on the abstract page. Only these doctypes display
 * the tags; any other or unknown doctype omits them. Schema.org JSON-LD is
 * emitted for all records regardless and is not gated by this list.
 */
define([], function() {
  const GOOGLE_SCHOLAR_DOCTYPES = [
    'article',
    'eprint',
    'phdthesis',
    'circular',
    'inbook',
    'erratum',
    'book',
    'mastersthesis',
    'inproceedings',
    'abstract',
    'techreport',
    'bookreview',
    'proceedings',
    'editorial',
    'newsletter',
    'obituary',
  ];

  // Case-insensitive to tolerate inconsistent casing in upstream data.
  function showsGoogleScholarTags(doctype) {
    if (!doctype || typeof doctype !== 'string') {
      return false;
    }
    return GOOGLE_SCHOLAR_DOCTYPES.indexOf(doctype.toLowerCase()) !== -1;
  }

  return {
    GOOGLE_SCHOLAR_DOCTYPES: GOOGLE_SCHOLAR_DOCTYPES,
    showsGoogleScholarTags: showsGoogleScholarTags,
  };
});
