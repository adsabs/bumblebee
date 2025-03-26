define([
  'es6!js/react/LibraryCollaborators/components/Dashboard.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'react-redux',
  'js/react/LibraryCollaborators/actions',
  'js/react/LibraryCollaborators/middleware',
  'js/react/LibraryCollaborators/reducer',
  'js/react/shared/helpers',
  'js/react/shared/middleware/index',
], function(
  Dashboard,
  WithBackboneView,
  configureStore,
  { connect },
  actions,
  middleware,
  reducer,
  { withContext },
  sharedMiddleware
) {
  const mapStateToProps = ({ library, collaborators, requests }) => ({
    library,
    permissions: collaborators,
    requests: {
      add: requests.ADD_COLLABORATOR,
      get: requests.GET_COLLABORATORS,
      edit: requests.EDIT_COLLABORATOR,
    },
  });

  const { getCollaborators, addCollaborator, editCollaborator } = actions;

  const actionCreators = {
    getCollaborators,
    addCollaborator,
    editCollaborator,
  };

  const middlewares = [middleware, ...sharedMiddleware];

  return WithBackboneView(
    connect(mapStateToProps, actionCreators)(Dashboard),
    (context) => configureStore(context, reducer, withContext(...middlewares))
  );
});
