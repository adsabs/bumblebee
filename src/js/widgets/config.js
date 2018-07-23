define([], function () {
  return {
    export: {
      formats: [
        {
          value: 'bibtex',
          label: 'BibTeX',
          help: 'BibTeX format',
          ext: 'bbl'
        }, {
          value: 'ads',
          label: 'ADS',
          help: 'ADS format',
          ext: 'txt'
        }, {
          value: 'bibtexabs',
          label: 'BibTeX ABS',
          help: 'BibTeX with abstracts',
          ext: 'bbl'
        }, {
          value: 'endnote',
          label: 'EndNote',
          help: 'EndNote format',
          ext: 'enw'
        }, {
          value: 'procite',
          label: 'ProCite',
          help: 'ProCite format',
          ext: 'txt'
        }, {
          value: 'ris',
          label: 'RIS',
          help: 'Research Information Systems (RIS) format',
          ext: 'txt'
        }, {
          value: 'refworks',
          label: 'RefWorks',
          help: 'RefWorks format',
          ext: 'txt'
        }, {
          value: 'rss',
          label: 'RSS',
          help: 'RSS format',
          ext: 'rss'
        }, {
          value: 'medlars',
          label: 'MEDLARS',
          help: 'Medical Literature Analysis and Retrieval System (MEDLARS) format',
          ext: 'txt'
        }, {
          value: 'dcxml',
          label: 'DC-XML',
          help: 'Dublin Core XML format',
          ext: 'xml'
        }, {
          value: 'refxml',
          label: 'REF-XML',
          help: 'ADS link data in XML format',
          ext: 'xml'
        }, {
          value: 'refabsxml',
          label: 'REFABS-XML',
          help: 'ADS records in XML format',
          ext: 'xml'
        }, {
          value: 'aastex',
          label: 'AASTeX',
          help: 'LaTeX format for AAS journals',
          ext: 'txt'
        }, {
          value: 'icarus',
          label: 'Icarus',
          help: 'LaTeX format for use in Icarus',
          ext: 'txt'
        }, {
          value: 'mnras',
          label: 'MNRAS',
          help: 'LaTeX format for use in MNRAS',
          ext: 'txt'
        }, {
          value: 'soph',
          label: 'Solar Physics',
          help: 'LaTeX format for use in Solar Physics',
          ext: 'txt'
        }, {
          value: 'votable',
          label: 'VOTable',
          help: 'VOTable XML format',
          ext: 'xml'
        }, {
          value: 'custom',
          label: 'Custom Format',
          help: 'Enter Your Own Custom Format',
          ext: 'txt'
        }
      ]
    }
  };
});
