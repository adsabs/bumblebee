define([], function() {
  // Action Constants
  const UPDATE_SELECTED = 'UPDATE_SELECTED';
  const UPDATE_MODE = 'UPDATE_MODE';

  // Action Creators
  const updateSelected = (value) => ({ type: UPDATE_SELECTED, value });
  const updateMode = (value) => ({ type: UPDATE_MODE, value });
  const sendEvent = (event) => (dispatch, getState, widget) => {
    const { selected } = getState();
    widget.fireOrcidEvent(event, selected);
  };

  // initial state
  const initialState = {
    selected: [],
    mode: false,
  };

  // reducer
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case UPDATE_SELECTED:
        return { ...state, selected: action.value };
      case UPDATE_MODE:
        return { ...state, mode: action.value };
      default:
        return initialState;
    }
  };

  return {
    updateSelected: updateSelected,
    updateMode: updateMode,
    sendEvent: sendEvent,
    reducer: reducer,
  };
});
