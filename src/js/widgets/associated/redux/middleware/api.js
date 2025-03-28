define(['underscore', 'es6!js/widgets/associated/redux/modules/api', 'es6!js/widgets/associated/redux/modules/ui'], function(
  _,
  api,
  ui
) {
  const { RECEIVED_RESPONSE, SEND_ANALYTICS, FALLBACK_ON_ERROR } = api.actions;

  const { SET_LOADING, SET_HAS_ERROR, SET_ITEMS } = ui.actions;

  /**
   * Map the array of items to the format we need { url, name, id, etc }
   *
   * @param {array} items - The array to parse
   */
  const parseItems = (items, bibcode) => {
    const parseUrl = (url) => {
      try {
        if (url.indexOf('http') >= 0) return decodeURIComponent(url);
        // decode and rip the "/#abs..." part off the url and any leading slash
        return decodeURIComponent(url.slice(url.indexOf(':') + 1)).replace(
          /^\//,
          '#'
        );
      } catch (e) {
        return url;
      }
    };

    return _.map(items, (i) => {
      const url = parseUrl(i.url);
      return {
        rawUrl: i.url,
        url: url,
        circular: url.indexOf(bibcode, url.indexOf(':')) > -1,
        external: url.indexOf('http') > -1,
        name: i.title,
        id: _.uniqueId(),
      };
    });
  };

  /**
   * Processes incoming response from server and sends the data off to the
   * link generator, finally dispatching the parsed sources
   */
  const processResponse = (ctx, { dispatch, getState }) => (next) => (
    action
  ) => {
    next(action);
    if (action.type === RECEIVED_RESPONSE) {
      const response = action.result;
      const { bibcode } = getState().api;
      if (_.isPlainObject(response)) {
        const docs = response.links && response.links.records;
        if (_.isArray(docs) && docs.length > 0) {
          dispatch({ type: SET_LOADING, result: false });
          dispatch({ type: SET_ITEMS, result: parseItems(docs, bibcode) });
        } else {
          dispatch({ type: SET_HAS_ERROR, result: 'did not receive docs' });
        }
      } else {
        dispatch({ type: SET_HAS_ERROR, result: 'did not receive docs' });
      }
    }
  };

  /**
   * In the case of an error, attempt to fallback on the data we already retrieved
   * If there is no data, then do nothing and the widget will not show
   */
  const fallbackOnError = (ctx, { dispatch, getState }) => (next) => (
    action
  ) => {
    next(action);
    if (action.type === FALLBACK_ON_ERROR) {
      const { bibcode } = getState().api;
      const { items } = getState().ui;
      if (_.isArray(items) && items.length > 0) {
        dispatch({
          type: SET_ITEMS,
          result: parseItems(
            items.map((i) => ({
              url: i.rawUrl,
              title: i.name,
            })),
            bibcode
          ),
        });
      }
    }
  };

  /**
   * Emit an analytics event
   */
  const sendAnalytics = (ctx, { dispatch, getState }) => (next) => (action) => {
    next(action);
    if (action.type === SEND_ANALYTICS) {
      ctx.emitAnalytics(action.result);
    }
  };

  /**
   * Wrap the middleware with a function that, when called,
   * binds it's first argument to the first argument of the middleware function
   * returns the wrapped middleware function
   */
  const withContext = (...fns) => (context) =>
    fns.map((fn) => _.partial(fn, context));

  return withContext(processResponse, sendAnalytics, fallbackOnError);
});
