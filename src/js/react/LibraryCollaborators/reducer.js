define(['underscore', 'redux', './constants'], function(
  _,
  { combineReducers },
  { Permissions }
) {
  const getPermissionType = (type) => {
    if (type.includes('admin')) {
      return Permissions.ADMIN;
    } else if (type.includes('write')) {
      return Permissions.WRITE;
    } else {
      return Permissions.READ;
    }
  };

  const requestState = {
    GET_COLLABORATORS: { status: null, result: null, error: null },
    ADD_COLLABORATOR: { status: null, result: null, error: null },
    EDIT_COLLABORATOR: { status: null, result: null, error: null },
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

  const libraryState = {
    id: null,
    name: null,
    owner: null,
  };
  const library = (state = libraryState, action) => {
    if (action.type === 'SET_INITIAL_DATA' && action.result) {
      return {
        id: action.result.id || state.id,
        name: action.result.name || state.name,
        owner: action.result.owner || state.owner,
      };
    }
    return state;
  };

  const collaboratorsState = {};
  const collaborators = (state = collaboratorsState, action) => {
    if (action.type === 'SET_COLLABORATORS' && action.result) {
      const result = action.result.sort(
        (a, b) => Object.keys(b)[0] - Object.keys(a)[0]
      );
      return result.reduce((acc, collab) => {
        const id = _.uniqueId('collaborator_');
        const keys = Object.keys(collab);
        const role = collab[keys[0]];
        if (role.includes('owner')) {
          return acc;
        }
        return {
          ...acc,
          [id]: {
            id: id,
            email: keys[0],
            permission: getPermissionType(role),
          },
        };
      }, {});
    }
    return state;
  };

  return combineReducers({
    requests,
    library,
    collaborators,
  });
});
