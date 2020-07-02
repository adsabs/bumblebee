define(['redux', './actions'], function(
  { combineReducers },
  { SET_UPDATE_DATA, RESET, ERROR, ERROR_RESET, SET_LOGIN_STATUS }
) {
  const requestState = {
    ADD_NOTIFICATION: { status: null, result: null, error: null },
    GET_QID: { status: null, result: null, error: null },
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
    } else if (/_RESET$/.test(action.type)) {
      const scope = action.type.replace('_RESET', '');
      return {
        ...state,
        [scope]: requestState[scope],
      };
    }
    return state;
  };

  const updateDataState = null;
  const updateData = (state = updateDataState, action) => {
    if (action.type === SET_UPDATE_DATA) {
      return { ...state, ...action.result };
    }
    if (action.type === RESET) {
      return updateDataState;
    }
    return state;
  };

  const generalErrorState = null;
  const generalError = (state = generalErrorState, action) => {
    if (action.type === ERROR && action.result) {
      return action.result;
    }
    if (action.type === RESET || action.type === ERROR_RESET) {
      return generalErrorState;
    }
    return state;
  };

  const loggedInState = false;
  const loggedIn = (state = loggedInState, action) => {
    if (action.type === SET_LOGIN_STATUS) {
      return action.result;
    }
    return state;
  };

  return combineReducers({
    requests,
    updateData,
    generalError,
    loggedIn,
  });
});
