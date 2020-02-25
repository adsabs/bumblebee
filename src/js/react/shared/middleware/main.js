define([], function() {
  const getInitialData = ({ trigger }, { dispatch }) => (next) => (action) => {
    next(action);

    if (action.type === 'GET_INITIAL_DATA') {
      trigger('getInitialData', (result) => {
        dispatch({ type: 'SET_INITIAL_DATA', result });
      });
    }
  };

  return {
    getInitialData,
  };
});
