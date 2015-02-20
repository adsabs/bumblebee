define(['underscore', 'js/widgets/base/item_view',
  'hbs!./templates/item-checkbox',
   'js/mixins/formatter'
], function(
  _,
  BaseItemView,
  ItemCheckBoxTemplate,
  FormatMixin
  ) {

  var FacetItemView = BaseItemView.extend({

    template: ItemCheckBoxTemplate,

    serializeData : function(){
      var data = this.model.toJSON();
      data.count = this.formatNum(this.model.get("count"));
      data.title = data.title.slice(0, 17);
      return data;
    },

    events: {
      'click .widget-item': "onClick"
    },

    onClick: function(ev) {
      ev.stopPropagation();
      this.model.set('selected', ev.target.checked);
      this.$("label").toggleClass("s-facet-selected");
      this.trigger('itemClicked'); // we don't need to pass data because marionette includes 'this'
    }

  });

  _.extend(FacetItemView.prototype, FormatMixin)

  return FacetItemView;
});