define([
  'js/components/api_response',
  'js/components/api_request',
  'js/components/api_query',
  'js/components/json_response',
  'js/widgets/facet/factory',
  'js/components/api_targets',
  'analytics'
], function (
  ApiResponse,
  ApiRequest,
  ApiQuery,
  JsonResponse,
  FacetFactory,
  ApiTargets,
  analytics
  ) {

  return function() {
    var widget = FacetFactory.makeHierarchicalCheckboxFacet({
      facetField: "simbad_object_facet_hier",
      facetTitle: "SIMBAD Objects",
      openByDefault: false,
      logicOptions: {single: ['limit to', 'exclude'], multiple: ["or", "exclude"]},
      responseProcessors: [
        function (v) {
          var vv = v.split('/');
          return vv[vv.length - 1]
        }
      ],
    });
	
	widget.extractFacets = function (apiResponse) {
		if (apiResponse instanceof ApiResponse){
            // We have data from the search endpoint
            // This will result in the facets with the SIMBAD identifiers
            // The top level facets are in a list of the form
			//    ["0/Galaxy", 1, "0/Other", 1, "0/Star", 1]
			// which can be left unchanged, while the next level is like
			//    ["1/Star/2343849", 1, "1/Star/2545427", 1, "1/Star/296788", 1]
			// which needs to be updated with (canonical) object names, instead
			// of the SIMBAD identifiers. This is done by sending e query
			//    {'facets':["1/Star/2343849", "1/Star/2545427", "1/Star/296788"]}
			// to the object service API end point. From the micro service response
			// we then build
			//    ["1/Star/HBC 650", 1, "1/Star/V* AM Her", 1, "1/Star/V* AK Sco", 1]
			// to be returned instead of the original facet.
			console.log("API response");
			console.log(apiResponse.toJSON());
	        var facets;
	        var query = apiResponse.getApiQuery();
	        var extractor = this.getExtractorChain();

	        if (extractor) {
	          facets = extractor(apiResponse);
	        }
	        else {
	          var fField = query.get('facet.field');

	          if (!fField) {
	            throw Error('The query contains no facet.field parameter!');
	          }
	          var facetPath = "facet_counts.facet_fields." + fField;
	          facets = apiResponse.get(facetPath);
	        }
			console.log("Original facets:");
			console.log(facets);
			// Create a list with just the facet strings
			var flist = facets.filter(function(v){return (typeof v === 'string');}).filter(function(v){return (v.charAt(0)==='1');});
            // For non-empty lists of facet strings, translate the SIMBAD ids
			// else return the (top level) facets
			if (flist.length > 0) {
				this.getSIMBADobjects(flist);
			}
			else {
				return facets
			}
		}
		else if (apiResponse instanceof JsonResponse) {
			// We have data from the micro service
			// This response has the form
			//   {"original facet":"translated facet", ...}
			// So, we want the values of this dictionary
			console.log("Micro service data");
			var final_facets = [];
			var values = Object.keys(apiResponse.attributes).map(function(key){
				final_facets.push(apiResponse.attributes[key]);
				final_facets.push(1);
				return final_facets
			});
            console.log(final_facets);
	        return final_facets;
		};
	};
    widget.getSIMBADobjects = function (fdata) {
    	console.log("Retrieving object names from micro service");
		console.log(fdata);
		// Send a request like
		//  {'facets':["1/Star/2343849", "1/Star/2545427", "1/Star/296788"]}
		// to the object service API endpoint
		var pubsub = this.getPubSub();
        var request =  new ApiRequest({
          target: ApiTargets.SERVICE_OBJECTS,
          query: new ApiQuery({"facets" : fdata}),
		  options : {
            type : "POST",
            contentType : "application/json"
		  }
        });
		// The callback is "extractFacets", defined above
		pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.extractFacets);
		pubsub.publish(pubsub.EXECUTE_REQUEST, request);
    };
    return widget;
  };

});