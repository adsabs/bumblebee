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
    'KamionkowskiMarc',
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
      examples: ['gravity waves'],
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
      syntax: 'citations(author:"%")',
      examples: authors,
      tooltip: 'finds all papers that cite a given set of papers',
    },
    {
      label: 'references',
      syntax: 'references(author:"%")',
      examples: authors,
      tooltip: 'finds all papers referenced by a given set of papers',
    },
    {
      label: 'reviews',
      syntax: 'reviews("%")',
      examples: ['gamma-ray bursts'],
      tooltip:
        'finds articles citing the most relevant papers on the topic being researched',
    },
    {
      label: 'refereed',
      syntax: 'property:%',
      examples: ['refereed'],
      tooltip: 'limit to non-refereed papers by searching property:notrefereed',
    },
    {
      label: 'astronomy',
      syntax: 'database:%',
      examples: ['astronomy'],
      tooltip: 'limit to physics papers by searching collection:physics',
    },
    {
      label: 'OR',
      syntax: 'abs:(planet OR star)',
      examples: [],
      tooltip:
        'default logic is AND, e.g. abs:(planet star) would be interpreted as abs:(planet AND star)',
    },
  ];

  return searchExamples;
});
