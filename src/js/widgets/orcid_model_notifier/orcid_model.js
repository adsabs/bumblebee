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

          bulkInsertWorks: [],

          isInBulkInsertMode: false
        };
      }
    });

    _.extend(OrcidModel.prototype, {
      addToBulkWorks: function(adsWork){
        this.attributes.bulkInsertWorks.push(adsWork);

      },

      triggerBulkInsert: function(){

      },

      isWorkInCollection : function(adsItem){
        return false; // TODO
      }
    });

    return new OrcidModel();

  });