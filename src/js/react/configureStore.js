define(['redux'], function(
  {Redux, createStore, applyMiddleware, compose}
) {
  const configureStore = (context, rootReducer, rootMiddleware) => {
    const middleware = applyMiddleware.apply(Redux, rootMiddleware(context));
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const store = createStore(rootReducer, composeEnhancers(middleware));
    return store;
  };

  return configureStore;
});
