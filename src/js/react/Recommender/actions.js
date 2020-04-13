define([], function() {
  const actions = {
    GET_RECOMMENDATIONS: 'GET_RECOMMENDATIONS',
  };

  const actionCreators = {
    getRecommendations: ({ func, sort, numDocs, cutOffDays, topNReads }) => ({
      type: 'API_REQUEST',
      scope: actions.GET_RECOMMENDATIONS,
      options: {
        type: 'POST',
        target: `_oracle/readhist`,
        body: {
          function: func,
          sort,
          num_docs: numDocs,
          cutoff_days: cutOffDays,
          top_n_reads: topNReads,
        },
      },
    }),
  };

  return { ...actions, ...actionCreators };
});
