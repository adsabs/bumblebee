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
        const { responseJSON, statusText, status } = error;
        let errorMsg = defaultFail.responseJSON.error;
        if (responseJSON) {
          errorMsg =
            responseJSON.error || responseJSON.message || responseJSON.msg;
        } else if (statusText) {
          errorMsg = statusText;
        }
        const { error: err, ...result } = response;
        dispatch({
          type: `${action.scope}_API_REQUEST_FAILURE`,
          error: err,
          result,
        });
      };

      const {
        target,
        query = {},
        type = 'GET',
        data,
        headers,
      } = action.options;

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
          headers: {
            Accept: 'application/json; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8',
            ...headers,
          },
        },
      });
    }
  };

  return {
    request,
  };
});
