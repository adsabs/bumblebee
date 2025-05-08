define([
  'js/react/BumblebeeWidget',
  'js/react/Recommender/components/App.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'js/react/Recommender/middleware',
  'js/react/Recommender/reducer',
  'js/react/shared/helpers',
  'js/react/shared/middleware/index',
], function(
  BumblebeeWidget,
  App,
  WithBackboneView,
  configureStore,
  middleware,
  reducer,
  { withContext },
  sharedMiddleware
) {
  const middlewares = [middleware, ...sharedMiddleware];

  const BackboneView = WithBackboneView(App, (context) => configureStore(context, reducer, withContext(...middlewares)));

  return BumblebeeWidget.extend({
    initialize() {
      this.view = new BackboneView();
      BumblebeeWidget.prototype.initialize.call(this, { componentId: 'Recommender', ...arguments });
    },
  });
});
