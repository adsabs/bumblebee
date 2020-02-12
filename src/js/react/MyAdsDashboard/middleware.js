define(['underscore', './actions', './constants'], function(
  _,
  actions,
  { page }
) {
  const {
    SET_NOTIFICATIONS,
    SET_EDITING_NOTIFICATION,
    RESET_EDITING_NOTIFICATION,
    TOGGLE_ACTIVE,
    getQuery,
    runQuery,
    goTo,
    getNotifications,
    updateNotification,
  } = actions;

  const delay = (cb) => {
    if (cb.toKey) {
      window.clearTimeout(cb.toKey);
    }
    cb.toKey = setTimeout(cb, 3000);
  };
  const apiSuccess = _.memoize((str) => `${str}_API_REQUEST_SUCCESS`);

  const parseScope = (requestType) => {
    const [scope, status] = requestType.split('_API_REQUEST_');
    return { scope, status };
  };

  const resetAfterRequest = ({ trigger }, { dispatch }) => (next) => (
    action
  ) => {
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

  const updateNotifications = ({ trigger }, { dispatch, getState }) => (
    next
  ) => (action) => {
    next(action);

    /**
     * Set the current notifications after a successful GET
     */
    if (action.type === apiSuccess('GET_NOTIFICATIONS')) {
      dispatch({ type: SET_NOTIFICATIONS, result: action.result });
    }

    if (action.type === apiSuccess('GET_NOTIFICATION')) {
      const result = action.result[0];

      if (getState().runQuery) {
        dispatch(runQuery(false));
        dispatch(getQuery(result.qid));
        return;
      }

      // After requesting a single notification, set it as the active editing one
      dispatch({ type: SET_EDITING_NOTIFICATION, result });
      const { notifications } = getState();
      const { template, type } = notifications[result.id];
      let form;
      if (type === 'query') {
        form = page['GENERAL_FORM'];
      } else {
        form = page[`${template.toUpperCase()}_FORM`];
      }
      dispatch(goTo(form));
    }

    if (action.type === apiSuccess('GET_QUERY')) {
      if (action.result && action.result.query) {
        try {
          trigger('doSearch', JSON.parse(action.result.query).query);
        } catch (event) {
          console.error(event);
        }
      } else {
        console.error('no query found');
      }
      setTimeout(() => {
        dispatch(goTo(page.DASHBOARD));
      }, 1000);
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
  const resetEditingNotificationAfterGoTo = (
    { trigger },
    { dispatch, getState }
  ) => (next) => (action) => {
    next(action);

    if (action.type === 'GOTO' && action.payload === page.DASHBOARD) {
      dispatch({ type: RESET_EDITING_NOTIFICATION });
    }
  };

  const importNotifications = ({ trigger }, { dispatch, getState }) => (
    next
  ) => (action) => {
    next(action);

    if (action.type === 'IMPORT_NOTIFICATIONS') {
      dispatch(goTo(page.IMPORT_NOTIFICATIONS));
    }
  };

  const reloadNotificationsAfterGoTo = (
    { trigger },
    { dispatch, getState }
  ) => (next) => (action) => {
    next(action);

    if (action.type === 'GOTO' && action.payload === page.DASHBOARD) {
      dispatch(getNotifications());
    }
  };

  return {
    resetAfterRequest,
    updateNotifications,
    resetEditingNotificationAfterGoTo,
    importNotifications,
    reloadNotificationsAfterGoTo,
  };
});
