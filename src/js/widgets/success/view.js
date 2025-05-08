define(['lodash/dist/lodash.compat', 'marionette', 'js/widgets/success/success_template.hbs'], function(_, Marionette, SuccessTemplate) {
  var SuccessView = Marionette.ItemView.extend({
    initialize: function(options) {
      _.extend(this, options);
    },

    title: 'Success!',
    message: 'Check your email for further instructions.',
    template: SuccessTemplate,

    serializeData: function() {
      return { title: this.title, message: this.message };
    },
  });

  return SuccessView;
});
