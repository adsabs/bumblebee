define(['js/page_managers/controller'], function(PageManagerController) {
  const PageManager = PageManagerController.extend({
    async assemble() {
      // noop
    },

    /**
     * This method will create the view, really this is a container for the react
     * widget to render into, the list of widgets should be passed by the page manager
     */
    createView({ widgets = {} }) {
      const keys = Object.keys(widgets);
      const widget = keys.length > 0 ? keys[0] : null;

      if (widget) {
        const inner = document.createElement('div');
        inner.setAttribute('data-widget', widget);
        const el = document.createElement('div');
        el.appendChild(inner);
        return new Backbone.View({
          el,
        });
      }
      return new Backbone.View();
    },
  });

  return PageManager;
});
