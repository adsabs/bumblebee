define([], function() {
  const authors = [
    'Penrose, Roger',
    'Genzel, Reinhard',
    'Ghez, Andrea M.',
    'Murray, Norman',
    'Filippenko, Alex',
    'Mushotzky, Richard',
    'Greaves, Jane',
    'York, Donald',
    'Kara, Erin',
    'Lee, Eve',
    'Lesser, Michael',
    'Wizinowich, Peter',
    'Eisenhauer, Frank',
    'Aerts, Conny',
    'Christensen-Dalsgaard, Jørgen',
    'Ulrich, Roger',
    'Starck, Jean-Luc',
    'Czerny, Bożena',
    'Koppelman, Helmer',
    'Miret-Roig, Núria',
    'Obrzud, Ewelina',
    'van Dishoeck, Ewine',
    'Pović, Mirjana',
    'Encrenaz, Therese',
    'Quick, Lynnae',
    'Turtle, Elizabeth',
    'Showalter, Mark',
    'Solanki, Sami',
    'Kowalski, Adam',
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
    {
      label: 'newly ingested',
      syntax: 'entdate:[NOW-7DAYS TO NOW]',
      examples: [],
      tooltip: 'papers entered in the last week',
    },
    {
      label: 'eprint',
      syntax: 'property:"eprint_openaccess”',
      examples: [],
      tooltip: 'papers which are or have an eprint',
    },
  ];

  return searchExamples;
});
