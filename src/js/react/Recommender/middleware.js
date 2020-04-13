define(['../shared/helpers', './actions'], function(
  { middleware, apiSuccess, apiFailure, parseScope },
  {
    GET_RECOMMENDATIONS,
    getDocs,
    GET_DOCS,
    setDocs,
    setQuery,
    UPDATE_SEARCH_BAR,
    GET_FULL_LIST,
    EMIT_ANALYTICS,
  }
) {
  const updateTarget = middleware(({ next, action, getState }) => {
    if (action.type === 'API_REQUEST' && action.scope === GET_RECOMMENDATIONS) {
      const { oracleTarget } = getState();
      action = {
        ...action,
        options: { ...action.options, target: oracleTarget },
      };
    }
    next(action);
  });

  const getRecommendations = middleware(
    ({ next, action, dispatch, getState }) => {
      next(action);

      if (action.type === GET_RECOMMENDATIONS) {
        const { queryParams } = getState();
        const { func, sort, numDocs, cutOffDays, topNReads } = queryParams;
        dispatch({
          type: 'API_REQUEST',
          scope: GET_RECOMMENDATIONS,
          options: {
            type: 'POST',
            data: {
              function: func,
              sort,
              num_docs: numDocs,
              cutoff_days: cutOffDays,
              top_n_reads: topNReads,
            },
          },
        });
      }

      if (action.type === apiSuccess(GET_RECOMMENDATIONS)) {
        dispatch(setQuery(action.result.query));
        dispatch(
          getDocs({
            fl: 'bibcode,title,author,[fields author=3],author_count',
            q: action.result.query,
          })
        );
      }

      if (action.type === apiFailure(GET_RECOMMENDATIONS)) {
        if (action.result && action.result.query) {
          const { scope } = parseScope(action.type);
          dispatch({ type: `${scope}_RESET` });
          dispatch(setQuery(action.result.query));
        }
      }

      if (action.type === apiSuccess(GET_DOCS)) {
        dispatch(setDocs(action.result.response.docs));
      }
    }
  );

  const updateSearchBar = middleware(({ action, next, trigger }) => {
    next(action);

    if (action.type === UPDATE_SEARCH_BAR) {
      trigger(
        'publishToPubSub',
        'CUSTOM_EVENT',
        'recommender/update-search-text',
        {
          text: action.payload,
        }
      );
    }
  });

  const getFullList = middleware(({ next, action, trigger, getState }) => {
    next(action);

    if (action.type === GET_FULL_LIST) {
      const { query } = getState();
      trigger('doSearch', { q: query });
    }
  });

  const analytics = middleware(({ next, action, trigger }) => {
    next(action);

    if (action.type === EMIT_ANALYTICS) {
      trigger('analyticsEvent', ...action.payload);
    }
  });

  return {
    getRecommendations,
    updateSearchBar,
    getFullList,
    analytics,
    updateTarget,
  };
});
