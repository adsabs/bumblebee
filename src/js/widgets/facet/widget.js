define([
  'backbone',
  'js/components/api_query',
  'js/components/api_request',
  'js/widgets/base/base_widget',
  'js/components/api_query_updater',
  'analytics',
  'react',
  'react-dom',
  'react-redux',
  'es6!./facet-container.jsx',
  './actions',
  './reducers',
  './create_store',
  'utils',
], function(
  Backbone,
  ApiQuery,
  ApiRequest,
  BaseWidget,
  ApiQueryUpdater,
  analytics,
  React,
  ReactDOM,
  ReactRedux,
  ContainerComponent,
  createActionObject,
  Reducers,
  createStore,
  utils
) {
  var FacetContainerView = Backbone.View.extend({
    render: function(store, actions) {
      ReactDOM.render(
        React.createElement(
          ReactRedux.Provider,
          {
            store: store,
          },
          React.createElement(ContainerComponent, {
            actions: actions,
          })
        ),
        this.el
      );
      return this;
    },

    destroy: function() {
      ReactDOM.unmountComponentAtNode(this.el);
    },
  });

  var BaseFacetWidget = BaseWidget.extend({
    initialize: function(options) {
      options = options || {};

      var config = _.pick(options, [
        'facetTitle',
        'facetField',
        'preprocessors',
        'hierMaxLevels',
        'logicOptions',
        'openByDefault',
      ]);

      // will be used by dispatchRequest
      this.defaultQueryArguments = _.extend(
        {},
        this.defaultQueryArguments,
        options.defaultQueryArguments,
        {
          'facet.field': options.facetField,
        }
      );

      this.store = createStore(config);
      this.actions = createActionObject();
      this.queryUpdater = new ApiQueryUpdater(config.facetField);

      // a hack so the this.actions object has a reference to _dispatchRequest
      this.actions.fetch_data = function(id) {
        return this._dispatchRequest.bind(this, id);
      }.bind(this);

      this.actions.submit_filter = function(logicOption) {
        return this.submitFilter.bind(this, logicOption);
      }.bind(this);

      this.view = new FacetContainerView();
      this.view.render = _.partial(this.view.render, this.store, this.actions);
      if (!options.debug) {
        this._dispatchRequest = _.debounce(
          _.bind(this._dispatchRequest, this),
          300
        );
      }
    },

    // facetField is added in initialize function
    defaultQueryArguments: {
      facet: 'true',
      'facet.mincount': '1',
      'facet.limit': 20,
      fl: 'id',
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      _.bindAll(this, 'dispatchRequest', 'processResponse');
      this.getPubSub().subscribe(
        this.getPubSub().INVITING_REQUEST,
        this.dispatchRequest
      );
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);
      if (window.store) {
        window.store.push(this.store);
      } else {
        window.store = [this.store];
      }
    },

    onApiFeedback: function() {
      var dispatch = this.store.dispatch;
      setTimeout(function() {
        dispatch({
          type: 'FACET_TOGGLED',
          open: false,
        });
      }, 300);
      this.updateState(this.STATES.ERRORED);
    },

    /*
        request is only dispatched automatically if the facet is open by default!
       */
    dispatchRequest: function(apiQuery) {
      if (this._sortChanged(apiQuery)) {
        return;
      }
      this.setCurrentQuery(apiQuery);
      this.store.dispatch(this.actions.reset_state());
      if (this.store.getState().config.openByDefault) {
        // this will also call _dispatchRequest since there is no data
        this.store.dispatch(this.actions.toggle_facet(undefined, true));
      }
    },

    _sortChanged: function(apiQuery) {
      try {
        // get the difference between the queries
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

    customizeQuery(apiQuery) {
      this.defaultQueryArguments = {
        ...this.defaultQueryArguments,
        tag: `results/facet/${this.store.getState().config.facetField}`,
      };
      return BaseWidget.prototype.customizeQuery.call(this, apiQuery);
    },

    _dispatchRequest: function(id) {
      var pubsub = this.getPubSub();
      var that = this;
      var currentQuery = this.getCurrentQuery();
      this.store.dispatch(this.actions.data_requested(id));
      pubsub.subscribeOnce(pubsub.DELIVERING_RESPONSE, function(apiResponse) {
        that.store.dispatch(
          that.actions.data_received(apiResponse.toJSON(), id)
        );
        that.updateState(that.STATES.IDLE);
      });

      var q = this.customizeQuery(currentQuery);
      var children = id
        ? this.store.getState().facets[id].children
        : this.store.getState().children;
      var offset = children.length || 0;

      q.set('facet.offset', offset);
      // we don't need actual records so set rows to 1
      q.set('rows', 1);
      // set prefix from 0/ to 1/
      if (id) {
        // append '/' so that we properly match the prefix
        const childPrefix = id.replace('0/', '1/') + '/';
        q.set('facet.prefix', childPrefix);
      }

      var req = this.composeRequest(q);
      pubsub.publish(pubsub.DELIVERING_REQUEST, req);
      this.updateState(this.STATES.LOADING);
    },

    submitFilter: function(operator) {
      if (
        ['and', 'or', 'limit to', 'expand', 'exclude'].indexOf(operator) === -1
      ) {
        throw new Error(
          "we don't recognize this operator you're trying to filter on"
        );
      }

      var q = this.getCurrentQuery().clone();
      q.unlock();

      var facetField = this.store.getState().config.facetField;

      // not sure why this is necessary, otherwise queryupdater will return a too-long name
      var fieldName = 'fq_' + facetField.replace('_facet_hier', '');

      var conditions = Reducers.getActiveFacets(
        this.store.getState(),
        this.store.getState().state.selected
      ).map(function(c) {
        return facetField + ':"' + c + '"';
      });

      if (operator == 'and' || operator == 'limit to') {
        this.queryUpdater.updateQuery(q, fieldName, 'limit', conditions, {
          prefix: 'filter_',
        });
      } else if (operator == 'or') {
        this.queryUpdater.updateQuery(q, fieldName, 'expand', conditions, {
          prefix: 'filter_',
        });
      } else if (operator == 'exclude' || operator == 'not') {
        if (q.get(fieldName)) {
          this.queryUpdater.updateQuery(q, fieldName, 'exclude', conditions, {
            prefix: 'filter_',
          });
        } else {
          conditions.unshift('*:*');
          this.queryUpdater.updateQuery(q, fieldName, 'exclude', conditions, {
            prefix: 'filter_',
          });
        }
      }

      // go through each filter and if it's length is larger than 3, prepend with "__"
      // to make sure it gets cleaned during the next cycle.
      _.forEach(q.toJSON(), function(v, k) {
        if (/^filter_/.test(k)) {
          if (v.length > 3) {
            q.unset(k);
            q.set('__' + k, v);
          }
        }
      });

      var fq = '{!type=aqp v=$' + fieldName + '}';
      var fqs = q.get('fq') || [];
      fqs.push(fq);
      q.set('fq', _.unique(fqs));

      q.unset('facet.prefix');
      q.unset('facet');
      q.unset('start');
      q.unset('rows');

      this.dispatchNewQuery(q);

      analytics(
        'send',
        'event',
        'interaction',
        'facet-applied',
        JSON.stringify({
          name: facetField,
          logic: operator,
          conditions: conditions,
        })
      );
    },
  });

  return BaseFacetWidget;
});
