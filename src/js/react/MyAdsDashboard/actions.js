define([], function() {
  const actions = {
    // requests
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    GET_NOTIFICATIONS: 'GET_NOTIFICATIONS',
    GET_NOTIFICATION: 'GET_NOTIFICATION',
    FETCH_CLASSIC_MIRRORS: 'FETCH_CLASSIC_MIRRORS',
    LOGIN_CLASSIC: 'LOGIN_CLASSIC',
    IMPORT_CLASSIC: 'IMPORT_CLASSIC',
    LOGIN_CLASSIC_CHECK: 'LOGIN_CLASSIC_CHECK',
    SET_NOTIFICATION_QUERY_KEY: 'SET_NOTIFICATION_QUERY_KEY',

    // notifications state management
    SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
    EDIT_NOTIFICATION: 'EDIT_NOTIFICATION',
    SET_EDITING_NOTIFICATION: 'SET_EDITING_NOTIFICATION',
    RESET_EDITING_NOTIFICATION: 'RESET_EDITING_NOTIFICATION',
    TOGGLE_ACTIVE: 'TOGGLE_ACTIVE',
    SET_NOTIFICATION_QUERY: 'SET_NOTIFICATION_QUERY',
    GET_NOTIFICATION_QUERIES: 'GET_NOTIFICATION_QUERIES',

    // paging
    GOTO: 'GOTO',

    // imports
    IMPORT_NOTIFICATIONS: 'IMPORT_NOTIFICATIONS',

    // searching
    GET_QUERY_FROM_QID: 'GET_QUERY_FROM_QID',
    RUN_QUERY: 'RUN_QUERY',
  };

  const actionCreators = {
    addNotification: (notification) => ({
      type: 'API_REQUEST',
      scope: actions.ADD_NOTIFICATION,
      options: {
        type: 'POST',
        target: 'vault/notifications',
        data: notification,
      },
    }),
    getNotifications: () => ({
      type: 'API_REQUEST',
      scope: actions.GET_NOTIFICATIONS,
      options: {
        type: 'GET',
        target: 'vault/notifications',
      },
    }),
    getNotification: (id) => ({
      type: 'API_REQUEST',
      scope: actions.GET_NOTIFICATION,
      options: {
        type: 'GET',
        target: `vault/notifications/${id}`,
      },
    }),
    updateNotification: (notification) => ({
      type: 'API_REQUEST',
      scope: actions.UPDATE_NOTIFICATION,
      options: {
        type: 'PUT',
        target: `vault/notifications/${notification.id}`,
        data: notification,
      },
    }),
    removeNotification: (id) => ({
      type: 'API_REQUEST',
      scope: actions.REMOVE_NOTIFICATION,
      options: {
        type: 'DELETE',
        target: `vault/notifications/${id}`,
      },
    }),
    fetchClassicMirrors: () => ({
      type: 'API_REQUEST',
      scope: actions.FETCH_CLASSIC_MIRRORS,
      options: {
        type: 'GET',
        target: 'harbour/mirrors',
      },
    }),
    loginClassic: (data) => ({
      type: 'API_REQUEST',
      scope: actions.LOGIN_CLASSIC,
      options: {
        type: 'POST',
        target: 'harbour/auth/classic',
        data: data,
      },
    }),
    loginClassicCheck: () => ({
      type: 'API_REQUEST',
      scope: actions.LOGIN_CLASSIC_CHECK,
      options: {
        type: 'GET',
        target: 'harbour/user',
      },
    }),
    importClassic: () => ({
      type: 'API_REQUEST',
      scope: actions.IMPORT_CLASSIC,
      options: {
        type: 'GET',
        target: 'vault/myads-import',
      },
    }),
    importNotifications: () => ({ type: actions.IMPORT_NOTIFICATIONS }),
    goTo: (payload) => ({ type: actions.GOTO, payload }),
    editNotification: (id) => ({ type: actions.EDIT_NOTIFICATION, id }),
    toggleActive: (id) => ({ type: actions.TOGGLE_ACTIVE, id }),
    getNotificationQueries: (id) => ({
      type: 'API_REQUEST',
      scope: actions.GET_NOTIFICATION_QUERIES,
      options: {
        type: 'GET',
        target: `vault/notification_query/${id}`,
      },
    }),
    getQueryFromQID: (qid) => ({
      type: 'API_REQUEST',
      scope: 'GET_QUERY_FROM_QID',
      options: {
        type: 'GET',
        target: `vault/query/${qid}`,
      },
    }),
    runQuery: (id, queryKey) => ({
      type: 'RUN_QUERY',
      payload: {
        id,
        queryKey,
      },
    }),
  };

  return {
    ...actions,
    ...actionCreators,
  };
});
