define([
  'es6!js/react/MyAdsDashboard/components/App.jsx',
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
  const mapStateToProps = ({ page, editingNotification }) => ({
    page,
    editingNotification,
  });

  const { goTo } = actions;

  const actionCreators = {
    goTo,
  };

  return WithBackboneView(
    connect(
      mapStateToProps,
      actionCreators
    )(App),
    (context) =>
      configureStore(
        context,
        reducer,
        withContext(middleware, sharedMiddleware)
      )
  );
});
