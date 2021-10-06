define([], function() {
  const authors = [
    'Penrose, Roger',
    'Genzel, Reinhard',
    'Ghez, Andrea M.',
    'Lupton, Robert',
    'Paxton, Bill',
    'Impey, Chris',
    'Dressing, Courtney',
    'Weinberg, David',
    'López Rodríguez, Enrique',
    'Kreidberg, Laura',
    'Scoville, Nick',
    'Dawson, Rebekah',
    'Demorest, Paul',
    'Suyu, Sherry H.',
    'Kamionkowski, Marc',
    'Seljak, Uroš',
    'Zaldarriaga, Matias',
    'Kaspi, Victoria M.',
    'Kouveliotou, Chryssa',
  ];

  const searchExamples = [
    {
      label: 'author',
      syntax: 'author:"%"',
      examples: authors,
    },
    {
      label: 'first author',
      syntax: 'author:"^%"',
      examples: authors,
    },
    {
      label: 'abstract + title',
      syntax: 'abs:"%"',
      examples: ['dark energy'],
    },
    {
      label: 'year',
      syntax: 'year:%',
      examples: ['2000'],
    },
    {
      label: 'year range',
      syntax: 'year:%',
      examples: ['2000-2005'],
    },
    {
      label: 'full text',
      syntax: 'full:"%"',
      examples: ['super Earth'],
    },
    {
      label: 'publication',
      syntax: 'bibstem:%',
      examples: ['ApJ'],
      tooltip:
        "this field requires the bibstem, or journal abbreviation--try going to the 'Paper' tab above for an easy-to-use form version",
    },
    {
      label: 'citations',
      syntax: 'citations(%)',
      examples: ['abstract:JWST'],
      tooltip: 'finds all papers that cite a given set of papers',
    },
    {
      label: 'refereed',
      syntax: 'property:%',
      examples: ['refereed'],
      tooltip: 'limit to refereed papers',
    },
    {
      label: 'astronomy',
      syntax: 'collection:%',
      examples: ['astronomy'],
      tooltip: 'limit search to collection',
    },
    {
      label: 'exact search',
      syntax: '=%',
      examples: ['body:"intracluster medium"'],
    },
    {
      label: 'institution',
      syntax: 'inst:%',
      examples: ['CfA'],
    },
    {
      label: 'author count',
      syntax: 'author_count:%',
      examples: ['[1 TO 10]'],
    },
    {
      label: 'record type',
      syntax: 'doctype:%',
      examples: ['software'],
    },
  ];

  return searchExamples;
});
