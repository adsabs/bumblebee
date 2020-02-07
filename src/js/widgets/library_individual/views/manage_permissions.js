define([
  'marionette',
  'hbs!js/widgets/library_individual/templates/manage-permissions-container',
  'hbs!js/widgets/library_individual/templates/make-public',
  'hbs!../templates/transfer-ownership-modal',
  'reactify!js/react/BumblebeeWidget?LibraryCollaborators',
], function(
  Marionette,
  ManagePermissionsContainer,
  MakePublicTemplate,
  transferOwnershipModal,
  LibraryCollaboratorsComponent
) {
  var PermissionsModel = Backbone.Model.extend({});
  var PermissionsCollection = Backbone.Collection.extend({
    model: PermissionsModel,
  });

  const TransferOwnershipModalView = Backbone.View.extend({
    initialize() {
      this.render = _.debounce(this.render, 500);
      this.onConfirm = _.debounce(this.onConfirm, 1000);
      this.model = new (Backbone.Model.extend({
        defaults: {
          error: false,
          loading: false,
        },
      }))();
      const container = document.createElement('div');
      document.body.appendChild(container);
      this.setElement(container);
      this.model.on('change:error', () => {
        this.showErrorMessage();
      });
      this.model.on('change:loading', () => {
        this.showLoading();
      });
      this.model.on('change:success', () => {
        this.showSuccessMessage();
      });
    },
    showErrorMessage() {
      const error = this.model.get('error');
      const el = $('#error-message', this.el);
      if (error && error.length > 0) {
        el.fadeIn();
        $('span', el).text(error);
      } else {
        el.hide();
      }
    },
    showSuccessMessage() {
      const success = this.model.get('success');
      const el = $('#success-message', this.el);
      if (success && success.length > 0) {
        el.fadeIn();
        $('span', el).text(success);
      } else {
        el.hide();
      }
    },
    showLoading() {
      const loading = this.model.get('loading');
      const el = $('#loader', this.el);
      loading ? el.show() : el.hide();
    },
    getModal() {
      return $('#transferOwnershipModal', this.$el);
    },
    render() {
      this.$el.html(transferOwnershipModal(this.model.toJSON()));
      this.getModal()
        .off()
        .on('show.bs.modal', () => {
          this.model.clear().set(this.model.defaults);
        })
        .on('shown.bs.modal', () => {
          $('input', this.$el).focus();
        });
    },
    destroy() {
      $('#transferOwnershipModal')
        .parent()
        .remove();
    },
    events: {
      'click .confirm-button': '_onConfirm',
      'submit form': '_onConfirm',
    },
    getEmailAddress() {
      return $('input', this.el).val();
    },
    _onConfirm(e) {
      this.model.set({
        loading: true,
        error: false,
      });

      const msg = 'Are you sure?';
      if (confirm(msg)) {
        this.onConfirm(e);
      } else {
        this.model.set({
          loading: false,
          error: true,
        });
      }
    },
    onConfirm(e) {
      e.preventDefault();
      const email = this.getEmailAddress();
      this.trigger('confirm-transfer-ownership', email, {
        done: () => {
          this.model.set({
            success: `Success! Ownership has been transferred to ${email}`,
            loading: false,
          });
          setTimeout(() => {
            this.getModal().modal('hide');
            this.trigger('reset-and-navigate');
          }, 2000);
        },
        fail: ({ responseJSON }) => {
          if (responseJSON && responseJSON.error) {
            this.model.set({
              error: responseJSON.error,
              loading: false,
            });
          }
        },
      });
    },
  });

  var ManagePermissionsView = Marionette.ItemView.extend({
    className: 'library-admin-view',
    initialize: function(options = {}) {
      this.model.set('host', window.location.host);
      this.modal = new TransferOwnershipModalView();

      // just forward any trigger calls
      this.modal.on('all', (...args) => this.trigger(...args));
      this.libraryCollaboratorsComponent = new LibraryCollaboratorsComponent({
        initialData: this.model.toJSON(),
      });
    },
    events: {
      'click .public-button': 'togglePublicState',
    },
    togglePublicState: function(e) {
      var pub = $(e.target).hasClass('make-public');
      this.trigger('update-public-status', pub);
    },
    modelEvents: {
      'change:public': 'render',
    },
    template: ManagePermissionsContainer,
    renderCollaboratorsView() {
      const $collabContainer = $('#permissions-list', this.$el);
      if ($collabContainer.has('*')) {
        this.libraryCollaboratorsComponent.view.setElement(
          $collabContainer.get(0)
        );
        this.libraryCollaboratorsComponent.view.render();
      }
    },
    onRender: function() {
      this.$('.public-container').html(MakePublicTemplate(this.model.toJSON()));
      this.renderCollaboratorsView();
      this.modal.destroy();
      this.modal.render();
    },
  });
  return ManagePermissionsView;
});
