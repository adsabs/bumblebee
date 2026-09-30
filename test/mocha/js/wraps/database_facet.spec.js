define(['underscore', 'js/components/api_query', 'js/widgets/facet/actions', 'js/wraps/database_facet'], function(
  _,
  ApiQuery,
  Actions,
  DatabaseFacet
) {
  describe('Database (Collections) Facet (database_facet.spec.js)', function() {
    var makeResponse = function(facetFields, facetLimit) {
      return {
        responseHeader: {
          status: 0,
          QTime: 4,
          params: {
            'facet.limit': facetLimit || '20',
            q: 'star',
            'facet.field': 'database',
            'facet.offset': '0',
            'facet.mincount': '1',
            facet: 'true',
            wt: 'json',
          },
        },
        response: { numFound: 10, start: 0, docs: [] },
        facet_counts: {
          facet_queries: {},
          facet_fields: { database: facetFields },
          facet_dates: {},
          facet_ranges: {},
        },
      };
    };

    var fullFacetFields = [
      'astronomy',
      5000,
      'astrophysics',
      4800,
      'physics',
      1200,
      'planetary',
      900,
      'heliophysics',
      700,
      'general',
      300,
      'earthscience',
      100,
    ];

    var getPreprocessors = function(widget) {
      var preprocessors = widget.store.getState().config.preprocessors;
      return _.isFunction(preprocessors) ? [preprocessors] : preprocessors;
    };

    var runPreprocessors = function(widget, facetList) {
      return _.reduce(
        getPreprocessors(widget),
        function(list, fn) {
          return fn(list);
        },
        facetList
      );
    };

    it('shows only the classic ADS collections', function() {
      var widget = DatabaseFacet();
      widget.store.dispatch(Actions().data_received(makeResponse(fullFacetFields)));

      expect(widget.store.getState().children).to.eql(['astronomy', 'physics', 'general']);
    });

    it('drops SciX collections from the rendered facet list', function() {
      var widget = DatabaseFacet();
      widget.store.dispatch(Actions().data_received(makeResponse(fullFacetFields)));

      var state = widget.store.getState();
      _.each(['astrophysics', 'planetary', 'heliophysics', 'earthscience'], function(value) {
        expect(state.facets[value]).to.equal(undefined);
      });
    });

    it('preserves the counts of the collections it keeps', function() {
      var widget = DatabaseFacet();
      widget.store.dispatch(Actions().data_received(makeResponse(fullFacetFields)));

      var facets = widget.store.getState().facets;
      expect(facets.astronomy.count).to.eql(5000);
      expect(facets.physics.count).to.eql(1200);
      expect(facets.general.count).to.eql(300);
    });

    it('is an allowlist, so an unknown collection is not shown', function() {
      var widget = DatabaseFacet();
      var filtered = runPreprocessors(widget, [
        { value: 'astronomy', name: 'astronomy', count: 1 },
        { value: 'brand_new_scix_collection', name: 'brand_new_scix_collection', count: 1 },
      ]);

      expect(_.pluck(filtered, 'value')).to.eql(['astronomy']);
    });

    it('handles an empty facet list', function() {
      var widget = DatabaseFacet();
      expect(runPreprocessors(widget, [])).to.eql([]);
    });

    it('marks pagination finished so the "more" button stays hidden', function() {
      var widget = DatabaseFacet();
      widget.store.dispatch(Actions().data_received(makeResponse(fullFacetFields, '20')));

      expect(widget.store.getState().pagination.finished).to.eql(true);
    });

    it('leaves a filter on a hidden collection untouched in the outgoing query', function() {
      var widget = DatabaseFacet();
      var query = new ApiQuery({
        q: 'star',
        fq: ['{!type=aqp v=$fq_database}'],
        fq_database: ['(database:astrophysics OR database:planetary)'],
      });

      widget.store.dispatch(Actions().data_received(makeResponse(fullFacetFields)));
      var outgoing = widget.customizeQuery(query);

      expect(outgoing.get('fq')).to.eql(['{!type=aqp v=$fq_database}']);
      expect(outgoing.get('fq_database')).to.eql(['(database:astrophysics OR database:planetary)']);
      expect(outgoing.get('q')).to.eql(['star']);
    });

    it('computes pagination.finished from the raw bucket count, not the filtered list', function() {
      var widget = DatabaseFacet();
      var fullPage = [];
      _.times(20, function(i) {
        fullPage.push(i === 0 ? 'astronomy' : 'scix_collection_' + i, 100 - i);
      });

      widget.store.dispatch(Actions().data_received(makeResponse(fullPage, '20')));

      var state = widget.store.getState();
      expect(state.children).to.eql(['astronomy']);
      expect(state.pagination.finished).to.eql(false);
    });
  });
});
