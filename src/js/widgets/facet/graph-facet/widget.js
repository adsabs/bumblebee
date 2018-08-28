define([
  'underscore',
  'js/components/api_query',
  'js/components/api_request',
  'js/widgets/base/base_widget',
  'js/components/api_query_updater'
],
function (
  _,
  ApiQuery,
  ApiRequest,
  BaseWidget,
  ApiQueryUpdater
) {
  var BaseFacetWidget = BaseWidget.extend({

    initialize: function (options) {
      options = options || {};
      this.processResponse = options.processResponse;
      this.model = new Backbone.Model();
      this.view = new options.graphView(_.extend(
        options.graphViewOptions,
        { model: this.model }
      ));
      this.isActive = false;
      this.isDone = false;

      this.listenTo(this.view, 'all', this.onAllInternalEvents);
      this.facetField = options.facetField;
      this.queryUpdater = new ApiQueryUpdater(this.facetField);
      BaseWidget.prototype.initialize.apply(this, arguments);
      this.listenTo(this.view, 'facet-applied', this.handleConditionApplied);
      this.on('active', this.onActive);
      this.on('hidden', this.onHidden);

      this.dispatchRequest = _.debounce(_.bind(this.dispatchRequest, this), 300);
    },

    activate: function (beehive) {
      var self = this;
      this.setBeeHive(beehive);
      _.bindAll(this, 'dispatchRequest', 'processResponse');
      // custom dispatchRequest function goes here
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.INVITING_REQUEST, function (apiQuery) {
        self.isDone = false;
        self.setCurrentQuery.call(self, apiQuery);
        self.dispatchRequest.call(self, apiQuery);
      });
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      this.activateWidget();
      this.attachGeneralHandler(this.onFeedback);
    },

    dispatchRequest: function (apiQuery) {
      if (this.isActive && !this.isDone && apiQuery.has('q')) {
        // reset the graph
        this.model.unset('graphData');
        this.model.unset('statsCount');
        var q = this.customizeQuery(apiQuery);
        var req = this.composeRequest(q);
        var pubsub = this.getPubSub();
        pubsub.publish(pubsub.DELIVERING_REQUEST, req);
        this.isDone = true;
      }
    },

    handleConditionApplied: function (val) {
      var q = this.getCurrentQuery();
      val = this.facetField + ':' + val;
      q = q.clone();
      var fieldName = 'q';
      this.queryUpdater.updateQuery(q, fieldName, 'limit', val);
      this.dispatchNewQuery(q);
    },

    onActive: function () {
      if (!this.isActive && this.isDone && this.model.get('error')) {
        this.isDone = false;
        this.model.set('error', false);
      }
      this.isActive = true;
      this.dispatchRequest(this.getCurrentQuery());
    },

    onHidden: function () {
      this.isActive = false;
    },

    onFeedback: function (apiFeedback) {
      this.model.set('error', true);
    }
  });

  return BaseFacetWidget;
});
