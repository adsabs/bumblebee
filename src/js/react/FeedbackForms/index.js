define([
  'js/react/BumblebeeWidget',
  'js/react/FeedbackForms/components/App.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'react-redux',
  'js/react/FeedbackForms/actions',
  'js/react/FeedbackForms/middleware',
  'js/react/FeedbackForms/reducer',
  'js/react/shared/helpers',
  'js/react/shared/middleware/index',
], function(
  BumblebeeWidget,
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
  const actionCreators = {};
  const middlewares = [middleware, ...sharedMiddleware];

  const BackboneView = WithBackboneView(connect(mapStateToProps, actionCreators)(App.default), (context) =>
    configureStore(context, reducer, withContext(...middlewares))
  );

  return BumblebeeWidget.extend({
    initialize() {
      this.view = new BackboneView();
      BumblebeeWidget.prototype.initialize.call(this, { componentId: 'FeedbackForms', ...arguments });
    },
  });
});
