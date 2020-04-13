define(['../shared/helpers', './actions'], function(
<<<<<<< HEAD
  { middleware, apiSuccess, apiFailure, parseScope },
  {
    GET_RECOMMENDATIONS,
    getDocs,
    GET_DOCS,
    setDocs,
    setQuery,
    UPDATE_SEARCH_BAR,
    GET_FULL_LIST,
  }
) {
  const getRecommendations = middleware(({ next, action, dispatch }) => {
    next(action);

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
  });

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

  return { getRecommendations, updateSearchBar, getFullList };
=======
  { delay, middleware, apiSuccess, parseScope },
  { GET_RECOMMENDATIONS }
) {
  const getRecommendations = middleware(({ next, action }) => {
    next(action);

    if (action.type === apiSuccess(GET_RECOMMENDATIONS)) {
      console.log('success', action);
    }
  });

  const requestReset = middleware(({ dispatch, next, action }) => {
    next(action);
    if (/_API_REQUEST_(SUCCESS|FAILURE)$/.test(action.type)) {
      const { scope } = parseScope(action.type);

      delay(() => {
        dispatch({ type: `${scope}_RESET` });
      });
    }
  });

  return { getRecommendations, requestReset };
>>>>>>> initial stuff
});
