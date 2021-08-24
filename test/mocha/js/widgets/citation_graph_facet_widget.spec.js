define([
  'js/widgets/facet/factory',
  'js/components/api_response',
  'js/wraps/graph_tabs',
], function(FacetFactory, ApiResponse, GraphTabs) {
  const testJSON = {
    responseHeader: {
      status: 0,
      QTime: 2,
      params: {
        'json.facet':
          '{"citation_count":{"type":"terms","field":"citation_count","sort":{"index":"desc"},"limit":2000}}',
        q: 'author:"^accomazzi, a"',
        stats: 'true',
        fl: 'id',
        start: '0',
        sort: 'date desc,bibcode desc',
        rows: '10',
        wt: 'json',
        p_: '0',
        'stats.field': 'citation_count',
      },
    },
    response: {
      numFound: 48,
      start: 0,
      docs: [
        { id: '20302549' },
        { id: '18677923' },
        { id: '17584600' },
        { id: '15583916' },
        { id: '17796736' },
        { id: '15198148' },
        { id: '14998905' },
        { id: '13986258' },
        { id: '13985717' },
        { id: '15278338' },
      ],
    },
    facets: {
      count: 48,
      citation_count: {
        buckets: [
          { val: 23, count: 1 },
          { val: 8, count: 1 },
          { val: 6, count: 4 },
          { val: 5, count: 1 },
          { val: 4, count: 3 },
          { val: 3, count: 4 },
          { val: 2, count: 3 },
          { val: 1, count: 4 },
          { val: 0, count: 27 },
        ],
      },
    },
    stats: {
      stats_fields: {
        citation_count: {
          min: 0,
          max: 23,
          count: 48,
          missing: 0,
          sum: 94,
          sumOfSquares: 862,
          mean: 1.9583333333333333,
          stddev: 3.7978624073613076,
        },
      },
    },
  };
  describe('Graph for Citation Distribution in a List of Results', function() {
    var widget;

    beforeEach(function() {
      widget = GraphTabs().citationGraphWidget;
      widget.processResponse(new ApiResponse(testJSON));
    });

    it('should have a processResponse function that unspools a facet pivot query into a single, ordered array usable by d3', function(done) {
      var graphData = _.map(widget.model.attributes.graphData, _.values).join(
        ','
      );
      // where y is # citations
      var expectedResults = '0,23,1,8,2,6,3,5,4,4,5,3,6,2,7,1,8,0';
      expect(graphData).to.eql(expectedResults);
      done();
    });
  });
});
