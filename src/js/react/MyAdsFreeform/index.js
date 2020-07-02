define([
  'es6!./components/App.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'react-redux',
  './actions',
  './middleware',
  './reducer',
  'js/react/shared/helpers',
  'js/react/shared/middleware/api',
], function(
  App,
  WithBackboneView,
  configureStore,
  { connect },
  actions,
  middleware,
  reducer,
  { withContext },
  sharedMiddleware
) {
  const mapStateToProps = ({ requests, generalError, loggedIn }) => ({
    requests: {
      addNotification: requests.ADD_NOTIFICATION,
      getQID: requests.GET_QID,
    },
    loggedIn,
    generalError,
  });
  const { saveNewNotification, checkLoginStatus } = actions;
  const actionCreators = {
    saveNewNotification,
    checkLoginStatus,
  };

  return WithBackboneView(
    connect(mapStateToProps, actionCreators)(App),
    (context) =>
      configureStore(
        context,
        reducer,
        withContext(middleware, sharedMiddleware)
      )
  );
});
