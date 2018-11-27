
define([
  'marionette',
  'hbs!js/widgets/alerts/templates/modal_template'
], function (
  Marionette,
  ModalTemplate
) {
  var ModalView = Marionette.ItemView.extend({

    id: '#alert-modal-content',
    template: ModalTemplate,

    showModal: function () {
      $('#alert-modal').modal('show');
    },

    closeModal: function () {
      $('#alert-modal').modal('hide').remove();
    },

    modelEvents: {
      change: 'render'
    },

    render: function () {

      // this makes sure that the modal re-uses the element if necessary and doesn't create new ones
      if ($('#alert-modal').length <= 0) {
        $('body').append('<div class="modal fade" id="alert-modal" tabindex="-1" role="dialog" aria-labelledby="alert-modal-label" aria-hidden="true"></div>');
        this.setElement($('#alert-modal')[0]);
      }

      if (!this.model.get('modal')) {
        $('#alert-modal').remove();
        return;
      }

      // log the error to console as well
      if (this.model.get('type') === 'danger') {
        console.error('error feedback: ', this.model.get('title'), this.model.get('msg'));
      }
      return Marionette.ItemView.prototype.render.apply(this, arguments);
    },

    onRender: function () {
      this.showModal();
    }


  });

  return ModalView;
});
