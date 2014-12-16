define([
    'backbone',
    'underscore'
  ],
  function(
    Backbone,
    _
  ) {
    var OrcidModel = Backbone.Model.extend({
      defaults: function(){
        return {
          actionsVisible: false
        };
      }
    });

    return new OrcidModel();

  });