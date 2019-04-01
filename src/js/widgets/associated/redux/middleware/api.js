define([
  'underscore',
  'es6!../modules/api',
  'es6!../modules/ui'
], function (_, api, ui) {
  const {
    QUERY_PROVIDED,
    RECEIVED_RESPONSE,
    CURRENT_QUERY_UPDATED,
    FETCH_DATA,
    FETCHING_DATA,
    SEND_ANALYTICS,
    SET_BIBCODE
  } = api.actions;

  const {
    SET_LOADING,
    SET_HAS_ERROR,
    SET_ITEMS
  } = ui.actions;

  /**
   * Fires off request, delegating to the outer context for the actual
   * fetch
   */
  const fetchData = (ctx, { dispatch }) => next => (action) => {
    next(action);
    if (action.type === FETCH_DATA) {
      const query = {
        q: `bibcode:${action.result}`
      };
      dispatch({ type: FETCHING_DATA, result: query });
      dispatch({ type: SET_LOADING, result: true });
      ctx.dispatchRequest(query);
    }
  };

  /**
   * Extracts the bibcode from the incoming query and makes a new request
   * for document data.
   */
  const displayDocuments = (ctx, { dispatch }) => next => (action) => {
    next(action);
    if (action.type === QUERY_PROVIDED) {
      const query = action.result;
      dispatch({ type: SET_LOADING, result: true });
      dispatch({ type: CURRENT_QUERY_UPDATED, result: query });

      // check the query
      if (_.isPlainObject(query)) {
        let bibcode = query.q;
        if (_.isArray(bibcode) && bibcode.length > 0) {
          if (/^bibcode:/.test(bibcode[0])) {
            bibcode = bibcode[0].split(':')[1];
            dispatch({ type: SET_BIBCODE, result: bibcode });
            dispatch({ type: FETCH_DATA, result: bibcode });
          } else {
            dispatch({ type: SET_HAS_ERROR, result: 'unable to parse bibcode from query' });
          }
        } else {
          dispatch({ type: SET_HAS_ERROR, result: 'did not receive a bibcode in query' });
        }
      } else {
        dispatch({ type: SET_HAS_ERROR, result: 'query is not a plain object' });
      }
    }
  };

  /**
   * Map the array of items to the format we need { url, name, id, etc }
   *
   * @param {array} items - The array to parse
   */
  const parseItems = (items, bibcode) => {
    const parseUrl = (url) => {
      try {
        // decode and rip the "/#abs..." part off the url and any leading slash
        return decodeURIComponent(url.slice(url.indexOf(':') + 1)).replace(/^\//, '');
      } catch (e) {
        return url;
      }
    };

    return _.map(items, (i) => {
      const url = parseUrl(i.url);
      return {
        rawUrl: i.url,
        url: url,
        circular: url.indexOf(bibcode) > -1,
        name: i.title,
        id: _.uniqueId()
      };
    });
  };

  /**
   * Processes incoming response from server and sends the data off to the
   * link generator, finally dispatching the parsed sources
   */
  const processResponse = (ctx, { dispatch, getState }) => next => (action) => {
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
   * Emit an analytics event
   */
  const sendAnalytics = (ctx, { dispatch, getState }) => next => (action) => {
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
  const withContext = (...fns) => context => fns.map(fn => _.partial(fn, context));

  return withContext(
    displayDocuments,
    processResponse,
    fetchData,
    sendAnalytics
  );
});
