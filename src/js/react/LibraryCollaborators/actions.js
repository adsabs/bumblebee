define([], function() {
  const getPermissionMap = (id) => {
    switch (id) {
      case 'read':
        return { read: true, write: false, admin: false };
      case 'write':
        return { read: false, write: true, admin: false };
      case 'admin':
        return { read: false, write: false, admin: true };
      default:
        return { read: false, write: false, admin: false };
    }
  };

  const actions = {
    // ADD
    ADD_COLLABORATOR: 'ADD_COLLABORATOR',

    // GET
    GET_COLLABORATORS: 'GET_COLLABORATORS',

    // EDIT
    EDIT_COLLABORATOR: 'EDIT_COLLABORATOR',

    // app state
    GET_INITIAL_DATA: 'GET_INITIAL_DATA',
    SET_COLLABORATORS: 'SET_COLLABORATORS',
  };
  const actionCreators = {
    getCollaborators: (id) => ({
      type: 'API_REQUEST',
      scope: actions.GET_COLLABORATORS,
      options: {
        type: 'GET',
        target: `biblib/permissions/${id}`,
      },
    }),
    addCollaborator: ({ id, email, permission }) => ({
      type: 'API_REQUEST',
      scope: actions.ADD_COLLABORATOR,
      options: {
        type: 'POST',
        target: `biblib/permissions/${id}`,
        data: {
          email,
          permission: getPermissionMap(permission && permission.id),
        },
      },
    }),
    editCollaborator: ({ id, email, permission }) => ({
      type: 'API_REQUEST',
      scope: actions.EDIT_COLLABORATOR,
      options: {
        type: 'POST',
        target: `biblib/permissions/${id}`,
        data: {
          email,
          permission: getPermissionMap(permission && permission.id),
        },
      },
    }),
    getInitialData: () => ({
      type: actions.GET_INITIAL_DATA,
    }),
  };

  return {
    ...actions,
    ...actionCreators,
  };
});
