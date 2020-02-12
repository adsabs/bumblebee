define(['js/widgets/list_of_things/details_widget'], function(DetailsWidget) {
  var Widget = DetailsWidget.extend({
    initialize: function() {
      this.name = 'ShowCoreads';
      return DetailsWidget.prototype.initialize.apply(this, arguments);
    },
    ingestBroadcastedPayload: function(data) {
      var count = _.isNumber(data.read_count) ? data.read_count : 0;
      this.trigger('page-manager-event', 'widget-ready', {
        numFound: count,
        isActive: count > 0,
      });
      DetailsWidget.prototype.ingestBroadcastedPayload.apply(this, arguments);
    },
  });

  var exports = function() {
    var options = {
      queryOperator: 'trending',
      description: 'Papers also read by those who read',
      operator: true,
      sortOrder: 'score desc',
      // don't allow the record itself to be returned in trending search results
      removeSelf: true,
    };
    return new Widget(options);
  };

  return exports;
});
