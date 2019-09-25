// this module is not loaded directly, it must be loaded using reactify!
// in order for the view to be dynamically injected

define([
  'underscore',
  'js/widgets/base/base_widget',
  'js/components/api_request',
  'js/components/api_query',
], function(_, BaseWidget, ApiRequest, ApiQuery) {
  const BumblebeeWidget = BaseWidget.extend({
    /**
     * @override
     */
    getBeeHive() {
      return getBeeHive();
    },

    /**
     * @override
     */
    hasBeeHive() {
      return true;
    },

    initialize({ componentId, initialData }) {
      this.view.on({
        sendRequest: _.bind(this.onSendRequest, this),
        subscribeToPubSub: _.bind(this.subscribeToPubSub, this),
        publishToPubSub: _.bind(this.publishToPubSub, this),
        doSearch: _.bind(this.doSearch, this),
        getCurrentQuery: _.bind(this.onGetCurrentQuery, this),
        isLoggedIn: _.bind(this.isLoggedIn, this),
        getInitialData: _.bind(this.getInitialData, this),
      });

      this.listenTo(this, 'page-manager-message', (ev, data) => {
        if (ev === 'widget-selected' && data.idAttribute === componentId) {
          this.view.destroy().render();
        }
      });
      this.initialData = initialData;
      this.activate();

      this.onSendRequest = _.debounce(this.onSendRequest, 1000, {
        leading: true,
        trailing: false,
      });

      if (this.view._store) {
        this._store = this.view._store;
      }
    },
    dispatch({ type, ...args }) {
      this._store.dispatch({ type, ...args });
    },
    getState() {
      return this._store.getState();
    },
    getInitialData(cb) {
      if (typeof cb === 'function') {
        cb(this.initialData);
      }
    },
    activate(beehive) {
      this.setBeeHive(beehive);
      const ps = this.getPubSub();
      ps.subscribe(
        ps.USER_ANNOUNCEMENT,
        this.handleUserAnnouncement.bind(this)
      );
    },
    handleUserAnnouncement() {},
    isLoggedIn(cb) {
      const user = this.getBeeHive().getObject('User');
      cb(user.isLoggedIn());
    },
    onGetCurrentQuery(callback) {
      callback(this.getCurrentQuery());
    },
    subscribeToPubSub(event, callback) {
      const ps = this.getPubSub();
      ps.subscribe(ps[event], callback);
    },
    publishToPubSub(event, ...args) {
      const ps = this.getPubSub();
      ps.publish(ps[event], ...args);
    },
    doSearch(queryParams) {
      const query = new ApiQuery();
      if (typeof queryParams === 'string') {
        query.load(queryParams);
      } else {
        query.set({ ...queryParams });
      }
      this.publishToPubSub('NAVIGATE', 'search-page', {
        q: query,
      });
    },
    onSendRequest({ options, target, query }) {
      const ps = this.getPubSub();
      const request = new ApiRequest({
        target,
        query: new ApiQuery(query),
      });
      request.set('options', {
        ...options,
        contentType:
          target === 'search/query'
            ? 'application/x-www-form-urlencoded'
            : options.contentType,
        data:
          target === 'search/query' ? request.get('query').url() : options.data,
      });

      publish(ps.EXECUTE_REQUEST, request);
    },
    analyticsEvent(...args) {
      analytics(...args);
    },
  });

  return BumblebeeWidget;
});
