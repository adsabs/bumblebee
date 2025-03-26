define([
  'es6!js/react/FeedbackForms/components/App.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'react-redux',
  'js/react/FeedbackForms/actions',
  'js/react/FeedbackForms/middleware',
  'js/react/FeedbackForms/reducer',
  'js/react/shared/helpers',
  'js/react/shared/middleware/index',
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
  const mapStateToProps = ({}) => ({});
  const {} = actions;
  const actionCreators = {};
  const middlewares = [middleware, ...sharedMiddleware];

  return WithBackboneView(
    connect(mapStateToProps, actionCreators)(App),
    (context) => configureStore(context, reducer, withContext(...middlewares))
  );
});
