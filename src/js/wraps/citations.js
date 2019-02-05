define([
  'js/widgets/list_of_things/details_widget'
],
function (
  DetailsWidget
) {

  var Widget = DetailsWidget.extend({
    initialize: function () {
      this.name = 'ShowCitations';
      return DetailsWidget.prototype.initialize.apply(this, arguments);
    },
    ingestBroadcastedPayload: function (data) {
      var count = _.isNumber(data.citation_count) ? data.citation_count : 0;
      this.trigger('page-manager-event', 'widget-ready', {
        numFound: count,
        isActive: count > 0
      });
      DetailsWidget.prototype.ingestBroadcastedPayload.apply(this, arguments);
    }
  });

  var exports = function () {
    var options = {
      queryOperator: 'citations',
      sortOrder: 'date desc',
      description: 'Papers which cite',
      operator: true
    };
    return new Widget(options);
  };

  return exports;
});
