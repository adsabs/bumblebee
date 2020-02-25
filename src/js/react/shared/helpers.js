define([], function() {
  /**
   * middleware wrapper with a function that, when called,
   * binds it's first argument to the first argument of the middleware function
   * returns the wrapped middleware function
   *
   * This will also combine middlewares passed as arguments into a single object
   */
  const withContext = (...args) => (context) => {
    const fns = args.reduce((acc, a) => ({ ...acc, ...a }), {});
    return Object.keys(fns).map((key) => fns[key].bind(null, context));
  };

  const escape = (string) => {
    return string.replace(/(['"])/g, '\\$1');
  };

  const unescape = (string) => {
    return string.replace(/\\(["'])/g, '$1');
  };

  const isEmpty = (value) => {
    return !(typeof value === 'string' && value.length > 0);
  };

  const middleware = (callback) => {
    return ({ trigger }, { dispatch, getState }) => (next) => (action) =>
      callback({ trigger, dispatch, getState, next, action });
  };

  const apiSuccess = _.memoize((str) => `${str}_API_REQUEST_SUCCESS`);
  const apiPending = _.memoize((str) => `${str}_API_REQUEST_PENDING`);
  const apiFailure = _.memoize((str) => `${str}_API_REQUEST_FAILURE`);

  const parseScope = (requestType) => {
    const [scope, status] = requestType.split('_API_REQUEST_');
    return { scope, status };
  };

  const delay = (cb) => {
    if (cb.toKey) {
      window.clearTimeout(cb.toKey);
    }
    cb.toKey = setTimeout(cb, 3000);
  };

  return {
    withContext,
    escape,
    unescape,
    middleware,
    isEmpty,
    apiSuccess,
    apiPending,
    apiFailure,
    parseScope,
    delay,
  };
});
