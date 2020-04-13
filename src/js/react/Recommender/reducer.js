define(['redux', './actions'], function(
  { combineReducers },
  { SET_DOCS, SET_QUERY }
) {
  const requestState = {
    GET_RECOMMENDATIONS: { status: null, result: null, error: null },
    GET_DOCS: { status: null, result: null, error: null },
  };
  const requests = (state = requestState, action) => {
    if (/_API_REQUEST_/.test(action.type)) {
      const [scope, status] = action.type.split('_API_REQUEST_');
      const { result = null, error = null } = action;
      return {
        ...state,
        [scope]: {
          status: status.toLowerCase(),
          result,
          error,
        },
      };
    }

    if (/_RESET$/.test(action.type)) {
      const scope = action.type.replace('_RESET', '');
      return {
        ...state,
        [scope]: requestState[scope],
      };
    }
    return state;
  };

  const docsState = [];
  const docs = (state = docsState, action) => {
    if (action.type === SET_DOCS && action.payload) {
      return action.payload.map((doc) => ({
        ...doc,
        title: doc.title[0],
      }));
    }
    return state;
  };

  const queryState = null;
  const query = (state = queryState, action) => {
    if (action.type === SET_QUERY && action.payload) {
      return action.payload;
    }
    return state;
  };

  return combineReducers({
    requests,
    docs,
    query,
  });
});
