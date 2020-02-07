define([
  'es6!./components/Dashboard.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'react-redux',
  './actions',
  './middleware',
  './reducer',
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

  const {
    getInitialData,
    getCollaborators,
    addCollaborator,
    editCollaborator,
  } = actions;

  const actionCreators = {
    getInitialData,
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
