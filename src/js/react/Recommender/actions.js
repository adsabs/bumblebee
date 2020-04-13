define([], function() {
  const actions = {
    GET_RECOMMENDATIONS: 'GET_RECOMMENDATIONS',
<<<<<<< HEAD
    GET_DOCS: 'GET_DOCS',
    SET_DOCS: 'SET_DOCS',
    SET_QUERY: 'SET_QUERY',
    UPDATE_SEARCH_BAR: 'UPDATE_SEARCH_BAR',
    GET_FULL_LIST: 'GET_FULL_LIST',
=======
>>>>>>> initial stuff
  };

  const actionCreators = {
    getRecommendations: ({ func, sort, numDocs, cutOffDays, topNReads }) => ({
      type: 'API_REQUEST',
      scope: actions.GET_RECOMMENDATIONS,
      options: {
        type: 'POST',
        target: `_oracle/readhist`,
<<<<<<< HEAD
        data: {
=======
        body: {
>>>>>>> initial stuff
          function: func,
          sort,
          num_docs: numDocs,
          cutoff_days: cutOffDays,
          top_n_reads: topNReads,
<<<<<<< HEAD
          reader: '3138c73ffff34a0f'
        },
      },
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
    updateSearchBar: (text) => ({
      type: actions.UPDATE_SEARCH_BAR,
      payload: text,
    }),
    getFullList: () => ({
      type: actions.GET_FULL_LIST,
    }),
=======
        },
      },
    }),
>>>>>>> initial stuff
  };

  return { ...actions, ...actionCreators };
});
