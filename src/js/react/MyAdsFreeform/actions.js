define([], function() {
  const actions = {
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    ERROR_RESET: 'ERROR_RESET',
    ERROR: 'ERROR',
    GET_QID: 'GET_QID',
    RESET: 'RESET',
    SAVE_NEW_NOTIFICATION: 'SAVE_NEW_NOTIFICATION',
    SET_UPDATE_DATA: 'SET_UPDATE_DATA',
    SET_LOGIN_STATUS: 'SET_LOGIN_STATUS',
    CHECK_LOGIN_STATUS: 'CHECK_LOGIN_STATUS',
  };
  const actionCreators = {
    addNotification: (notification) => ({
      type: 'API_REQUEST',
      scope: actions.ADD_NOTIFICATION,
      options: {
        type: 'POST',
        target: 'vault/notifications',
        data: { ...notification, type: 'query' },
      },
    }),
    getQID: (queryParams) => ({
      type: 'API_REQUEST',
      scope: actions.GET_QID,
      options: {
        type: 'POST',
        target: 'vault/query',
        data: queryParams,
      },
    }),
    saveNewNotification: (notification) => ({
      type: actions.SAVE_NEW_NOTIFICATION,
      result: notification,
    }),
    makeError: (error) => ({
      type: actions.ERROR,
      result: error,
    }),
    reset: () => ({
      type: actions.RESET,
    }),
    checkLoginStatus: () => ({
      type: actions.CHECK_LOGIN_STATUS,
    }),
    setLoginStatus: (result) => ({
      type: actions.SET_LOGIN_STATUS,
      result,
    }),
  };

  return {
    ...actions,
    ...actionCreators,
  };
});
