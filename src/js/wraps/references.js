define(['js/widgets/list_of_things/details_widget'], function(DetailsWidget) {
  var Widget = DetailsWidget.extend({
    initialize: function() {
      this.name = 'ShowReferences';
      return DetailsWidget.prototype.initialize.apply(this, arguments);
    },
    ingestBroadcastedPayload: function(data) {
      var count = _.isNumber(data.references_count) ? data.references_count : 0;
      this.trigger('page-manager-event', 'widget-ready', {
        numFound: count,
        isActive: count > 0,
      });
      DetailsWidget.prototype.ingestBroadcastedPayload.apply(this, arguments);
    },
  });

  var exports = function() {
    var options = {
      queryOperator: 'references',
      sortOrder: 'first_author asc',
      description: 'Papers referenced by',
      // show how to get this info from solr
      operator: true,
    };
    return new Widget(options);
  };

  return exports;
});
