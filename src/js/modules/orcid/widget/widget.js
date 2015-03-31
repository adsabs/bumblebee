/**
 * Widget to display list of result hits - it allows to paginate through them
 * and display details
 *
 */

define([
    'underscore',
    'js/widgets/list_of_things/widget',
    'js/widgets/base/base_widget',
    'js/mixins/add_stable_index_to_collection',
    'js/mixins/link_generator_mixin',
    'js/mixins/formatter',
    'hbs!./templates/container-template',
    'js/mixins/papers_utils',
    'js/components/api_query',
    'js/components/json_response',
    'hbs!./templates/empty-template',
    'js/modules/orcid/extension'
  ],

  function (
    _,
    ListOfThingsWidget,
    BaseWidget,
    PaginationMixin,
    LinkGenerator,
    Formatter,
    ContainerTemplate,
    PapersUtilsMixin,
    ApiQuery,
    JsonResponse,
    EmptyViewTemplate,
    OrcidExtension
    ) {

    var ResultsWidget = ListOfThingsWidget.extend({
      initialize : function(options){
        ListOfThingsWidget.prototype.initialize.apply(this, arguments);

        //now adjusting the List Model
        this.view.getEmptyView = function () {
          return Marionette.ItemView.extend({
            template: EmptyViewTemplate
          });
        };

        this.view.template = ContainerTemplate;
        this.view.model.set({"mainResults": true}, {silent : true});
        this.listenTo(this.collection, "reset", this.checkDetails);
      },


      activate: function (beehive) {
        this.pubsub = beehive.Services.get('PubSub');
        this.setBeeHive(beehive);

        _.bindAll(this, 'processResponse');
        this.on('orcidAction:delete', function(model) {
          this.collection.remove(model);
        });
      },



      processDocs: function(jsonResponse, docs) {
        var start = 0;
        var docs = PaginationMixin.addPaginationToDocs(docs, start);
        _.each(docs, function(d,i){
          docs[i] = PapersUtilsMixin.prepareDocForViewing(d);
        });
        return docs;
      },

      getPaginationInfo: function(jsonResponse, docs) {

        // this information is important for calcullation of pages
        var numFound = docs.length;
        var perPage =  this.model.get('perPage') || 10;
        var start = 0;

        // compute the page number of this request
        var page = PaginationMixin.getPageVal(start, perPage);

        // compute which documents should be made visible
        var showRange = [page*perPage, ((page+1)*perPage)-1];

        // compute paginations (to be inserted into navigation)
        var numAround = this.model.get('numAround') || 2;
        var pageData = this._getPageDataDatastruct(jsonResponse.getApiQuery() || new ApiQuery({'orcid': 'author X'}),
          page, numAround, perPage, numFound);

        //should we show a "back to first page" button?
        var showFirst = (_.pluck(pageData, "p").indexOf(1) !== -1) ? false : true;

        return {
          numFound: numFound,
          perPage: perPage,
          start: start,
          page: page,
          showRange: showRange,
          pageData: pageData,
          currentQuery: jsonResponse.getApiQuery() || new ApiQuery({'orcid': 'author X'})
        }
      },

      onShow: function() {
        var oApi = this.getBeeHive().getService('OrcidApi');
        var self = this;
        if (oApi) {

          if (!oApi.hasAccess())
            return;

          oApi.getOrcidProfileInAdsFormat()
          .done(function(data) {
            var response = new JsonResponse(data);
            response.setApiQuery(new ApiQuery(response.get('responseHeader.params')));
            self.processResponse(response);
          });
            //get username
            var that = this;
            oApi.getUserProfile().done(function(info){
              var firstName = info["orcid-bio"]["personal-details"]["given-names"]["value"];
              var lastName = info["orcid-bio"]["personal-details"]["family-name"]["value"];
              that.model.set("orcidUserName", firstName + " " + lastName);
            })
          }
        }
    });
    return OrcidExtension(ResultsWidget);

  });
