
define([
  'underscore',
  'backbone',
  'react',
  'react-dom',
  'react-redux',
  'analytics',
  'js/components/api_query',
  'js/components/api_request',
  'js/components/api_targets',
  'js/widgets/base/base_widget',
  'es6!./redux/configure-store',
  'es6!./redux/modules/api',
  'es6!./redux/modules/ui',
  'es6!./containers/app'
], function (
  _, Backbone, React, ReactDOM, ReactRedux, analytics, ApiQuery, ApiRequest, ApiTargets,
  BaseWidget, configureStore, api, ui, App
) {
  const View = Backbone.View.extend({
    initialize: function (options) {
      // provide this with all the options passed in
      _.assign(this, options);
    },
    render: function () {
      // create provider component, that passes the store to <App>
      ReactDOM.render(
        <ReactRedux.Provider store={this.store}>
          <App />
        </ReactRedux.Provider>,
        this.el
      );
      return this;
    },
    destroy: function () {
      // on destroy, make sure the React DOM is unmounted
      ReactDOM.unmountComponentAtNode(this.el);
    }
  });

  const Widget = BaseWidget.extend({
    initialize: function () {
      // create the store, using the configurator
      this.store = configureStore(this);

      // create the view, passing in store
      this.view = new View({ store: this.store });
    },
    defaultQueryArguments: {},
    activate: function (beehive) {
      const { dispatch } = this.store;
      const self = this;
      this.setBeeHive(beehive);
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);

      const pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, function (apiQuery) {
        const { query: currentQuery } = self.store.getState().api;

        if (apiQuery && _.isFunction(apiQuery.toJSON)) {
          var query = apiQuery.toJSON();

          // break out early if the currentQuery is different than the incoming one
          if (_.isEqual(currentQuery, query)) {
            return;
          }
          dispatch(api.displayDocuments(query));
        } else {
          dispatch(ui.setError('did not receive query'));
        }
      });
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, function (apiResponse) {
        if (apiResponse && _.isFunction(apiResponse.toJSON)) {
          dispatch(api.processResponse(apiResponse.toJSON()));
        } else {
          dispatch(ui.setError('did not receive response from server'));
        }
      });
    },
    dispatchRequest: function (options) {
      const query = new ApiQuery(options);
      BaseWidget.prototype.dispatchRequest.call(this, query);
    },
    composeRequest: function (apiQuery) {
      const { bibcode } = this.store.getState().api;
      return new ApiRequest({
        target: `${ApiTargets.RESOLVER}/${bibcode}/associated`,
        query: new ApiQuery()
      });
    },
    emitAnalytics: function (data) {
      analytics('send', 'event', 'interaction', 'associated-link-followed', {
        target: 'associated',
        url: data.rawUrl
      });
    },
    onApiFeedback: function (feedback) {
      const { dispatch } = this.store;
      if (_.isPlainObject(feedback.error)) {
        dispatch(ui.setError(feedback.error));
        dispatch(api.fallbackOnError());
      }
    }
  });

  return Widget;
});
