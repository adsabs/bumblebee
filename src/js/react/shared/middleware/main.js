define(['../helpers'], function({ middleware }) {
  const getInitialData = middleware(({ trigger, next, action, dispatch }) => {
    next(action);

    if (action.type === 'GET_INITIAL_DATA') {
      trigger('getInitialData', (result) => {
        dispatch({ type: 'SET_INITIAL_DATA', result });
      });
    }
  });

  const injector = middleware(
    ({ trigger, next, action, dispatch, getState }) => {
      next(action);

      trigger('_injector', { dispatch, getState });
    }
  );

  return {
    getInitialData,
    injector,
  };
});
