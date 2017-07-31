'use strict';
define([
  './util'
], function (util) {

  var initialState = function () {
    return {
      apiResponse: null,
      query: null,
      maxAuthors: 20,
      loading: true,
      error: {
        show: false,
        type: 'warning',
        message: 'Something happened while loading the abstract, please try reloading the page.'
      }
    };
  };

  /**
   * Depending on the action type, perform an update to the state
   *
   * @param state
   * @param action
   */
  var exports = function reducers (state, action) {
    state = state ? state : initialState();

    switch(action.type) {
      case 'UPDATE_QUERY':
        return Object.assign({}, state, {
          query: action.value
        });
      case 'UPDATE_DOCS':
        return Object.assign({}, state, {
          docs: util.parseDocs(action.value, state.maxAuthors)
        });
      case 'START_LOADING':
      case 'STOP_LOADING':
        return Object.assign({}, state, {
          loading: action.value
        });
      case 'SHOW_ERROR':
        return Object.assign({}, state, {
          error: Object.assign({}, state.error, {
            show: action.value
          })
        });
      case 'HIDE_ERROR':
        return Object.assign({}, state, {
          error: Object.assign({}, state.error, {
            show: action.value
          })
        });
      default:
        return state;
    }
  };

  return exports;
});
