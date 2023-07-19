define(['underscore', 'es6!../modules/api', 'es6!../modules/ui'], function(
  _,
  api,
  ui
) {
  const {
    QUERY_PROVIDED,
    RECEIVED_RESPONSE,
    CURRENT_QUERY_UPDATED,
    FETCH_DATA,
    FETCHING_DATA,
    SEND_ANALYTICS,
  } = api.actions;

  const {
    SET_LOADING,
    SET_NO_RESULTS,
    SET_HAS_ERROR,
    SET_FULL_TEXT_SOURCES,
    SET_DATA_PRODUCTS,
    LINK_CLICKED,
  } = ui.actions;

  /**
   * Fires off request, delegating to the outer context for the actual
   * fetch
   */
  const fetchData = (ctx, { dispatch }) => (next) => (action) => {
    next(action);
    if (action.type === FETCH_DATA) {
      const query = {
        q: `identifier:${action.result}`,
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
  const displayDocuments = (ctx, { dispatch }) => (next) => (action) => {
    next(action);
    if (action.type === QUERY_PROVIDED) {
      const query = action.result;
      dispatch({ type: SET_LOADING, result: true });
      dispatch({ type: CURRENT_QUERY_UPDATED, result: query });

      // check the query
      if (_.isPlainObject(query)) {
        let identifier = query.q;
        if (_.isArray(identifier) && identifier.length > 0) {
          if (/^(identifier|bibcode):/.test(identifier[0])) {
            identifier = identifier[0].replace(/^(identifier|bibcode):/, '');
            dispatch({ type: FETCH_DATA, result: identifier });
            ctx.trigger('page-manager-event', 'widget-ready', {
              isActive: true,
            });
          } else {
            dispatch({
              type: SET_HAS_ERROR,
              result: 'unable to parse bibcode from query',
            });
          }
        } else {
          dispatch({
            type: SET_HAS_ERROR,
            result: 'did not receive a bibcode in query',
          });
        }
      } else {
        dispatch({
          type: SET_HAS_ERROR,
          result: 'query is not a plain object',
        });
      }
    }
  };

  /**
   * Sorts a set of sources by type and then groups them by name
   * @param {Array} sources sources to reformat
   * @returns {object} object keyed by the source shortnames
   */
  const groupSources = (sources) => {
    const groups = {};

    if (sources.length === 0) {
      return groups;
    }

    // group the sources by name, maintaining the incoming order
    sources.forEach((source) => {
      // if the source is not in the groups object, add it
      if (!groups[source.shortName]) {
        groups[source.shortName] = [];
      }

      // add the source to the groups object
      groups[source.shortName].push(source);
    });

    return groups;
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
      // update the link server
      ctx._updateLinkServer();
      const { linkServer } = getState().api;
      const response = action.result;
      if (_.isPlainObject(response)) {
        const docs = response.response && response.response.docs;
        if (_.isArray(docs) && docs.length > 0) {
          if (_.isString(linkServer)) {
            docs[0].link_server = linkServer;
          }
          let data;
          try {
            data = ctx.parseResourcesData(docs[0]);
          } catch (e) {
            return dispatch({
              type: SET_HAS_ERROR,
              result: 'unable to parse resource data',
            });
          }

          if (data.fullTextSources.length > 0) {
            const fullTextSources = groupSources(data.fullTextSources);
            dispatch({ type: SET_FULL_TEXT_SOURCES, result: fullTextSources });
          }

          if (data.dataProducts.length > 0) {
            dispatch({ type: SET_DATA_PRODUCTS, result: data.dataProducts });
          }

          if (
            data.dataProducts.length === 0 &&
            data.fullTextSources.length === 0
          ) {
            dispatch({ type: SET_NO_RESULTS, result: true });
          }

          dispatch({ type: SET_LOADING, result: false });
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

  return withContext(
    displayDocuments,
    processResponse,
    fetchData,
    sendAnalytics
  );
});
