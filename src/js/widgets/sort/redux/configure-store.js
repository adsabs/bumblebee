define(['redux', 'redux-thunk', 'es6!js/widgets/sort/redux/modules/sort-app'], function(
  Redux,
  ReduxThunk,
  SortApp
) {
  const { createStore, applyMiddleware } = Redux;

  return function configureStore(context) {
    const middleware = applyMiddleware(
      ReduxThunk.default.withExtraArgument(context)
    );
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
    return createStore(SortApp.reducer, composeEnhancers(middleware));
  };
});
