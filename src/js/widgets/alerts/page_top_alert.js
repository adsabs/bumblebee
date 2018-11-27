define([
  'marionette',
  'bootstrap-notify'
], function (
  Marionette
) {
  var AlertView = Marionette.ItemView.extend({
    settings: {
      placement: {
        from: 'bottom',
        align: 'center'
      },
      offset: 100,
      newest_on_top: true,
      timer: 10000
    },
    template: _.noop,
    modelEvents: {
      change: 'render'
    },

    render: function () {
      var model = this.model;
      if (model.get('modal') || !model.get('msg')) {
        return this;
      }
      $.notify({
        icon: 'fa fa-exclamation-triangle',
        title: model.get('title'),
        message: model.get('msg')
      }, _.extend(this.settings, {
        type: model.get('type'),
        onClosed: function () {

          // on close, clear the model
          // this ensures duplicate alerts are shown properly
          model.clear();
        }
      }));

      // log the error to console as well
      if (this.model.get('type') === 'danger') {
        console.error('error feedback: ', this.model.get('title'), this.model.get('msg'));
      }
      return Marionette.ItemView.prototype.render.apply(this, arguments);
    }

  });

  return AlertView;
});
