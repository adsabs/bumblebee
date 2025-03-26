define([
  'es6!js/react/MyAdsFreeform/components/App.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'react-redux',
  'js/react/MyAdsFreeform/actions',
  'js/react/MyAdsFreeform/middleware',
  'js/react/MyAdsFreeform/reducer',
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
