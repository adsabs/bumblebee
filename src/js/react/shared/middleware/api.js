define([], function() {
  // default fail object
  const defaultFail = { responseJSON: { error: 'Server-side issue occurred' } };

  /**
   * Scoped request
   *
   * This will trigger an api request
   */
  const request = ({ trigger }, { dispatch }) => (next) => (action) => {
    next(action);

    if (action.type === 'API_REQUEST' && action.scope) {
      const done = (result) => {
        dispatch({ type: `${action.scope}_API_REQUEST_SUCCESS`, result });
      };

      const fail = (error = defaultFail) => {
        let response = error.responseJSON;
        if (!response) {
          response = defaultFail.responseJSON;
        }
        const { error: err, ...result } = response;
        dispatch({
          type: `${action.scope}_API_REQUEST_FAILURE`,
          error: err,
          result,
        });
      };

      const { target, query = {}, type = 'GET', data } = action.options;

      if (!target) {
        return;
      }
      dispatch({ type: `${action.scope}_API_REQUEST_PENDING` });
      trigger('sendRequest', {
        target,
        query,
        options: {
          type,
          done,
          fail,
          data: JSON.stringify(data),
          contentType: 'application/json',
        },
      });
    }
  };

  return {
    request,
  };
});
