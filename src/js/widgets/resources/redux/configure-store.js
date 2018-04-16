'use strict';
define([
  'redux',
  'redux-thunk',
  'es6!./modules/resources-app',
  'redux-immutable'
], function (Redux, ReduxThunk, ResourcesApp, ReduxImmutable) {

  const { createStore, applyMiddleware } = Redux;
  const { combineReducers } = ReduxImmutable;

  return function configureStore(context) {
    const middleware = applyMiddleware(ReduxThunk.default.withExtraArgument(context));
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
    const reducer = combineReducers({
        ResourcesApp: ResourcesApp.reducer
    });
    const store = createStore(reducer, composeEnhancers(middleware));
    return store;
  };
});
