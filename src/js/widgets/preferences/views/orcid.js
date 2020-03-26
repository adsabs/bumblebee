define([
  'marionette',
  'hbs!js/widgets/preferences/templates/orcid',
  'hbs!js/widgets/preferences/templates/orcid-name-row-template',
], function(Marionette, orcidTemplate, orcidNameRowTemplate) {
  var OrcidView = Marionette.ItemView.extend({
    template: orcidTemplate,

    className: 'panel panel-default s-form-container',

    events: {
      'click  .submit': 'submitForm',
      'change .authorized-ads-user': 'toggleWarning',
      'click .add-another-orcid-name': 'addNameRow',
      'click .remove-name': 'removeNameRow',
    },

    toggleWarning: function(e) {
      if (this.$('.authorized-ads-user').is(':checked')) {
        this.$('.orcid-name-container .warning').addClass('hidden');
      } else {
        this.$('.orcid-name-container .warning').removeClass('hidden');
      }
    },

    addNameRow: function(e) {
      this.$('.add-another-orcid-name').before(orcidNameRowTemplate());
    },

    removeNameRow: function(e) {
      $(arguments[0].currentTarget)
        .parent()
        .remove();
    },

    triggers: {
      'click .orcid-authenticate': 'orcid-authenticate',
    },

    modelEvents: {
      change: 'render',
    },

    submitForm: function(e) {
      var data = {};
      data.currentAffiliation = this.$('#aff-input').val();
      data.authorizedUser = this.$('.authorized-ads-user').is(':checked');
      data.nameVariations = this.$('.orcid-name-row')
        .map(function(index) {
          return $(this)
            .find('input')
            .val();
        })
        .get();

      var loadingString =
        '<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i> Loading';
      this.$('.submit').html(loadingString);
      // loading string will be removed when view is re-rendered

      this.trigger('orcid-form-submit', data);
      return false;
    },
  });

  return OrcidView;
});
