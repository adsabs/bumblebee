define(["backbone", './model'], function (Backbone, FacetModel) {

  var FacetCollection = Backbone.Collection.extend({

    model: FacetModel,

    initialize: function (models, options) {
      if (options && options.preprocess) {
        this.preprocess = options.preprocess
      }
    },

    titleCase: function (t) {
      var properI = t.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
      return properI
    },

    allCaps: function (t) {
      return t.toUpperCase();
    },

    removeSlash: function (t) {
      if (t.match(/\/([^\/]+)$/)) {
        return t.match(/\/([^\/]+)$/)[1]
      }
      else {
        return t
      }
    }

  });

  return FacetCollection

});
