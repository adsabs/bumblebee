define([], function () {
  const actions = {
    LINK_CLICKED: '[ui] LINK_CLICKED',
    SET_LOADING: '[ui] SET_LOADING',
    SET_ITEMS: '[ui] SET_ITEMS',
    SET_HAS_ERROR: '[ui] SET_HAS_ERROR'
  };

  const initialState = {
    loading: true,
    items: [],
    hasError: false
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case actions.SET_LOADING:
        return { ...state, loading: action.result };
      case actions.SET_ITEMS:
        return { ...state, items: action.result };
      case actions.SET_HAS_ERROR:
        return { ...state, hasError: action.result, loading: false };
      default:
        return state;
    }
  };

  // action creators
  const handleLinkClick = result => ({ type: actions.LINK_CLICKED, result });
  const setError = result => ({ type: actions.SET_HAS_ERROR, result });

  return {
    reducer,
    initialState,
    actions,
    handleLinkClick,
    setError
  };
});
