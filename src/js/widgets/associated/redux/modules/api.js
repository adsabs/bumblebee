define([], function() {
  const actions = {
    CURRENT_QUERY_UPDATED: '[api] CURRENT_QUERY_UPDATED',
    FETCH_DATA: '[api] FETCH_DATA',
    QUERY_PROVIDED: '[api] QUERY_PROVIDED',
    RECEIVED_RESPONSE: '[api] RECEIVED_RESPONSE',
    SEND_ANALYTICS: '[api] SEND_ANALYTICS',
    SET_BIBCODE: '[api] SET_BIBCODE',
    FALLBACK_ON_ERROR: '[api] FALLBACK_ON_ERROR',
  };

  const initialState = {
    bibcode: null,
    query: null,
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case actions.SET_BIBCODE:
        return { ...state, bibcode: action.result };
      case actions.CURRENT_QUERY_UPDATED:
        return { ...state, query: action.result };
      case actions.RESET:
        return initialState;
      default:
        return state;
    }
  };

  // action creators
  const displayDocuments = (result) => ({
    type: actions.QUERY_PROVIDED,
    result,
  });
  const processResponse = (result) => ({
    type: actions.RECEIVED_RESPONSE,
    result,
  });
  const fallbackOnError = () => ({ type: actions.FALLBACK_ON_ERROR });
  const setBibcode = (result) => ({ type: actions.SET_BIBCODE, result });

  return {
    reducer,
    initialState,
    actions,
    displayDocuments,
    processResponse,
    fallbackOnError,
    setBibcode,
  };
});
