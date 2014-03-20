define(['backbone', 'marionette', 'hbs!./templates/facet-container', './facets-config', 'js/components/api_response', 'js/components/api_query', 'js/components/api_request', './facet-views/facet-item-view', './facet-views/facet-slider-view'],
    function(Backbone, Marionette, facetContainerTemplate, Config, ApiResponse, ApiQuery, ApiRequest, FacetItemView, FacetSliderView) {


        var FacetModel = Backbone.Model.extend({


            idAttribute: "solrFacet",

            //adding stuff that doesn't have to go into the config
            defaults: function() {
                return {
                    //update model if user selects a facet, so controller can be notified
                    facetsToApply: {},

                    //change of this triggers view re-render
                    currentFacetData: {}

                }
            },

            processData: function(data) {
                var responseData = data.response.get(this.get("solrFacet"));
                //changing solr formatted facets into a nicer form
                var responseData = (responseData instanceof Array ? this.listToDict(responseData) : responseData);
                this.set("currentFacetData", responseData);

            },

            processHierData: function(data) {
                var response = data.response;
                var subFacetId = data.subFacetId


                var data = response.get(this.get("solrFacet"))

                data = (data instanceof Array ? this.listToDict(data) : data);


                //right now, hierarchical facets are simply passed along
                //in an event chain and not set on the model (since there is no way to
                //do nested models in backbone that emit proper events)


                this.trigger("newHierFacetsReady", {
                    "toRender": data,
                    "subFacetId": subFacetId
                })

            },

            listToDict: function(l) {
                d = {}
                _.each(l, function(el, ind, list) {
                    if (ind % 2 === 0) {
                        d[el] = list[ind + 1]
                    }
                })
                return d
            },

            initialize: function() {

                //adding optional hierarchical collection
                if (this.get("hierarchy") === true) {
                    this.set("hierarchy", {}, {
                        silent: true
                    });
                };

                //closed views request data when someone opens them
                this.on("showHiddenFacets", this._ask_for_info)

                //processing updated data sent by controller
                this.on("facets:received", this.processData, this)
                this.on("hier-facets:received", this.processHierData, this);

            }

        });


        var FacetCollection = Backbone.Collection.extend({

            model: FacetModel,

            comparator: 'order',


        });

        var FacetListView = Marionette.CompositeView.extend({

            events: {
                'click #show-hidden-facets': "showHidden",
            },

            showHidden: function() {

                this.collection.trigger("showHidden")

                //show all views
                this.$("#more-facets").toggleClass("hide")

            },

            element: 'div',

            template: facetContainerTemplate,

            getItemView: function(model) {
                var t = model.get("facetType");
                if (t.type === "item") {
                    return FacetItemView
                } else if (t.type === "slider") {
                    return FacetSliderView
                }
            },

            appendHtml: function(colView, itemView, index) {
                if (itemView.model.get("defaultVisibility")) {
                    colView.$("#initially-visible").append(itemView.el);

                } else {
                    colView.$("#more-facets").append(itemView.el);

                }
            },

            initialize: function(){
            }

        });

        var FacetController = Marionette.Controller.extend({

            //a record of current queries, mapping url hash to model id
            queriesInProgress: {},

            activate: function(beehive) {

                this.pubsub = beehive.Services.get('PubSub');
                this.pubSubKey = this.pubsub.getPubSubKey();

                this.pubsub.subscribe(this.pubsub.INVITING_REQUEST, this.initialRequest);
                this.pubsub.subscribe(this.pubsub.DELIVERING_RESPONSE, this.deliverResponseToModel);

                //finally, get facet info necessary to display start-up view
                this.initialRequest();

            },

            //only need to get visible facets on query change

            initialRequest: function(apiQuery) {

                var requestInfo = this.collection.chain()
                    .filter(function(m) {
                        return m.get("defaultVisibility") === true
                    })
                    .each(function(m) {
                        this.compose_request(m.get("solrFacet"));
                    }, this);
            },

            compose_request: function(sf, solrParams, _event, additionalData) {
                if (typeof solrParams === "undefined" && sf.split(".")[0]==="facet_counts") {
                    solrParams = {
                        "query": new ApiQuery({
                            "q": this.currentQuery || "star",
                            "facet.field": sf.split(".")[sf.split(".").length-1]
                        })
                    };
                }

                else if (typeof solrParams === "undefined"){
                     solrParams = {
                        "query": new ApiQuery({
                            "q": this.currentQuery || "star"
                        })
                    };
                };

                if (typeof _event === "undefined") {
                    _event = "facets:received"
                };


                var apiRequest = new ApiRequest(solrParams);
                u = apiRequest.url();
                u = u.match(/\/\?(.*)/)[1];

                this.queriesInProgress[u] = {
                    "event": _event,
                    "id": sf,
                    "additionalData": additionalData
                };


                this.pubsub.publish(this.pubsub.DELIVERING_REQUEST, apiRequest)

                /*also publish a separate "facet selected" event here so that other
                modules can track the process of filtering the query
                
                this.pubsub.publish(this.pubSubKey, this.pubsub.FACET_SELECTED, sf)

                */

            },

            compose_hierarchical_request: function(model, toExpand) {
                var sf = model.get("solrFacet");
                var topLevelFacet = sf.split(".")[model.get("solrFacet").split(".").length-1];
                solrParams = {
                        "query": new ApiQuery({
                            "q": (this.currentQuery || "star")+ " and " + topLevelFacet + ":"+ toExpand,
                            "facet.field": model.get("solrFacet"),
                            "facet.prefix" : "1/" + toExpand,
                        })
                    };

                    console.log(solrParams["query"].url())

                this.compose_request(sf, solrParams, "hier-facets:received", {
                    subFacetId: toExpand
                });
            },

            get_hidden_facets: function() {

                var requestInfo = this.collection.chain()
                    .filter(function(m) {
                        return m.get("defaultVisibility") === false
                    })
                    .each(function(m) {
                        this.compose_request(m.get("solrFacet"));
                    }, this);
            },

            deliverResponseToModel: function(apiResponse) {

                var key = apiResponse.getApiQuery().url();
                var _event = this.queriesInProgress[key]["event"];
                var model_id = this.queriesInProgress[key]["id"];

                var additionalData = this.queriesInProgress[key]["additionalData"];
                var passData = {
                    "response": apiResponse
                }
                if (additionalData) {
                    _.extend(passData, additionalData);

                }

                this.collection.get(model_id).trigger(_event, passData);

                //finally, remove entry from queriesInProgress
                delete this.queriesInProgress[key];

            },

            updateQuery: function(model) {

                var facets_dict = model.get("facetsToApply");
                var logic = facets_dict["logic"];
                var selected = facets_dict["selected"];

                var query = new ApiQuery();

                this.pubsub.publish(this.pubsub.NEW_QUERY, query);

            },

            initialize: function() {

                this.collection = new FacetCollection(Config);

                this.view = new FacetListView({
                    collection: this.collection,
                });

                /*three events on the model that the controller cares about:
                    -request for hierarchical data
                    -change of query 
                    -request for data from formerly hidden facets

                    however the controller is listening to the collection instead of each model

                    this works because events triggered on models bubble up through the collection
                */
                this.listenTo(this.collection, "change:facetsToApply", this._update_query);
                //hierarchical data
                this.listenTo(this.collection, "hierarchyRequest", this.compose_hierarchical_request)
                //user toggled "more" button
                this.listenTo(this.collection, "showHidden", this.get_hidden_facets)

                //figure out a way to get this easily on instantiation

                this.currentQuery = undefined;

                _.bindAll(this, "deliverResponseToModel", "initialRequest");

            },

            returnView: function() {
                return this.view
            }

        })

        return FacetController

    })
