// this module is not loaded directly, it must be loaded using reactify!
// in order for the view to be dynamically injected

define([
  'underscore',
  'js/widgets/base/base_widget'
], function (_, BaseWidget) {

  const BumblebeeWidget = BaseWidget.extend({
    initialize: function ({ componentId }) {
      this.view.on({
        sendRequest: _.bind(this.onSendRequest, this)
      });

      this.listenTo(this, 'page-manager-message', (ev, data) => {
        if (ev === 'widget-selected' && data.idAttribute === componentId) {
          this.view.destroy().render();
        }
      });
    },
    activate: function (beehive) {
      this.setBeeHive(beehive);
    },
    onSendRequest: function (options) {
      // send a request
    },
  });

  return BumblebeeWidget;
})
