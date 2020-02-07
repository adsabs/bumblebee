define([], function() {
  const reactify = {
    load: function(name, req, onload) {
      const parts = name.split('?');
      const module = parts[0];
      const component = parts[1];
      req(
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
