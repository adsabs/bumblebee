define(['underscore', './actions', 'js/react/shared/helpers'], function(
  _,
  {
    SET_UPDATE_DATA,
    GET_QID,
    SAVE_NEW_NOTIFICATION,
    ERROR_RESET,
    ERROR,
    CHECK_LOGIN_STATUS,
    setLoginStatus,
    addNotification,
    makeError,
    getQID,
  },
  { middleware }
) {
  const apiSuccess = _.memoize((str) => `${str}_API_REQUEST_SUCCESS`);

  const filterQueryParams = (queryParams) => {
    return Object.keys(queryParams).reduce((acc, k) => {
      if (!k.startsWith('filter_') && !k.startsWith('p_')) {
        acc[k] = queryParams[k];
      }
      return acc;
    }, {});
  };

  const saveNotification = middleware(
    ({ trigger, next, dispatch, action, getState }) => {
      next(action);

      if (action.type === SAVE_NEW_NOTIFICATION) {
        trigger('getCurrentQuery', (currentQuery) => {
          if (currentQuery && currentQuery.toJSON) {
            const queryParams = currentQuery.toJSON();

            // if sort has 'score' then stateful is false
            let stateful = true;
            if (queryParams.sort && queryParams.sort[0].startsWith('score')) {
              stateful = false;
            }
            dispatch({ type: SET_UPDATE_DATA, result: { stateful } });
            dispatch(getQID(filterQueryParams(queryParams)));
          } else {
            dispatch(makeError('Current query not found'));
          }
        });
        dispatch({ type: SET_UPDATE_DATA, result: action.result });
      }

      if (action.type === apiSuccess(GET_QID)) {
        if (action.result && action.result.qid) {
          const qid = action.result.qid;
          const { updateData } = getState();

          dispatch(addNotification({ ...updateData, qid }));
        } else {
          dispatch(makeError('No QID returned from the server'));
        }
      }
    }
  );

  const parseScope = (requestType) => {
    const [scope, status] = requestType.split('_API_REQUEST_');
    return { scope, status };
  };

  const delay = (cb) => {
    if (cb.toKey) {
      window.clearTimeout(cb.toKey);
    }
    cb.toKey = setTimeout(cb, 3000);
  };

  const requestReset = middleware(({ dispatch, next, action }) => {
    next(action);
    if (/_API_REQUEST_(SUCCESS|FAILURE)$/.test(action.type)) {
      const { scope } = parseScope(action.type);

      delay(() => {
        dispatch({ type: `${scope}_RESET` });
      });
    }
  });

  const errorReset = middleware(({ dispatch, next, action }) => {
    next(action);
    if (action.type === ERROR) {
      delay(() => {
        dispatch({ type: ERROR_RESET });
      });
    }
  });

  const loggedInStatus = middleware(({ trigger, dispatch, next, action }) => {
    next(action);

    if (action.type === CHECK_LOGIN_STATUS) {
      trigger('isLoggedIn', (isLoggedIn) => {
        dispatch(setLoginStatus(isLoggedIn));
      });
    }
  });

  return {
    saveNotification,
    requestReset,
    errorReset,
    loggedInStatus,
  };
});
