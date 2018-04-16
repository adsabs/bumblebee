define([
  'underscore',
  'immutable'
], function (_, Immutable) {

  // Action Constants
  const SET_QUERY = 'SET_QUERY';
  const SET_IDENTIFIER = 'SET_IDENTIFIER';
  const SET_ERROR = 'SET_ERROR';
  const SET_FETCHING = 'SET_FETCHING';
  const SET_LINK_SERVER = 'SET_LINK_SERVER';
  const SET_DATA = 'SET_DATA';
  const SET_MODAL = 'SET_MODAL';
  const SET_SOURCES = 'SET_SOURCES';
  const RESET = 'RESET';

  // Action Creators
  const setQuery = value => ({ type: SET_QUERY, value });
  const setIdentifier = value => ({ type: SET_IDENTIFIER, value });
  const setFetching = value => ({ type: SET_FETCHING, value });
  const setLinkServer = value => ({ type: SET_LINK_SERVER, value });
  const setData = value => ({ type: SET_DATA, value });
  const setModal = value => ({ type: SET_MODAL, value });
  const setSources = value => ({ type: SET_SOURCES, value });
  const reset = () => ({ type: RESET });
  const setError = (value, info) => (dispatch) => {
    console.error(value);

    if (_.isPlainObject(info) && info.fatal) {
      dispatch(reset());
    }

    dispatch({ type: SET_ERROR, value });
  };

  const fetchData = () => (dispatch, getState, widget) => {
    const id = getState().get('ResourcesApp').get('identifier');
    if (_.isString(id)) {
      const query = {
        q: `bibcode:${id}`,
        fl: 'bibcode,data,doctype,doi,esources,first_author,genre,isbn,issn,issue,page,property,pub,title,volume,year'
      };
      dispatch(setFetching(true));
      widget.dispatchRequest(query);
    }
  };

  const handleLinkClick = link => (dispatch, getState, widget) => {
    widget.emitAnalytics(link.get('name'));
  };

  // initial state
  const initialState = Immutable.fromJS({
    query: {},
    identifier: null,
    error: null,
    fetching: false,
    linkServer: null,
    fullTextSources: [],
    dataProducts: [],
    modalShown: false,
    allSources: {}
  });

  // reducer
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_QUERY: return state.set('query', action.value);
      case SET_IDENTIFIER: return state.set('identifier', action.value);
      case SET_ERROR: return state.set('error', action.value);
      case SET_FETCHING: return state.set('fetching', action.value);
      case SET_LINK_SERVER: return state.set('linkServer', action.value);
      case SET_MODAL: return state.set('modalShown', action.value);
      case SET_SOURCES: return state.set('allSources', action.value);
      case SET_DATA:
        return state.merge({
          fullTextSources: action.value.fullTextSources,
          dataProducts: action.value.dataProducts,
          fetching: false
        });
      case RESET: return initialState;
      default: return initialState;
    }
  };

  return {
    setQuery,
    setIdentifier,
    setError,
    setData,
    setModal,
    handleLinkClick,
    setLinkServer,
    fetchData,
    initialState,
    reducer
  };
});
