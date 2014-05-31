// Break out the application running from the configuration definition to
// assist with testing.
console.log('loading: main.js');

require(["config"], function(config) {
  // Kick off the application
  require(["app", "router"], function(app, Router) {
      console.log('app object:');
      console.log(app);
      console.log(Router);
    // Define your master router on the application namespace and trigger all
    // navigation from this instance.
    app.router = new Router();

    // Trigger the initial route and enable HTML5 History API support, set the
    // root folder to '/' by default.  Change in app.js.
    Backbone.history.start({
      pushState: true,
      root: app.root
    });
  });
});
