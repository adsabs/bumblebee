define([
  'redux',
  'js/widgets/associated/redux/modules/api',
  'js/widgets/associated/redux/modules/ui',
  'js/widgets/associated/redux/middleware/api',
  'js/widgets/associated/redux/middleware/ui',
], function(Redux, api, ui, apiMiddleware, uiMiddleware) {
  const { createStore, applyMiddleware, combineReducers } = Redux;

  return function configureStore(context) {
    const middleware = applyMiddleware.apply(Redux, [...uiMiddleware, ...apiMiddleware(context)]);
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
    const reducer = combineReducers({
      api: api.reducer,
      ui: ui.reducer,
    });
    const store = createStore(reducer, composeEnhancers(middleware));
    return store;
  };
});
