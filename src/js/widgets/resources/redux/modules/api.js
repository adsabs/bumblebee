define([

], function () {
  const actions = {
    QUERY_PROVIDED: '[api] QUERY_PROVIDED',
    RECEIVED_RESPONSE: '[api] RECEIVED_RESPONSE',
    CURRENT_QUERY_UPDATED: '[api] CURRENT_QUERY_UPDATED',
    FETCH_DATA: '[api] FETCH_DATA',
    FETCHING_DATA: '[api] FETCHING_DATA',
    SET_LINK_SERVER: '[api] SET_LINK_SERVER',
    SEND_ANALYTICS: '[api] SEND_ANALYTICS'
  };

  const initialState = {
    linkServer: null
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case actions.SET_LINK_SERVER:
        return { ...state, linkServer: action.result };
      default:
        return state;
    }
  };

  // action creators
  const displayDocuments = result => ({ type: actions.QUERY_PROVIDED, result });
  const processResponse = result => ({ type: actions.RECEIVED_RESPONSE, result });
  const setLinkServer = result => ({ type: actions.SET_LINK_SERVER, result });

  return {
    reducer,
    initialState,
    actions,
    displayDocuments,
    processResponse,
    setLinkServer
  };
});
