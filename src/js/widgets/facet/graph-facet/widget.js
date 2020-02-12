define([
  'underscore',
  'utils',
  'js/widgets/base/base_widget',
  'js/components/api_query_updater',
], function(_, utils, BaseWidget, ApiQueryUpdater) {
  var BaseFacetWidget = BaseWidget.extend({
    initialize: function(options) {
      options = options || {};
      this.processResponse = options.processResponse;
      this.model = new Backbone.Model();
      this.view = new options.graphView(
        _.extend(options.graphViewOptions, { model: this.model })
      );
      this.isActive = false;
      this.isDone = false;

      this.listenTo(this.view, 'all', this.onAllInternalEvents);
      this.facetField = options.facetField;
      this.queryUpdater = new ApiQueryUpdater(this.facetField);
      BaseWidget.prototype.initialize.apply(this, arguments);
      this.listenTo(this.view, 'facet-applied', this.handleConditionApplied);
      this.on('active', this.onActive);
      this.on('hidden', this.onHidden);

      this.dispatchRequest = _.debounce(
        _.bind(this.dispatchRequest, this),
        300
      );
    },

    activate: function(beehive) {
      var self = this;
      this.setBeeHive(beehive);
      _.bindAll(
        this,
        'dispatchRequest',
        'processResponse',
        'onInvitingRequest'
      );
      // custom dispatchRequest function goes here
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.INVITING_REQUEST, this.onInvitingRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      this.activateWidget();
      this.attachGeneralHandler(this.onFeedback);
    },

    onInvitingRequest: function(apiQuery) {
      if (this._sortChanged.call(this, apiQuery)) {
        return;
      }
      this.isDone = false;
      this.setCurrentQuery(apiQuery);
      this.dispatchRequest(apiQuery);
      this.updateState(this.STATES.LOADING);
    },

    _sortChanged: function(apiQuery) {
      try {
        var diff = utils.difference(
          apiQuery.toJSON(),
          this.getCurrentQuery().toJSON()
        );
      } catch (e) {
        // continue
      }

      // make sure only 1 key on object, and that key is "sort"
      return diff && diff.sort && _.keys(diff).length === 1;
    },

    dispatchRequest: function(apiQuery) {
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

    removeAnyOldConditions: function(query, fieldName) {
      var q = query.clone();
      var oldField = q.get('__' + this.facetField + '_' + fieldName);

      // check for field on current query
      if (oldField && oldField.length > 0) {
        // grab the last value and check to make sure it is actually in the query string
        var oldVal = _.last(oldField);
        if (q.get(fieldName)[0].indexOf(oldVal) > -1) {
          this.queryUpdater.updateQuery(q, fieldName, 'remove', oldVal);
        }
      }
      return q;
    },

    handleConditionApplied: function(val) {
      var fieldName = 'q';
      var q = this.getCurrentQuery();
      q.set(
        'q',
        /^\(.*\)/.test(q.get('q')[0])
          ? q.get('q')[0]
          : '(' + q.get('q')[0] + ')'
      );
      val = this.facetField + ':' + val;
      q = q.clone();
      q = this.removeAnyOldConditions(q, fieldName);
      this.queryUpdater.updateQuery(q, fieldName, 'limit', val);
      // q.set('q', q.get('q')[0].replace(/^\((.*)\)$/, '$1'));
      this.dispatchNewQuery(q);
    },

    onActive: function() {
      if (!this.isActive && this.isDone && this.model.get('error')) {
        this.isDone = false;
        this.model.set('error', false);
      }
      this.isActive = true;
      this.dispatchRequest(this.getCurrentQuery());
    },

    onHidden: function() {
      this.isActive = false;
    },

    onFeedback: function() {
      this.model.set('error', true);
      this.updateState(this.STATES.ERRORED);
    },
  });

  return BaseFacetWidget;
});
