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
          actionsVisible: false,
          works : [],

          isWorkInCollection : function(adsItem){
            return false; // TODO
          }
        };
      }
    });

    return new OrcidModel();

  });