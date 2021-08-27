define([
  'js/widgets/tabs/tabs_widget',
  'js/widgets/facet/factory',
  'js/widgets/facet/graph-facet/year_graph',
  'js/widgets/facet/graph-facet/h_index_graph',
  'js/mixins/formatter',
  'analytics',
], function(
  TabsWidget,
  FacetFactory,
  YearGraphView,
  HIndexGraph,
  FormatMixin,
  analytics
) {
  return function() {
    var yearGraphWidget = FacetFactory.makeGraphFacet({
      graphView: YearGraphView,
      facetField: 'year',
      defaultQueryArguments: {
        'facet.pivot': 'property,year',
        facet: 'true',
        'facet.minCount': '1',
        'facet.limit': '2000',
      },

      graphViewOptions: {
        yAxisTitle: 'article count',
        xAxisTitle: 'years',
        name: 'Years',
      },

      processResponse(apiResponse) {
        this.setCurrentQuery(apiResponse.getApiQuery());

        const noData = () => {
          this.model.set({ graphData: [] });
          // update widget state
          this.updateState(this.STATES.IDLE);
        };

        // check if we have enough data
        if (apiResponse.get('response.numFound') <= 1) {
          return noData();
        }

        const facetData = apiResponse.get(
          'facet_counts.facet_pivot.property,year'
        );

        const yearMap = new Map();
        // grab only the 2 property types we want (refereed and non-refereed)
        facetData.forEach(({ value, pivot }) => {
          if (['refereed', 'notrefereed'].includes(value)) {
            // loop through each pivot and add the years to our map
            pivot.forEach(({ value: yearString, count = 0 }) => {
              const year = parseInt(yearString, 10);
              yearMap.set(year, {
                refereed: 0,
                notrefereed: 0,
                ...yearMap.get(year),
                [value]: count,
              });
            });
          }
        });

        // get the year range (min and max) so we can fill in gaps
        const years = Array.from(yearMap.keys());
        const min = Math.min(...years);
        const max = Math.max(...years);

        // fill in all the years between min and max that don't have values
        const finalData = Array.from(
          { length: max - min + 1 },
          (_v, i) => min + i
        ).map((year) => {
          // if the year exists, then grab it, otherwise fill with an empty (x,y)
          if (yearMap.has(year)) {
            const { refereed, notrefereed } = yearMap.get(year);
            return {
              x: year,
              y: refereed + notrefereed,
              refCount: refereed,
            };
          }
          return { x: year, y: 0, refCount: 0 };
        });

        if (finalData.length <= 1) {
          return noData();
        }
        this.model.set({ graphData: finalData });

        // update widget state
        this.updateState(this.STATES.IDLE);
      },
    });

    var citationGraphWidget = FacetFactory.makeGraphFacet({
      graphView: HIndexGraph,
      facetField: 'citation_count',
      defaultQueryArguments: {
        'json.facet': `{"citation_count":{"type":"terms","field":"citation_count","sort":{"index":"desc"},"limit":2000}}`,
        stats: 'true',
        'stats.field': 'citation_count',
      },
      graphViewOptions: {
        yAxisTitle: 'citations',
        xAxisTitle: 'number of records',
        pastTenseTitle: 'cited',
        name: 'Citations',
      },
      processResponse: function(apiResponse) {
        this.setCurrentQuery(apiResponse.getApiQuery());

        const noData = () => {
          this.model.set({ graphData: [] });
          // update widget state
          this.updateState(this.STATES.IDLE);
        };

        // check if we have enough data
        if (apiResponse.get('response.numFound') <= 1) {
          return noData();
        }

        const counts = apiResponse.get('facets.citation_count.buckets');
        const maxDataPoints = 2000;

        // map counts into coordinates for graph
        const finalData = [];
        let xCounter = 0;
        counts.some((item) => {
          xCounter += item.count;
          // one dot per paper (this way we'll only plot the top ranked X - fraction of results)
          while (
            xCounter > finalData.length &&
            finalData.length < maxDataPoints
          ) {
            finalData.push({ y: item.val, x: finalData.length + 1 });
          }
          if (finalData.length > maxDataPoints) {
            return true;
          }
          return false;
        });

        const statsCount = apiResponse.toJSON().stats
          ? FormatMixin.formatNum(
              apiResponse.get('stats.stats_fields.citation_count.sum')
            )
          : 0;

        if (finalData.length <= 1) {
          return noData();
        }

        this.model.set({
          graphData: finalData,
          statsCount: statsCount,
          statsDescription: `${finalData.length} top ranked citations of`,
        });
      },
    });

    var readsGraphWidget = FacetFactory.makeGraphFacet({
      graphView: HIndexGraph,
      facetField: 'read_count',
      defaultQueryArguments: {
        'json.facet': `{"read_count":{"type":"terms","field":"read_count","sort":{"index":"desc"},"limit":2000}}`,
        stats: 'true',
        'stats.field': 'read_count',
      },
      graphViewOptions: {
        yAxisTitle: 'recent reads',
        xAxisTitle: 'number of records',
        pastTenseTitle: 'read',
        name: 'Reads',
      },
      processResponse: function(apiResponse) {
        this.setCurrentQuery(apiResponse.getApiQuery());

        const noData = () => {
          this.model.set({ graphData: [] });
          // update widget state
          this.updateState(this.STATES.IDLE);
        };

        // check if we have enough data
        if (apiResponse.get('response.numFound') <= 1) {
          return noData();
        }

        const counts = apiResponse.get('facets.read_count.buckets');
        const maxDataPoints = 2000;

        // map counts into coordinates for graph
        const finalData = [];
        let xCounter = 0;
        counts.some((item) => {
          xCounter += item.count;
          // one dot per paper (this way we'll only plot the top ranked X - fraction of results)
          while (
            xCounter > finalData.length &&
            finalData.length < maxDataPoints
          ) {
            finalData.push({ y: item.val, x: finalData.length + 1 });
          }
          if (finalData.length > maxDataPoints) {
            return true;
          }
          return false;
        });

        const statsCount = apiResponse.toJSON().stats
          ? FormatMixin.formatNum(
              apiResponse.get('stats.stats_fields.read_count.sum')
            )
          : 0;

        if (finalData.length <= 1) {
          return noData();
        }

        this.model.set({
          graphData: finalData,
          statsCount: statsCount,
          statsDescription: `${finalData.length} top ranked reads of`,
        });
      },
    });

    var tab = new TabsWidget({
      tabs: [
        {
          title: 'Years',
          widget: yearGraphWidget,
          id: 'year-facet',
          default: true,
        },
        {
          title: 'Citations',
          widget: citationGraphWidget,
          id: 'citations-facet',
          onActive: () => {
            analytics(
              'send',
              'event',
              'interaction',
              'graph-tab-active',
              'Citations'
            );
          },
        },
        {
          title: 'Reads',
          widget: readsGraphWidget,
          id: 'reads-facet',
          onActive: () => {
            analytics(
              'send',
              'event',
              'interaction',
              'graph-tab-active',
              'Reads'
            );
          },
        },
      ],
    });
    // for tests
    tab.yearGraphWidget = yearGraphWidget;
    tab.citationGraphWidget = citationGraphWidget;
    tab.readsGraphWidget = readsGraphWidget;

    return tab;
  };
});
