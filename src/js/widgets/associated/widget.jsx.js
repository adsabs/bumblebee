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
  'es6!js/widgets/associated/redux/configure-store',
  'es6!js/widgets/associated/redux/modules/api',
  'es6!js/widgets/associated/redux/modules/ui',
  'es6!js/widgets/associated/containers/app',
], function(
  _,
  Backbone,
  React,
  ReactDOM,
  ReactRedux,
  analytics,
  ApiQuery,
  ApiRequest,
  ApiTargets,
  BaseWidget,
  configureStore,
  api,
  ui,
  App
) {
  const View = Backbone.View.extend({
    initialize: function(options) {
      // provide this with all the options passed in
      _.assign(this, options);
    },
    render: function() {
      // create provider component, that passes the store to <App>
      ReactDOM.render(
        <ReactRedux.Provider store={this.store}>
          <App />
        </ReactRedux.Provider>,
        this.el
      );
      return this;
    },
    destroy: function() {
      // on destroy, make sure the React DOM is unmounted
      ReactDOM.unmountComponentAtNode(this.el);
    },
  });

  const Widget = BaseWidget.extend({
    initialize: function() {
      // create the store, using the configurator
      this.store = configureStore(this);

      // create the view, passing in store
      this.view = new View({ store: this.store });

      if (!window.__BUMBLEBEE_TESTING_MODE__) {
        this.processAbstractData = _.debounce(
          _.bind(this.processAbstractData, this),
          300
        );
      }
    },
    defaultQueryArguments: {},
    activate: function(beehive) {
      const { dispatch } = this.store;
      this.setBeeHive(beehive);
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);

      const pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.CUSTOM_EVENT, (event, data) => {
        if (event === 'latest-abstract-data') {
          const { bibcode: currentId } = this.store.getState().api;
          let id = data.bibcode || data.identifier;
          id = Array.isArray(id) ? id[0] : id;
          if (!id || currentId === id) {
            return;
          }

          dispatch(ui.reset());
          dispatch(api.setBibcode(id));
          this.processAbstractData(data);
        }
      });
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, function(apiResponse) {
        if (apiResponse && _.isFunction(apiResponse.toJSON)) {
          dispatch(api.processResponse(apiResponse.toJSON()));
        } else {
          dispatch(ui.setError('did not receive response from server'));
        }
      });
    },
    processAbstractData: function(data) {
      const { dispatch } = this.store;
      if (data && data.property && data.property.includes('ASSOCIATED')) {
        this.dispatchRequest(new ApiQuery());
      } else {
        dispatch(ui.setError('no associated property'));
      }
    },
    composeRequest: function() {
      const { bibcode } = this.store.getState().api;

      return new ApiRequest({
        target: `${ApiTargets.RESOLVER}/${bibcode}/associated`,
        query: new ApiQuery(),
      });
    },
    emitAnalytics: function(data) {
      analytics('send', 'event', 'interaction', 'associated-link-followed', {
        target: 'associated',
        url: data.rawUrl,
      });
    },
    onApiFeedback: function(feedback) {
      const { dispatch } = this.store;
      if (_.isPlainObject(feedback.error)) {
        dispatch(ui.setError(feedback.error));
        dispatch(api.fallbackOnError());
      }
    },
  });

  return Widget;
});
