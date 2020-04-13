define(['redux', './actions'], function(
  { combineReducers },
  { SET_DOCS, SET_QUERY, SET_TAB, SET_ORACLE_TARGET, SET_QUERY_PARAMS }
) {
  const requestState = {
    GET_RECOMMENDATIONS: { status: null, result: null, error: null },
    GET_DOCS: { status: null, result: null, error: null },
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
    }

    if (/_RESET$/.test(action.type)) {
      const scope = action.type.replace('_RESET', '');
      return {
        ...state,
        [scope]: requestState[scope],
      };
    }
    return state;
  };

  const docsState = [];
  const docs = (state = docsState, action) => {
    if (action.type === SET_DOCS && action.payload) {
      return action.payload.map((doc) => ({
        ...doc,
        title: doc.title[0],
        totalAuthors: doc.author_count,
      }));
    }
    return state;
  };

  const queryState = null;
  const query = (state = queryState, action) => {
    if (action.type === SET_QUERY && action.payload) {
      return action.payload;
    }
    return state;
  };

  const tabState = 2;
  const tab = (state = tabState, action) => {
    if (action.type === SET_TAB && action.payload) {
      return action.payload;
    }
    return state;
  };

  const oracleTargetState = '_oracle/readhist';
  const oracleTarget = (state = oracleTargetState, action) => {
    if (action.type === SET_ORACLE_TARGET && action.payload) {
      return action.payload;
    }
    return state;
  };

  const queryParamsState = {
    function: 'similar',
    sort: 'entry_date',
    numDocs: 5,
    cutoffDays: 5,
    topNReads: 10,
  };
  const queryParams = (state = queryParamsState, action) => {
    if (action.type === SET_QUERY_PARAMS && action.payload) {
      return {
        ...state,
        ...action.payload,
      };
    }
    return state;
  };

  return combineReducers({
    requests,
    docs,
    query,
    tab,
    oracleTarget,
    queryParams,
  });
});
