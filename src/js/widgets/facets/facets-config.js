  define([], function() {

      var config = [{
              facet: "Authors",
              solrFacet: "facet_counts.facet_fields.author_facet_hier",
              hierarchy: true,
              defaultVisibility: true,
              order: 1,
              initialItems: 5,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['and', 'or', 'exclude'],
              textPreprocess: ["removeSlash", "titleCase"],
              facetType: {
                  type: "item"
              }
          }, {
              facet: "Database",
              solrFacet: "facet_counts.facet_fields.database",
              defaultVisibility: true,
              hierarchy: undefined,
              order: 2,
              initialItems: undefined,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['and', 'or', 'exclude'],
              textPreprocess: ["titleCase"],
              facetType: {
                  type: "item"
              }

          // }, {
          //     facet: "Year",
          //     solrFacet: "facet_counts.facet_fields.year",
          //     defaultVisibility: true,
          //     hierarchy: undefined,
          //     order: 3,
          //     facetType: {
          //         type: "slider",
          //         graph: true
          //     }
          }, {
              facet: "topN",
              solrFacet: "response.numFound",
              defaultVisibility: false,
              hierarchy: undefined,
              order: 4,
              facetType: {
                  type: "slider",
                  graph: false
              }
          }, {
              facet: "Publication",
              solrFacet: "facet_counts.facet_fields.bibstem",
              defaultVisibility: false,
              hierarchy: undefined,
              order: 5,
              initialItems: 5,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['or', 'exclude'],
              textPreprocess: ["allCaps"],
              facetType: {
                  type: "item"
              }
          },
           // {
          //     facet: "Refereed Status",
          //     solrFacet: "facet_counts.facet_fields.refereed",
          //     defaultVisibility: false,
          //     hierarchy: undefined,
          //     order: 6,
          //     initialItems: undefined,
          //     singleLogic: ['limit to', 'exclude'],
          //     manyLogic: ['or', 'exclude'],
          //     textPreprocess: [],
          //     facetType: {
          //         type: "item"
          //     }
          // },
           {
              facet: "Keywords",
              solrFacet: "facet_counts.facet_fields.keyword",
              defaultVisibility: false,
              hierarchy: undefined,
              order: 7,
              initialItems: 5,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['or', 'exclude', 'and'],
              textPreprocess: [],
              facetType: {
                  type: "item"
              }
          }, {
              facet: "Grants",
              solrFacet: "facet_counts.facet_fields.grant_facet_hier",
              defaultVisibility: false,
              hierarchy: true,
              order: 8,
              initialItems: 5,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['or', 'exclude', 'and'],
              textPreprocess: ["removeSlash","allCaps"],
              facetType: {
                  type: "item"
              }
          }, {
              facet: "Bib Groups",
              solrFacet: "facet_counts.facet_fields.bibgroup",
              defaultVisibility: false,
              hierarchy: undefined,
              order: 9,
              initialItems: 5,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['or', 'exclude', 'and'],
              textPreprocess: ["allCaps"],
              facetType: {
                  type: "item"
              }
          }, {
              facet: "Data",
              solrFacet: "facet_counts.facet_fields.data",
              defaultVisibility: false,
              hierarchy: undefined,
              order: 10,
              initialItems: 5,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['or', 'exclude', 'and'],
              textPreprocess: ["allCaps"],
              facetType: {
                  type: "item"
              }
          }, {
              facet: "Vizier Tables",
              solrFacet: "facet_counts.facet_fields.vizier",
              defaultVisibility: false,
              hierarchy: undefined,
              order: 10,
              initialItems: 5,
              singleLogic: ['limit to', 'exclude'],
              manyLogic: ['or', 'exclude', 'and'],
              textPreprocess: ["allCaps"],
              facetType: {
                  type: "item"
              }
          },

      ];

      return config

  })
