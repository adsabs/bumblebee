define([], function() {
  const reactify = {
    load: (name, req, onload, config) => {
      // for a build, only register
      if (config.isBuild) {
        return onload();
      }

      const parts = name.split('?');
      const module = parts[0];
      const component = parts[1];
      return req(
        [module, `js/react/${component}/index`],
        (loadedModule, Component) => {
          // inject the react component as the view
          onload(
            loadedModule.extend({
              initialize: function(args) {
                this.view = new Component();
                loadedModule.prototype.initialize.call(this, {
                  componentId: component,
                  ...args,
                });
              },
            })
          );
        }
      );
    },
  };

  return reactify;
});
