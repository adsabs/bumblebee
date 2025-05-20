define(['lodash/dist/lodash.compat', 'js/widgets/export/widget.jsx'], function(_, ExportWidget) {
  var Widget = ExportWidget.extend({
    initialize: function(options) {
      // other widgets can send us data through page manager
      this.on('page-manager-message', function(event, data) {
        if (event === 'broadcast-payload') {
          this.ingestBroadcastedPayload(data);
        }
      });
      ExportWidget.prototype.initialize.call(this, options);
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      _.bindAll(this, 'setCurrentQuery', 'processResponse');
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      ExportWidget.prototype.activate.call(this, beehive);
    },

    ingestBroadcastedPayload: function(bibcode) {
      if (bibcode) {
        this.bibcode = bibcode;
      }
    },

    setSubView: function(format) {
      if (this.bibcode && format) {
        this.renderWidgetForListOfBibcodes([this.bibcode], { format: format });
      }
    },
  });

  return Widget;
});
