define(['../shared/helpers', './actions'], function(
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
});
