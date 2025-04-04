define([
  'underscore',
  'js/react/MyAdsDashboard/actions',
  'js/react/MyAdsDashboard/constants',
  'js/react/shared/helpers',
], function(_, actions, { page }, { middleware, apiSuccess }) {
  const {
    SET_NOTIFICATIONS,
    SET_EDITING_NOTIFICATION,
    RESET_EDITING_NOTIFICATION,
    TOGGLE_ACTIVE,
    SET_NOTIFICATION_QUERY_KEY,
    RUN_QUERY,
    goTo,
    getNotifications,
    updateNotification,
    getNotificationQueries,
  } = actions;

  const delay = (cb) => {
    if (cb.toKey) {
      window.clearTimeout(cb.toKey);
    }
    cb.toKey = setTimeout(cb, 3000);
  };

  const parseScope = (requestType) => {
    const [scope, status] = requestType.split('_API_REQUEST_');
    return { scope, status };
  };

  const resetAfterRequest = (_, { dispatch }) => (next) => (action) => {
    next(action);

    if (/_API_REQUEST_(SUCCESS|FAILURE)$/.test(action.type)) {
      const { scope } = parseScope(action.type);

      // don't bother if we are getting the full list
      if (scope === 'GET_NOTIFICATIONS') {
        return;
      }

      delay(() => {
        dispatch({ type: `${scope}_RESET` });
      });
    }
  };

  const runQueries = middleware(
    ({ action, next, dispatch, trigger, getState }) => {
      next(action);

      if (action.type === RUN_QUERY) {
        const { id, queryKey } = action.payload;

        dispatch({
          type: SET_NOTIFICATION_QUERY_KEY,
          payload: queryKey,
        });
        dispatch(getNotificationQueries(id));
      }

      if (action.type === apiSuccess('GET_NOTIFICATION_QUERIES')) {
        const queryKey = getState().queryKey;
        if (queryKey !== null && action.result && action.result.length > 0) {
          try {
            trigger('doSearch', action.result[queryKey]);
          } catch (e) {
            dispatch(goTo(page.DASHBOARD));
          }
        }

        // reset queryKey
        dispatch({
          type: SET_NOTIFICATION_QUERY_KEY,
          payload: null,
        });
      }
    }
  );

  const updateNotifications = (__, { dispatch, getState }) => (next) => (
    action
  ) => {
    next(action);

    /**
     * Set the current notifications after a successful GET
     */
    if (action.type === apiSuccess('GET_NOTIFICATIONS')) {
      dispatch({ type: SET_NOTIFICATIONS, result: action.result });
    }

    if (action.type === apiSuccess('GET_NOTIFICATION')) {
      const result = action.result[0];

      // After requesting a single notification, set it as the active editing one
      dispatch({ type: SET_EDITING_NOTIFICATION, result });
      const { notifications } = getState();
      const { template, type } = notifications[result.id];
      let form;
      if (type === 'query') {
        form = page.GENERAL_FORM;
      } else {
        form = page[`${template.toUpperCase()}_FORM`];
      }
      dispatch(goTo(form));
    }

    if (action.type === TOGGLE_ACTIVE) {
      const { notifications } = getState();
      const item = notifications[action.id];
      if (item) {
        dispatch(
          updateNotification({
            ...notifications[action.id],
            active: !notifications[action.id].active,
          })
        );
      }
    }

    if (
      action.type === apiSuccess('UPDATE_NOTIFICATION') ||
      action.type === apiSuccess('REMOVE_NOTIFICATION') ||
      action.type === apiSuccess('ADD_NOTIFICATION')
    ) {
      dispatch(getNotifications());
    }
  };

  /**
   * When going to dashboard, reset the current editing notification
   */
  const resetEditingNotificationAfterGoTo = (_, { dispatch }) => (next) => (
    action
  ) => {
    next(action);

    if (action.type === 'GOTO' && action.payload === page.DASHBOARD) {
      dispatch({ type: RESET_EDITING_NOTIFICATION });
    }
  };

  const importNotifications = (_, { dispatch }) => (next) => (action) => {
    next(action);

    if (action.type === 'IMPORT_NOTIFICATIONS') {
      dispatch(goTo(page.IMPORT_NOTIFICATIONS));
    }
  };

  const reloadNotificationsAfterGoTo = (_, { dispatch }) => (next) => (
    action
  ) => {
    next(action);

    if (action.type === 'GOTO' && action.payload === page.DASHBOARD) {
      dispatch(getNotifications());
    }
  };

  const updateOnNavigate = middleware(
    ({ action, next, dispatch, getState }) => {
      next(action);

      if (action.type === 'NAVIGATE/MyAdsDashboard') {
        if (getState().requests.GET_NOTIFICATIONS.status !== 'pending') {
          dispatch(getNotifications());
        }
      }
    }
  );

  return {
    resetAfterRequest,
    updateNotifications,
    resetEditingNotificationAfterGoTo,
    importNotifications,
    reloadNotificationsAfterGoTo,
    runQueries,
    updateOnNavigate,
  };
});
