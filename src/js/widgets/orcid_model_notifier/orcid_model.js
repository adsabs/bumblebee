define([
    'backbone',
    'underscore',
    'js/mixins/array_extensions',
  ],
  function(
    Backbone,
    _,
    ArrayExtensions
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

        var orcidWorks = this.get("works")["orcid-activities"]["orcid-works"];

        var workExternalIds = orcidWorks["orcid-work"]
          .flatMap(function(orcidWork) {
            return orcidWork["work-external-identifiers"]
              ? orcidWork["work-external-identifiers"]["work-external-identifier"]
              : [];
          })
          .map(function(workExtIdentifier) {
            return workExtIdentifier["work-external-identifier-id"];
          });

        return workExternalIds.indexOf("ads:" + adsItem.attributes.id) != -1;
      }
    });

    _.extend(Array.prototype, ArrayExtensions);

    return new OrcidModel();

  });