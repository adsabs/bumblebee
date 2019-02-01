define([
  'js/widgets/list_of_things/details_widget'
],
function (
  DetailsWidget
) {

  var Widget = DetailsWidget.extend({
    initialize: function () {
      this.name = 'ShowSimilar';
      return DetailsWidget.prototype.initialize.apply(this, arguments);
    },
    ingestBroadcastedPayload: function (data) {
      var abstract = data.abstract;

      // only show if there exists an abstract
      this.trigger('page-manager-event', 'widget-ready', {
        numFound: abstract ? 1 : 0,
        isActive: !!abstract
      });
      DetailsWidget.prototype.ingestBroadcastedPayload.apply(this, arguments);
    }
  });

  var exports = function () {
    var options = {
      queryOperator: 'similar',
      description: 'Papers similar to',
      operator: true,
      sortOrder: 'score desc'
    };
    return new Widget(options);
  }

  return exports;
});
