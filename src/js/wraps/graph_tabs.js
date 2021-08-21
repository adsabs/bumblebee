define([
  'js/widgets/tabs/tabs_widget',
  'js/widgets/facet/factory',
  'js/widgets/facet/graph-facet/year_graph',
  'js/widgets/facet/graph-facet/h_index_graph',
  'js/mixins/formatter',
], function(TabsWidget, FacetFactory, YearGraphView, HIndexGraph, FormatMixin) {
  return function() {
    var yearGraphWidget = FacetFactory.makeGraphFacet({
      graphView: YearGraphView,
      facetField: 'year',
      defaultQueryArguments: {
        'facet.pivot': 'property,year',
        facet: 'true',
        'facet.minCount': '1',
        'facet.limit': '-1',
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

        const facetData =
          apiResponse.get('facet_counts.facet_pivot.property,year') || [];

        const yearMap = new Map();
        // grab only the 2 property types we want (refereed and non-refereed)
        facetData.forEach(({ value, pivot }) => {
          if (['refereed', 'notrefereed'].includes(value)) {
            // loop through each pivot and add the years to our map
            pivot.forEach(({ value: yearString, count = 0 }) => {
              const year = parseInt(yearString, 10);
              yearMap.set(year, {
                year,
                refereed: 0,
                notrefereed: 0,
                [value]: count,
              });
            });
          }
        });

        const years = Array.from(yearMap.keys());
        const min = years[0];
        const max = years[years.length - 1];

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
        'facet.pivot': 'property,citation_count',
        facet: 'true',
        'facet.limit': '-1',
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

        var data = apiResponse.get(
          'facet_counts.facet_pivot.property,citation_count'
        );

        if (apiResponse.get('response.numFound') < 2) {
          this.model.set({ graphData: [] });
          return;
        }

        var refData = _.findWhere(data, { value: 'refereed' });
        if (refData) {
          refData = refData.pivot;
        }

        var nonRefData = _.findWhere(data, { value: 'notrefereed' });

        if (nonRefData) {
          nonRefData = nonRefData.pivot;
        }

        var finalData = [];

        _.each(refData, function(d) {
          var val = d.value;
          var count = d.count;
          _.each(_.range(count), function() {
            finalData.push({ refereed: true, x: undefined, y: val });
          });
        });

        _.each(nonRefData, function(d) {
          var val = d.value;
          var count = d.count;
          _.each(_.range(count), function() {
            finalData.push({ refereed: false, x: undefined, y: val });
          });
        });

        if (finalData.length < 2) {
          this.model.set({ graphData: [] });
          return;
        }

        finalData = finalData.sort(function(a, b) {
          return b.y - a.y;
        });

        // a cut off of 2000
        finalData = _.first(finalData, 2000);
        finalData = _.map(finalData, function(d, i) {
          d.x = i + 1;
          return d;
        });

        var statsCount;
        if (apiResponse.toJSON().stats) {
          statsCount = FormatMixin.formatNum(
            apiResponse.get('stats.stats_fields.citation_count.sum')
          );
        }

        this.model.set({
          graphData: finalData,
          statsCount: statsCount,
          statsDescription: 'total number of citations',
        });
      },
    });

    var readsGraphWidget = FacetFactory.makeGraphFacet({
      graphView: HIndexGraph,
      facetField: 'read_count',
      defaultQueryArguments: {
        'facet.pivot': 'property,read_count',
        facet: 'true',
        'facet.limit': '-1',
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

        var data = apiResponse.get(
          'facet_counts.facet_pivot.property,read_count'
        );

        if (apiResponse.get('response.numFound') < 2) {
          this.model.set({ graphData: [] });
          return;
        }

        var refData = _.findWhere(data, { value: 'refereed' });

        if (refData) {
          refData = refData.pivot;
        }

        var nonRefData = _.findWhere(data, { value: 'notrefereed' });

        if (nonRefData) {
          nonRefData = nonRefData.pivot;
        }

        var finalData = [];

        _.each(refData, function(d) {
          var val = d.value;
          var count = d.count;
          _.each(_.range(count), function() {
            finalData.push({ refereed: true, x: undefined, y: val });
          });
        });

        _.each(nonRefData, function(d) {
          var val = d.value;
          var count = d.count;
          _.each(_.range(count), function() {
            finalData.push({ refereed: false, x: undefined, y: val });
          });
        });

        if (finalData.length < 2) {
          this.model.set({ graphData: [] });
          return;
        }

        finalData = finalData.sort(function(a, b) {
          return b.y - a.y;
        });

        // a cut off of 2000
        finalData = _.first(finalData, 2000);

        finalData = _.map(finalData, function(d, i) {
          d.x = i + 1;
          return d;
        });

        var statsCount;
        if (apiResponse.toJSON().stats) {
          var statsCount = FormatMixin.formatNum(
            apiResponse.get('stats.stats_fields.read_count.sum')
          );
        }

        this.model.set({
          graphData: finalData,
          statsCount: statsCount,
          statsDescription: 'total recent (90 day) reads',
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
        },
        { title: 'Reads', widget: readsGraphWidget, id: 'reads-facet' },
      ],
    });
    // for tests
    tab.yearGraphWidget = yearGraphWidget;
    tab.citationGraphWidget = citationGraphWidget;
    tab.readsGraphWidget = readsGraphWidget;

    return tab;
  };
});
