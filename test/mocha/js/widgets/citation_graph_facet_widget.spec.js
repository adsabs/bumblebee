define(["js/widgets/facet/factory",
    'js/components/api_response',
    'js/wraps/graph_tabs'
  ],
  function(FacetFactory, ApiResponse, GraphTabs) {

    var testJSON = {
      "responseHeader": {
        "status": 0,
        "QTime": 7,
        "params": {
          "facet": "true",
          "fl": "id",
          "indent": "true",
          "q": "author:^accomazzi,a",
          "wt": "json",
          "facet.pivot": "property,citation_count"
        }
      },
      "response": {
        "numFound": 34,
        "start": 0,
        "docs": [
          {
            "id": "4582438"
          },
          {
            "id": "4545442"
          },
          {
            "id": "4545606"
          },
          {
            "id": "9067423"
          },
          {
            "id": "8285512"
          },
          {
            "id": "8700936"
          },
          {
            "id": "3843891"
          },
          {
            "id": "3404318"
          },
          {
            "id": "3340879"
          },
          {
            "id": "3513629"
          }
        ]
      },
      "facet_counts": {
        "facet_queries": {},
        "facet_fields": {},
        "facet_dates": {},
        "facet_ranges": {},
        "facet_pivot": {
          "property,citation_count": [
            {
              "field": "property",
              "value": "notrefereed",
              "count": 29,
              "pivot": [
                {
                  "field": "citation_count",
                  "value": 0,
                  "count": 7
                },
                {
                  "field": "citation_count",
                  "value": 1,
                  "count": 3
                },
                {
                  "field": "citation_count",
                  "value": 2,
                  "count": 3
                },
                {
                  "field": "citation_count",
                  "value": 3,
                  "count": 3
                },
                {
                  "field": "citation_count",
                  "value": 6,
                  "count": 3
                },
                {
                  "field": "citation_count",
                  "value": 4,
                  "count": 1
                }
              ]
            },

            {
              "field": "property",
              "value": "refereed",
              "count": 5,
              "pivot": [
                {
                  "field": "citation_count",
                  "value": 0,
                  "count": 3
                },
                {
                  "field": "citation_count",
                  "value": 1,
                  "count": 1
                },
                {
                  "field": "citation_count",
                  "value": 20,
                  "count": 1
                }
              ]
            }

          ]
        }
      }
    };

    describe("Graph for Citation Distribution in a List of Results", function() {

      var widget;

      beforeEach(function() {

        widget = GraphTabs().citationGraphWidget;
        widget.processResponse(new ApiResponse(testJSON));

      });

      it("should have a processResponse function that unspools a facet pivot query into a single, ordered array usable by d3", function(done) {
        var graphData = _.map(widget.model.attributes.graphData, _.values).join(',');
        //where y is # citations
        var expectedResults = 'true,1,20,false,2,6,false,3,6,false,4,6,false,5,4,false,6,3,false,7,3,false,8,3,false,9,2,false,10,2,false,11,2,true,12,1,false,13,1,false,14,1,false,15,1,true,16,0,true,17,0,true,18,0,false,19,0,false,20,0,false,21,0,false,22,0,false,23,0,false,24,0,false,25,0';
        expect(graphData).to.eql(expectedResults);
        done();
      });
    });
  });
