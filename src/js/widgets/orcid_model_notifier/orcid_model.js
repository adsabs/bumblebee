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
        if (this.isWorkInCollection(adsWork))
        {
          return;
        }

        this.attributes.bulkInsertWorks.push(adsWork);
      },

      removeFromBulkWorks: function(adsWork){
        // TODO :
      },

      cancelBulkInsert: function(){
        this.set('isInBulkInsertMode', false);
        this.set('bulkInsertWorks', []);
      },

      triggerBulkInsert: function(){
        this.trigger('bulkInsert', this.attributes.bulkInsertWorks);
        this.set('isInBulkInsertMode', false);
        this.set('bulkInsertWorks', []);
      },

      isWorkInCollection : function(adsItem){
        return false; // TODO
      }
    });

    return new OrcidModel();

  });