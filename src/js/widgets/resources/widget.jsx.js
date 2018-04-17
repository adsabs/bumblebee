'use strict';
define([
  'underscore',
  'backbone',
  'react',
  'react-dom',
  'react-redux',
  'analytics',
  'js/components/api_query',
  'js/components/api_request',
  'js/widgets/base/base_widget',
  'js/mixins/link_generator_mixin',
  'es6!./redux/configure-store',
  'es6!./redux/modules/resources-app',
  'es6!./containers/resources-app'
], function (
  _, Backbone, React, ReactDOM, ReactRedux, analytics, ApiQuery, ApiRequest, BaseWidget, LinkGenerator,
  configureStore, ResourcesApp, ResourcesContainer
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
          <ResourcesContainer />
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
    activate: function (beehive) {
      this.setBeeHive(beehive);
      this.activateWidget();
      const pubsub = this.getPubSub();
      _.bindAll(this, [
        'processResponse',
        'onDisplayDocuments'
      ]);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      this.attachGeneralHandler(this.onApiFeedback);
    },
    _updateLinkServer: function () {
      const { dispatch } = this.store;
      const { setLinkServer } = ResourcesApp;
      const beehive = this.getBeeHive();
      if (_.isPlainObject(beehive)) {
        const user = beehive.getObject('User');
        if (_.isPlainObject(user) && _.has(user, 'link_server')) {
          dispatch(setLinkServer(user.link_server));
        }
      }
    },
    processResponse: function (apiResponse) {
      // extract the docs out of the response and update state
      const { dispatch } = this.store;
      const { setError, setData } = ResourcesApp;
      const { getState } = this.store;
      // this._updateLinkServer();
      const linkServer = getState().get('ResourcesApp').get('linkServer');
      const response = apiResponse && apiResponse.toJSON && apiResponse.toJSON();
      if (_.isPlainObject(response)) {
        const docs = response.response && response.response.docs;
        if (_.isArray(docs) && docs.length > 0) {

          if (_.isString(linkServer)) {
            docs[0].link_server = linkServer;
          }
          try {
            const data = this.parseResourcesData(docs[0]);
            dispatch(setData(data));
          } catch (e) {
            dispatch(setError('Unable to parse resource data'));
          }

        } else {
          dispatch(setError('No docs'));
        }
      } else {
        dispatch(setError('No response'));
      }
    },
    onDisplayDocuments: function (apiQuery) {

      /*
        get the query and parse out the bibcode
        should be: { q: ["bibcode:foobar"] }
        and update the store
      */
      const { dispatch } = this.store;
      const { setQuery, setIdentifier, setError, fetchData } = ResourcesApp;
      const query = apiQuery && apiQuery.toJSON && apiQuery.toJSON();
      if (_.isPlainObject(query)) {
        dispatch(setQuery(apiQuery.toJSON()));

        let bibcode = query.q;
        if (_.isArray(bibcode) && bibcode.length > 0) {
          if (/^bibcode:/.test(bibcode[0])) {
            bibcode = bibcode[0].split(':')[1];
            dispatch(setIdentifier(bibcode));
            dispatch(fetchData());
            this.trigger('page-manager-event', 'widget-ready', { isActive: true });
          } else {
            dispatch(setError('Could not parse bibcode'));
          }
        } else {
          dispatch(setError('Did not receive a bibcode'));
        }
      } else {
        dispatch(setError('No query'));
      }
    },
    dispatchRequest: function (options) {
      const query = new ApiQuery(options);
      BaseWidget.prototype.dispatchRequest.call(this, query);
    },
    emitAnalytics: function (text) {
      analytics('send', 'event', 'interaction', 'full-text-link-followed', text);
    },
    onApiFeedback: function (feedback) {
      const { dispatch } = this.store;
      const { setError } = ResourcesApp;
      if (_.isPlainObject(feedback.error)) {
        dispatch(setError('Request failed', { fatal: true }));
      }
    }
  });

  _.extend(Widget.prototype, LinkGenerator);
  return Widget;
});
