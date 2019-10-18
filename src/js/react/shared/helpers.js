define([], function () {

  /**
   * middleware wrapper with a function that, when called,
   * binds it's first argument to the first argument of the middleware function
   * returns the wrapped middleware function
   *
   * This will also combine middlewares passed as arguments into a single object
   */
  const withContext = (...args) => context => {
    const fns = args.reduce((acc, a) => ({ ...acc, ...a }), {});
    return Object.keys(fns).map(key => fns[key].bind(null, context));
  }

  return {
    withContext
  };
})
