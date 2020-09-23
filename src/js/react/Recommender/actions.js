define([], function() {
  const actions = {
    GET_RECOMMENDATIONS: 'GET_RECOMMENDATIONS',
    GET_DOCS: 'GET_DOCS',
    SET_DOCS: 'SET_DOCS',
    SET_QUERY: 'SET_QUERY',
    UPDATE_SEARCH_BAR: 'UPDATE_SEARCH_BAR',
    GET_FULL_LIST: 'GET_FULL_LIST',
    EMIT_ANALYTICS: 'EMIT_ANALYTICS',
    SET_TAB: 'SET_TAB',
    SET_ORACLE_TARGET: 'SET_ORACLE_TARGET',
    SET_QUERY_PARAMS: 'SET_QUERY_PARAMS',
  };

  const actionCreators = {
    getRecommendations: () => ({
      type: actions.GET_RECOMMENDATIONS,
    }),
    getDocs: (query) => ({
      type: 'API_REQUEST',
      scope: actions.GET_DOCS,
      options: {
        type: 'GET',
        target: 'search/query',
        query,
      },
    }),
    setDocs: (docs) => ({
      type: actions.SET_DOCS,
      payload: docs,
    }),
    setQuery: (query) => ({
      type: actions.SET_QUERY,
      payload: query,
    }),
    setQueryParams: (payload) => ({
      type: actions.SET_QUERY_PARAMS,
      payload,
    }),
    updateSearchBar: (text) => ({
      type: actions.UPDATE_SEARCH_BAR,
      payload: text,
    }),
    getFullList: () => ({
      type: actions.GET_FULL_LIST,
    }),
    emitAnalytics: (payload) => ({
      type: actions.EMIT_ANALYTICS,
      payload,
    }),
    setTab: (tab) => ({
      type: actions.SET_TAB,
      payload: tab,
    }),
    setOracleTarget: (target) => ({
      type: actions.SET_ORACLE_TARGET,
      payload: target,
    }),
  };

  return { ...actions, ...actionCreators };
});
