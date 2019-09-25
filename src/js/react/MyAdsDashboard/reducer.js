define(['./actions', 'redux', './constants'], function(
  actions,
  { combineReducers },
  { page: PAGE }
) {
  const {
    SET_NOTIFICATIONS,
    SET_EDITING_NOTIFICATION,
    RESET_EDITING_NOTIFICATION,
    GOTO,
    RUN_QUERY,
  } = actions;

  /**
   * @typedef {Object.<string, import('./typedefs').Notification>} NotificationState
   */

  /** @type {NotificationState} */
  const notificationsState = {};
  const notifications = (state = notificationsState, action) => {
    if (action.type === SET_NOTIFICATIONS && action.result) {
      return action.result.reduce(
        (acc, entry) => ({ ...acc, [entry.id]: entry }),
        {}
      );
    }
    return state;
  };

  const editingNotificationState = null;
  const editingNotification = (state = editingNotificationState, action) => {
    if (action.type === SET_EDITING_NOTIFICATION && action.result) {
      return action.result;
    }

    if (action.type === RESET_EDITING_NOTIFICATION) {
      return editingNotificationState;
    }

    return state;
  };

  /** @type {string} */
  const pageState = PAGE.DASHBOARD;
  const page = (state = pageState, action) => {
    if (action.type === GOTO && action.payload) {
      return action.payload;
    }
    return state;
  };

  const runQueryState = false;
  const runQuery = (state = runQueryState, action) => {
    if (action.type === RUN_QUERY && action.result) {
      return action.result;
    }
    return state;
  };

  /**
   * @typedef {Object.<string, import('./typedefs').Request>} RequestState
   */

  /** @type {RequestState} */
  const requestState = {
    ADD_NOTIFICATION: { status: null, result: null, error: null },
    GET_NOTIFICATIONS: { status: null, result: null, error: null },
    GET_NOTIFICATION: { status: null, result: null, error: null },
    UPDATE_NOTIFICATION: { status: null, result: null, error: null },
    REMOVE_NOTIFICATION: { status: null, result: null, error: null },
    FETCH_CLASSIC_MIRRORS: { status: null, result: null, error: null },
    LOGIN_CLASSIC: { status: null, result: null, error: null },
    LOGIN_CLASSIC_CHECK: { status: null, result: null, error: null },
    IMPORT_CLASSIC: { status: null, result: null, error: null },
    GET_QUERY: { status: null, result: null, error: null },
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

  return combineReducers({
    notifications,
    page,
    runQuery,
    requests,
    editingNotification,
  });
});
