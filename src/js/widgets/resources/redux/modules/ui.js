define([], function () {
  const actions = {
    LINK_CLICKED: '[ui] LINK_CLICKED',
    SET_LOADING: '[ui] SET_LOADING',
    SET_HAS_ERROR: '[ui] SET_HAS_ERROR',
    SET_NO_RESULTS: '[ui] SET_NO_RESULTS',
    SET_FULL_TEXT_SOURCES: '[ui] SET_FULL_TEXT_SOURCES',
    SET_DATA_PRODUCTS: '[ui] SET_DATA_PRODUCTS'
  };

  const initialState = {
    loading: true,
    hasError: false,
    noResults: false,
    fullTextSources: [],
    dataProducts: []
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case actions.SET_LOADING:
        return { ...state, loading: action.result };
      case actions.SET_NO_RESULTS:
        return { ...state, noResults: action.result };
      case actions.SET_FULL_TEXT_SOURCES:
        return { ...state, fullTextSources: action.result };
      case actions.SET_DATA_PRODUCTS:
        return { ...state, dataProducts: action.result };
      case actions.SET_HAS_ERROR:
        return {
          ...initialState, hasError: action.result, noResults: true, loading: false
        };
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
