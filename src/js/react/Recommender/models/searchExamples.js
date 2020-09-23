define([], function() {
  const searchExamples = [
    {
      label: 'author',
      example: 'author:"huchra, john"',
    },
    {
      label: 'first author',
      example: 'author:"^huchra, john"',
    },
    {
      label: 'abstract + title',
      example: 'abs:"dark energy"',
    },
    {
      label: 'year',
      example: 'year:2000',
    },
    {
      label: 'year range',
      example: 'year:2000-2005',
    },
    {
      label: 'full text',
      example: 'full:"gravity waves"',
    },
    {
      label: 'publication',
      example: 'bibstem:ApJ',
      tooltip:
        "this field requires the bibstem, or journal abbreviation--try going to the 'Paper' tab above for an easy-to-use form version",
    },
    {
      label: 'citations',
      example: 'citations(author:"huchra, j")',
      tooltip: 'finds all papers that cite a given set of papers',
    },
    {
      label: 'references',
      example: 'references(author:"huchra, j")',
      tooltip: 'finds all papers referenced by a given set of papers',
    },
    {
      label: 'reviews',
      example: 'reviews("gamma-ray bursts")',
      tooltip:
        'finds articles citing the most relevant papers on the topic being researched',
    },
    {
      label: 'refereed',
      example: 'property:refereed',
      tooltip: 'limit to non-refereed papers by searching property:notrefereed',
    },
    {
      label: 'astronomy',
      example: 'database:astronomy',
      tooltip: 'limit to physics papers by searching collection:physics',
    },
    {
      label: 'OR',
      example: 'abs:(planet OR star)',
      tooltip:
        'default logic is AND, e.g. abs:(planet star) would be interpreted as abs:(planet AND star)',
    },
  ];

  return searchExamples;
});
