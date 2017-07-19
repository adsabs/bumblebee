'use strict';
define([
  'underscore',
  'backbone',
  'react',
  'react-dom',
  'redux',
  'react-redux',
  'redux-thunk',
  'js/widgets/base/base_widget',
  './reducers',
  'es6!./component/app.jsx',
  './actions'
], function (
  _, Backbone, React, ReactDOM, Redux, ReactRedux, ReduxThunk,
  BaseWidget, reducers, App, actions
) {

  var API_FIELDS = [
    'title',
    'abstract',
    'bibcode',
    'author',
    'keyword',
    'id',
    'citation_count',
    '[citations]',
    'pub',
    'aff',
    'volume',
    'pubdate',
    'doi',
    'pub_raw',
    'page',
  ];

  var View = Backbone.View.extend({
    initialize: function (options) {
      _.assign(this, options);
    },
    render: function () {
      ReactDOM.render(
        <ReactRedux.Provider store={this.store}>
          <App/>
        </ReactRedux.Provider>,
      this.el);
      return this;
    },
    destroy: function () {
      ReactDOM.unmountComponentAtNode(this.el);
    }
  });

  var Widget = BaseWidget.extend({
    defaultQueryArguments: {
      fl: API_FIELDS.join(','),
      rows: 1
    },
    initialize: function (options) {
      this.options = options || {};
      this.NAME = 'ShowAbstract';

      // create thunk middleware
      var middleware = Redux.applyMiddleware(
        ReduxThunk.default.withExtraArgument(this));

      this.store = Redux.createStore(reducers, middleware);
      this.view = new View({
        store: this.store
      });
    },
    activate: function (beehive) {
      this.setBeeHive(beehive);
      var pubsub = beehive.getService('PubSub');

      _.bindAll(this, [
        'dispatchRequest',
        'processResponse',
        'onDisplayDocuments',
        'handleFeedback'
      ]);
      pubsub.subscribe(pubsub.INVITING_REQUEST, this.dispatchRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
      pubsub.subscribe(pubsub.FEEDBACK, this.handleFeedback);
    },
    dispatchRequest: function (apiQuery) {
      this.setCurrentQuery(apiQuery);
      this.store.dispatch(actions.updateQuery(apiQuery));
      BaseWidget.prototype.dispatchRequest.apply(this, arguments);
    },
    processResponse: function (apiResponse) {
      this.store.dispatch(actions.processResponse(apiResponse));
    },
    onDisplayDocuments: function (apiQuery) {
      this.store.dispatch(actions.onDisplayDocuments(apiQuery));
    },
    handleFeedback: function (feedback) {
      this.store.dispatch(actions.handleFeedback(feedback));
    }
  });

  return Widget;
});
