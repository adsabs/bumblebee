define([
  'js/react/BumblebeeWidget',
  'js/react/MyAdsDashboard/components/App.jsx',
  'js/react/WithBackboneView',
  'js/react/configureStore',
  'react-redux',
  './actions',
  './middleware',
  './reducer',
  'js/react/shared/helpers',
  'js/react/shared/middleware/api',
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
  const mapStateToProps = ({ page, editingNotification }) => ({
    page,
    editingNotification,
  });

  const { goTo } = actions;

  const actionCreators = {
    goTo,
  };

  const BackboneView = WithBackboneView(connect(mapStateToProps, actionCreators)(App), (context) =>
    configureStore(context, reducer, withContext(middleware, sharedMiddleware))
  );

  return BumblebeeWidget.extend({
    initialize() {
      this.view = new BackboneView();
      BumblebeeWidget.prototype.initialize.call(this, { componentId: 'MyADSDashboard', ...arguments });
    },
  });
});
