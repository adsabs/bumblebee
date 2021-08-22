define([
  'js/widgets/facet/factory',
  'js/components/api_response',
  'js/wraps/graph_tabs',
], function(FacetFactory, ApiResponse, GraphTabs) {
  var testJSON = {
    responseHeader: {
      status: 0,
      QTime: 2,
      params: {
        'json.facet':
          '{"read_count":{"type":"terms","field":"read_count","sort":{"index":"desc"},"limit":2000}}',
        q: 'author:"^accomazzi, a"',
        stats: 'true',
        fl: 'id',
        start: '0',
        sort: 'date desc,bibcode desc',
        rows: '10',
        wt: 'json',
        p_: '0',
        'stats.field': 'read_count',
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
      read_count: {
        buckets: [
          { val: 18, count: 1 },
          { val: 14, count: 1 },
          { val: 11, count: 1 },
          { val: 10, count: 1 },
          { val: 9, count: 1 },
          { val: 7, count: 1 },
          { val: 6, count: 1 },
          { val: 5, count: 4 },
          { val: 4, count: 2 },
          { val: 3, count: 1 },
          { val: 2, count: 3 },
          { val: 0, count: 31 },
        ],
      },
    },
    stats: {
      stats_fields: {
        read_count: {
          min: 0,
          max: 18,
          count: 48,
          missing: 0,
          sum: 112,
          sumOfSquares: 1060,
          mean: 2.3333333333333335,
          stddev: 4.122245480489783,
        },
      },
    },
  };
  describe('Graph for Reads Distribution in a List of Results', function() {
    var widget;

    beforeEach(function(done) {
      widget = GraphTabs().readsGraphWidget;
      widget.processResponse(new ApiResponse(testJSON));
      done();
    });

    it('should have a processResponse function that unspools a facet pivot query into a single, ordered array usable by d3', function(done) {
      var graphData = _.map(widget.model.attributes.graphData, _.values).join(
        ','
      );
      var expectedResults =
        '0,18,1,14,2,11,3,10,4,9,5,7,6,6,7,5,8,4,9,3,10,2,11,0';
      expect(graphData).to.eql(expectedResults);
      done();
    });
  });
});
