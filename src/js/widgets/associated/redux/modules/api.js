define([], function () {
  const actions = {
    CURRENT_QUERY_UPDATED: '[api] CURRENT_QUERY_UPDATED',
    FETCH_DATA: '[api] FETCH_DATA',
    FETCHING_DATA: '[api] FETCHING_DATA',
    QUERY_PROVIDED: '[api] QUERY_PROVIDED',
    RECEIVED_RESPONSE: '[api] RECEIVED_RESPONSE',
    SEND_ANALYTICS: '[api] SEND_ANALYTICS',
    SET_BIBCODE: '[api] SET_BIBCODE'
  };

  const initialState = {
    bibcode: null
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case actions.SET_BIBCODE:
        return { ...state, bibcode: action.result };
      default:
        return state;
    }
  };

  // action creators
  const displayDocuments = result => ({ type: actions.QUERY_PROVIDED, result });
  const processResponse = result => ({ type: actions.RECEIVED_RESPONSE, result });

  return {
    reducer,
    initialState,
    actions,
    displayDocuments,
    processResponse
  };
});
