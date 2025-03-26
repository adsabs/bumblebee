define(['js/react/shared/helpers', 'js/react/Recommender/actions'], function(
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
    updateUserName,
    setTab,
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
        const {
          func,
          sort,
          numDocs,
          cutOffDays,
          topNReads,
          reader,
        } = queryParams;
        dispatch({
          type: 'API_REQUEST',
          scope: GET_RECOMMENDATIONS,
          options: {
            type: 'POST',
            data: {
              function: func || queryParams.function,
              sort,
              num_docs: numDocs,
              cutoff_days: cutOffDays,
              top_n_reads: topNReads,
              reader: reader,
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
      trigger('doSearch', { q: query, sort: 'score desc' });
    }
  });

  const analytics = middleware(({ next, action, trigger }) => {
    next(action);

    if (action.type === EMIT_ANALYTICS) {
      trigger('analyticsEvent', ...action.payload);
    }
  });

  const updateUser = middleware(({ next, action, dispatch }) => {
    next(action);

    if (action.type.indexOf('USER_ANNOUNCEMENT/user_signed') > -1) {
      // break with the pattern; why define 3 consts when I don't need them?
      if (action.type.indexOf('user_signed_out') > -1) {
        // dispatch(setDocs([]));
        dispatch(setTab(2)); // switch to help {type: 'SET_TAB', payload: 2}
      }
      dispatch(updateUserName(action.payload || ''));
    }
  });

  return {
    getRecommendations,
    updateSearchBar,
    getFullList,
    analytics,
    updateTarget,
    updateUser,
  };
});
