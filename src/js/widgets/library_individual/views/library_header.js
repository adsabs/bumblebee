define(['marionette', 'js/widgets/library_individual/templates/library-header.hbs', 'dayjs', 'backbone'], function(
  Marionette,
  LibraryHeaderTemplate,
  dayjs,
  Backbone
) {
  var LibraryTitleModel = Backbone.Model.extend({
    initialize: function(vals, options) {
      options = options || {};
      this.on('change:permission', this.checkEditPermission);
    },

    defaults: function() {
      return {
        // admin, libraries,edit,metrics, or vis
        active: 'library',

        // from api
        date_created: undefined,
        date_last_modified: undefined,
        description: undefined,
        id: undefined,
        name: undefined,
        num_documents: 0,
        num_users: 0,
        permission: 'read',
        owner: undefined,
        public: false,

        // internal
        currentEditField: undefined,
      };
    },

    checkEditPermission: function() {
      if (this.get('permission') == 'admin' || this.get('permission') == 'owner') {
        this.set('edit', true);
      } else {
        this.set('edit', false);
      }
    },
  });

  var LibraryTitleView = Marionette.ItemView.extend({
    template: LibraryHeaderTemplate,

    events: {
      'click .editable-item .toggle-form': 'toggleShowForm',
      'click .editable-item .btn-success': 'submitEdit',
      'click .editable-item .btn-default': 'cancelEdit',
      'click li[data-tab]:not(.active)': 'triggerSubviewNavigate',
      'click .delete-library': 'triggerDeleteLibrary',
      'click .bigquery-export': 'triggerStartSearch',
    },

    modelEvents: {
      change: 'render',
    },

    onRender: function() {
      this.$('[data-toggle="tooltip"]').tooltip();
    },

    formatDate: function(d) {
      return dayjs
        .utc(d)
        .local()
        .format('MMM D YYYY, h:mma');
    },

    serializeData: function() {
      var data = this.model.toJSON();
      data.date_last_modified = this.formatDate(data.date_last_modified);
      data.date_created = this.formatDate(data.date_created);
      if (this.model.get('num_documents') >= 200) {
        // careful, must be lower than server GET limits (incl all other headers that we are sending)
        // show a warning when user exports library that it might take a while
        data.largeLibrary = true;
      }

      if (this.model.get('num_documents') === 0) {
        // Restrict certain menu items if there are no library documents
        data.noDocuments = true;
      }

      return data;
    },

    onSearchStarted: function() {
      this.$('.bigquery-export i').css('display', 'inline-block');
      this.$('.bigquery-export .icon-loading').css('display', 'none');
    },

    toggleShowForm: function(e) {
      this.currentEditField = $(e.target).data('field');
      var formSelector = 'form[data-field="' + this.currentEditField + '"]';
      if ($(formSelector).hasClass('hidden')) {
        $(formSelector).removeClass('hidden');
      } else {
        $(formSelector).addClass('hidden');
      }
    },

    submitEdit: function(e) {
      var formSelector = 'form[data-field="' + this.currentEditField + '"]';
      var val = $(formSelector)
        .find('input, textarea')
        .val();
      var data = {};

      // If there are no changes or empty string, don't update
      if (val.length === 0 || val === this.model.get(this.currentEditField)) {
        return this.cancelEdit(e);
      }

      // Pass empty string if undefined
      data[this.currentEditField] = val;
      this.trigger('updateVal', data);
      $(e.target).html('<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>');
      return false;
    },

    cancelEdit: function(e) {
      var $target = $(e.currentTarget);
      var $form = $target.parent();

      $form.find('input').val(this.model.get('name'));
      $form.find('textarea').val(this.model.get('description'));
      $form.addClass('hidden');
      return false;
    },

    triggerSubviewNavigate: function(e) {
      var $current = $(e.currentTarget);
      var subView = $current.data('tab');

      var tabToShow;
      var additional;
      // dropdowns have multiple sub-options
      if (subView.indexOf('-') > -1) {
        tabToShow = subView.split('-')[0];
        // this tells other widget which view to show
        additional = subView.split('-')[1];
      } else {
        tabToShow = subView;
      }
      this.model.set('active', tabToShow);
      this.trigger('navigate', tabToShow, additional);
    },

    triggerDeleteLibrary: function() {
      this.trigger('delete-library');
    },

    triggerStartSearch: function() {
      // hide icons
      this.$('.bigquery-export i').css('display', 'none');
      // show loader
      this.$('.bigquery-export .icon-loading').css('display', 'inline-block');
      this.trigger('start-search');
    },
  });

  LibraryTitleView.Model = LibraryTitleModel;

  return LibraryTitleView;
});
