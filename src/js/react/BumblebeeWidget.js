// this module is not loaded directly, it must be loaded using reactify!
// in order for the view to be dynamically injected

define([
  'underscore',
  'js/widgets/base/base_widget',
  'js/components/api_request',
  'js/components/api_query',
  'analytics',
], function(_, BaseWidget, ApiRequest, ApiQuery, analytics) {
  const getBeeHive = () => {
    return window.bbb.getBeeHive();
  };

  const getPubSub = () => {
    const beehive = getBeeHive();
    const ps = beehive.getService('PubSub');
    return ps;
  };

  const subscribe = (...args) => {
    const ps = getPubSub();
    ps.subscribe(ps.pubSubKey, ...args);
  };

  const publish = (...args) => {
    const ps = getPubSub();
    ps.publish(ps.pubSubKey, ...args);
  };

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

    initialize({ componentId }) {
      this.view.on({
        sendRequest: _.bind(this.onSendRequest, this),
        subscribeToPubSub: _.bind(this.subscribeToPubSub, this),
        publishToPubSub: _.bind(this.publishToPubSub, this),
        doSearch: _.bind(this.doSearch, this),
        getCurrentQuery: _.bind(this.onGetCurrentQuery, this),
        isLoggedIn: _.bind(this.isLoggedIn, this),
        analyticsEvent: _.bind(this.analyticsEvent, this),
      });

      this.listenTo(this, 'page-manager-message', (ev, data) => {
        if (ev === 'widget-selected' && data.idAttribute === componentId) {
          this.view.destroy().render();
        }
      });
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
      if (this._store && typeof this._store.dispatch === 'function') {
        this._store.dispatch({ type, ...args });
      }
    },
    getState() {
      return this._store.getState();
    },
    activate() {
      const ps = getPubSub();
      subscribe(ps.USER_ANNOUNCEMENT, this.handleUserAnnouncement.bind(this));

      const user = this.getBeeHive().getObject('User');
      if (user && typeof user.getUserName === 'function') {
        this.dispatch({
          type: 'USER_ANNOUNCEMENT/user_signed_in',
          payload: user.getUserName(),
        });
      }
    },
    handleUserAnnouncement(event, payload) {
      const type = `USER_ANNOUNCEMENT/${event}`;
      this.dispatch({ type, payload });
    },
    isLoggedIn(cb) {
      const user = this.getBeeHive().getObject('User');
      if (typeof cb === 'function') {
        cb(user.isLoggedIn());
      }
    },
    onGetCurrentQuery(callback) {
      callback(this.getCurrentQuery());
    },
    subscribeToPubSub(event, callback) {
      const ps = getPubSub();
      subscribe(ps[event], callback);
    },
    publishToPubSub(event, ...args) {
      const ps = getPubSub();
      publish(ps[event], ...args);
    },
    doSearch(queryParams) {
      const query = new ApiQuery();
      if (_.isString(queryParams)) {
        query.load(queryParams);
      } else {
        query.set({ ...queryParams });
      }
      this.publishToPubSub('NAVIGATE', 'search-page', {
        q: query,
      });
    },
    onSendRequest({ options, target, query }) {
      const ps = getPubSub();
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
