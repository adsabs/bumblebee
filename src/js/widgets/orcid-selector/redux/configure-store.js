define(['redux', 'redux-thunk', 'es6!js/widgets/orcid-selector/redux/modules/orcid-selector-app'], function(
  Redux,
  ReduxThunk,
  OrcidSelectorApp
) {
  const { createStore, applyMiddleware } = Redux;

  return function configureStore(context) {
    const middleware = applyMiddleware(
      ReduxThunk.default.withExtraArgument(context)
    );
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
    return createStore(OrcidSelectorApp.reducer, composeEnhancers(middleware));
  };
});
