define([
  'es6!js/react/Recommender/components/App.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'js/react/Recommender/middleware',
  'js/react/Recommender/reducer',
  'js/react/shared/helpers',
  'js/react/shared/middleware/index',
], function(
  App,
  WithBackboneView,
  configureStore,
  middleware,
  reducer,
  { withContext },
  sharedMiddleware
) {
  const middlewares = [middleware, ...sharedMiddleware];

  return WithBackboneView(App, (context) =>
    configureStore(context, reducer, withContext(...middlewares))
  );
});
