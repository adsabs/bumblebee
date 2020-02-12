define(['js/widgets/metrics/widget', 'js/components/api_feedback'], function(
  MetricsWidget,
  ApiFeedback
) {
  var Widget = MetricsWidget.extend({
    initialize: function(options) {
      var name = 'ShowMetrics';
      var handlePMMessages = function(event, data) {
        if (event === 'broadcast-payload') {
          this.payload = data;

          // if these happen out of order, then broadcast payload now
          if (this.canLoad) {
            this.ingestBroadcastedPayload(this.payload);
          }
          this.canLoad = false;
        }

        if (
          event === 'widget-selected' &&
          data.idAttribute === name &&
          !this.canLoad
        ) {
          this.canLoad = true;
          this.payload && this.ingestBroadcastedPayload(this.payload);
        }
      };

      this.on('page-manager-message', handlePMMessages);
      this.on('page-manager-event', handlePMMessages);

      MetricsWidget.prototype.initialize.apply(this, arguments);
    },

    ingestBroadcastedPayload: function(data) {
      // quit out early if the bibcodes match
      if (this._bibcode === data.bibcode) {
        return;
      }
      this._bibcode = data.bibcode;
      var self = this;
      this.containerModel.set('title', data.title);
      this.getMetrics([this._bibcode])
        .done(function() {
          self._closed = false;
          // Everything worked, show the widget
          self.trigger('page-manager-event', 'widget-ready', {
            isActive: true,
            widget: self,
          });
          if (self._waiting) {
            self.onShow();
            self._waiting = false;
          }
        })
        .fail(function() {
          self._closed = true;
          // if the metrics fail, kill it
          self.trigger('page-manager-event', 'widget-ready', {
            isActive: false,
            widget: self,
            shouldReset: true,
          });
        });
    },

    onShow: function() {
      var response = this.containerModel.get('data');
      if (!response) {
        this._waiting = true;
        return;
      }
      this.createTableViews(response, 1);
      this.createGraphViewsForOnePaper(response);
      this.insertViewsForOnePaper(response);
    },
  });

  return Widget;
});
