define([
  'underscore',
  'marionette',
  'hbs!js/widgets/preferences/templates/export',
  'js/widgets/config',
], function(_, Marionette, ExportTemplate, config) {
  var DEFAULTS = {
    exportFormat: {
      initialOptions: _.map(config.export.formats, 'label'),
      initialValue: 'BibTeX',
    },
    addCustomFormatOptions: [],
    bibtexMaxAuthors: {
      initialValue: 10,
      initialOptions: [
        ..._.range(1, 10, 1),
        ..._.range(10, 110, 10, true),
        'all',
      ],
    },
    bibtexKeyFormat: {
      initialValue: '',
    },
    bibtexJournalFormat: {
      initialValue: 'Use AASTeX macros',
      initialOptions: [
        'Use AASTeX macros',
        'Use Journal Abbreviations',
        'Use Full Journal Name',
      ],
    },
    bibtexABSMaxAuthors: {
      initialValue: 10,
      initialOptions: [
        ..._.range(1, 10, 1),
        ..._.range(10, 110, 10, true),
        'all',
      ],
    },
    bibtexABSKeyFormat: {
      initialValue: '',
    },
    bibtexAuthorCutoff: {
      initialValue: 200,
      initialOptions: [..._.range(1, 11, 1), ..._.range(100, 600, 100)],
    },
    bibtexABSAuthorCutoff: {
      initialValue: 200,
      initialOptions: [..._.range(1, 11, 1), ..._.range(100, 600, 100)],
    },
  };

  const watchedProps = [
    'exportFormatSelected',
    'addCustomFormatOptions',
    'bibtexMaxAuthorsSelected',
    'bibtexKeyFormatSelected',
    'bibtexJournalFormatSelected',
    'bibtexABSMaxAuthorsSelected',
    'bibtexABSKeyFormatSelected',
    'bibtexAuthorCutoffSelected',
    'bibtexABSAuthorCutoffSelected',
  ];

  var ExportView = Marionette.ItemView.extend({
    initialize: function() {
      // Get the latest value from the incoming model, or just take the default
      var exportFormat =
        this.model.get('defaultExportFormat') ||
        DEFAULTS.exportFormat.initialValue;
      var addCustomFormatOptions =
        this.model.get('customFormats') || DEFAULTS.addCustomFormatOptions;
      var bibtexKeyFormat =
        this.model.get('bibtexKeyFormat') ||
        DEFAULTS.bibtexKeyFormat.initialValue;
      var bibtexJournalFormat =
        this.model.get('bibtexJournalFormat') ||
        DEFAULTS.bibtexJournalFormat.initialValue;
      var bibtexMaxAuthors =
        this.model.get('bibtexMaxAuthors') ||
        DEFAULTS.bibtexMaxAuthors.initialValue;
      var bibtexABSKeyFormat =
        this.model.get('bibtexABSKeyFormat') ||
        DEFAULTS.bibtexABSKeyFormat.initialValue;
      var bibtexABSMaxAuthors =
        this.model.get('bibtexABSMaxAuthors') ||
        DEFAULTS.bibtexABSMaxAuthors.initialValue;
      var bibtexAuthorCutoff =
        this.model.get('bibtexAuthorCutoff') ||
        DEFAULTS.bibtexAuthorCutoff.initialValue;
      var bibtexABSAuthorCutoff =
        this.model.get('bibtexABSAuthorCutoff') ||
        DEFAULTS.bibtexABSAuthorCutoff.initialValue;

      // must clone the props that will get mutated
      this.model.set({
        exportFormatOptions: DEFAULTS.exportFormat.initialOptions,
        exportFormatDefault: DEFAULTS.exportFormat.initialValue,
        exportFormatSelected: _.clone(exportFormat),
        addCustomFormatOptions: _.clone(addCustomFormatOptions),
        bibtexKeyFormatDefault: DEFAULTS.bibtexKeyFormat.initialValue,
        bibtexKeyFormatSelected: _.clone(bibtexKeyFormat),
        bibtexJournalFormatDefault: DEFAULTS.bibtexJournalFormat.initialValue,
        bibtexJournalFormatOptions: DEFAULTS.bibtexJournalFormat.initialOptions,
        bibtexJournalFormatSelected: _.clone(bibtexJournalFormat),
        bibtexMaxAuthorsDefault: DEFAULTS.bibtexMaxAuthors.initialValue,
        bibtexMaxAuthorsOptions: DEFAULTS.bibtexMaxAuthors.initialOptions,
        bibtexMaxAuthorsSelected: this._convertToNumber(
          _.clone(bibtexMaxAuthors)
        ),
        bibtexABSKeyFormatDefault: DEFAULTS.bibtexABSKeyFormat.initialValue,
        bibtexABSKeyFormatSelected: _.clone(bibtexABSKeyFormat),
        bibtexABSMaxAuthorsDefault: DEFAULTS.bibtexABSMaxAuthors.initialValue,
        bibtexABSMaxAuthorsOptions: DEFAULTS.bibtexABSMaxAuthors.initialOptions,
        bibtexABSMaxAuthorsSelected: this._convertToNumber(
          _.clone(bibtexABSMaxAuthors)
        ),
        bibtexAuthorCutoffDefault: DEFAULTS.bibtexAuthorCutoff.initialValue,
        bibtexAuthorCutoffOptions: DEFAULTS.bibtexAuthorCutoff.initialOptions,
        bibtexAuthorCutoffSelected: this._convertToNumber(
          _.clone(bibtexAuthorCutoff)
        ),
        bibtexABSAuthorCutoffDefault:
          DEFAULTS.bibtexABSAuthorCutoff.initialValue,
        bibtexABSAuthorCutoffOptions:
          DEFAULTS.bibtexABSAuthorCutoff.initialOptions,
        bibtexABSAuthorCutoffSelected: this._convertToNumber(
          _.clone(bibtexABSAuthorCutoff)
        ),
      });
      this.model.trigger('change');

      this.render = _.debounce(_.bind(this.render), 280);
    },

    template: ExportTemplate,

    className: 'panel panel-default s-form-container',

    events: {
      'click #addCustomFormatAdd': 'onAddCustomFormat',

      // Custom format editor events
      'click .addCustomFormatEdit': 'onEditCustomFormat',
      'click .addCustomFormatConfirmEdit': 'onConfirmEditCustomFormat',
      'click .addCustomFormatCancelEdit': 'onCancelEditCustomFormat',

      // custom format deleting events
      'click .addCustomFormatDelete': 'onDeleteCustomFormat',

      'change #bibtexKeyFormat': 'onChangeBibtexKeyFormat',
      'change #bibtexABSKeyFormat': 'onChangeBibtexABSKeyFormat',
      'change select': 'syncModel',
    },

    modelEvents: {
      change: 'render',
    },

    _convertToNumber: function(val) {
      try {
        return _.isNaN(Number(val)) ? val : Number(val);
      } catch (e) {
        return val;
      }
    },

    _convertToString: function(val) {
      try {
        return String(val) !== '[object Object]' ? String(val) : val;
      } catch (e) {
        return val;
      }
    },

    syncModel: function() {
      var update = {};
      var convert = this._convertToNumber;
      $('.form-control', this.el).each(function() {
        var $el = $(this);
        var val = $el.val();

        if (!$el.data('noConvert')) {
          val = convert(val);
        }
        update[$el.attr('id') + 'Selected'] = val;
      });
      this.model.set(update);
    },

    onSubmit: function() {
      this.model.set({
        updateSucceeded: false,
        updateFailed: false,
        loading: true,
      });
      this.syncModel();
      this.trigger('change:exportSettings', {
        defaultExportFormat: this.model.get('exportFormatSelected'),
        customFormats: _.map(this.model.get('addCustomFormatOptions'), function(
          i
        ) {
          return _.pick(i, ['id', 'name', 'code']);
        }),
        bibtexMaxAuthors: this._convertToString(
          this.model.get('bibtexMaxAuthorsSelected') === 'all'
            ? 0
            : this.model.get('bibtexMaxAuthorsSelected')
        ),
        bibtexKeyFormat: this.model.get('bibtexKeyFormatSelected'),
        bibtexJournalFormat: this.model.get('bibtexJournalFormatSelected'),
        bibtexABSMaxAuthors: this._convertToString(
          this.model.get('bibtexABSMaxAuthorsSelected') === 'all'
            ? 0
            : this.model.get('bibtexABSMaxAuthorsSelected')
        ),
        bibtexABSKeyFormat: this.model.get('bibtexABSKeyFormatSelected'),
        bibtexAuthorCutoff: this._convertToString(
          this.model.get('bibtexAuthorCutoffSelected')
        ),
        bibtexABSAuthorCutoff: this._convertToString(
          this.model.get('bibtexABSAuthorCutoffSelected')
        ),
      });
      return false;
    },

    onCancel: function(e) {
      this.initialize();
      return false;
    },

    onChangeBibtexKeyFormat: function() {
      this.onSubmit();
    },

    onChangeBibtexABSKeyFormat: function() {
      this.onSubmit();
    },

    onResetToDefaults: function() {
      // clear the model
      this.model.set(
        {
          defaultExportFormat: undefined,
        },
        {
          unset: true,
        }
      );

      this.onCancel.apply(this, arguments);
    },

    onError: function() {
      var model = this.model;
      model.set({
        updateFailed: true,
        loading: false,
      });
      setTimeout(() => {
        model.set('updateFailed', false, {
          silent: true,
        });
        this.hideMessage();
      }, 5000);
    },

    onSuccess: function() {
      var model = this.model;
      model.set({
        updateSucceeded: true,
        loading: false,
      });
      setTimeout(() => {
        model.set('updateSucceeded', false, {
          silent: true,
        });
        this.hideMessage();
      }, 3000);
    },

    hideMessage: function() {
      $('#app-settings-msg').fadeOut(500, function() {
        $(this).empty();
      });
    },

    onAddCustomFormat: function(e) {
      var items = _.clone(this.model.get('addCustomFormatOptions'));
      var applyEditById = _.bind(this.applyEditById, this);
      items = _.map(items, function(i, idx) {
        return i.editing ? applyEditById(i.id, true)[idx] : i;
      });

      var id = _.uniqueId('format-');
      items.unshift({
        id: id,
        name: '',
        code: '',
        editing: true,
      });
      this.model.set('addCustomFormatOptions', items);
      var $name = $('#custom-format-name-' + id);
      $name.focus().select();
      var $msg = this.$('#new-format-msg');
      $msg.fadeIn('slow', function() {
        $msg.fadeOut('slow');
      });
      return false;
    },

    updateCustomFormatEntry: function(_id, data, silent) {
      var items = _.clone(this.model.get('addCustomFormatOptions'));
      var id = _id + '';
      var idx = _.findIndex(items, {
        id: id,
      });
      if (_.isPlainObject(data)) {
        items[idx] = _.assign({}, items[idx], data);
      }
      if (!silent) {
        this.model.set('addCustomFormatOptions', items);
        this.model.trigger('change', {
          addCustomFormatOptions: items,
        });
      }
      return items;
    },

    onEditCustomFormat: function(e) {
      // do not allow editing multiple items at once
      if (this.isEditing()) {
        return false;
      }

      var id = this.$(e.currentTarget).data('id');

      // update the page
      this.updateCustomFormatEntry(id, {
        editing: true,
      });

      // apply some listeners
      var $name = $('#custom-format-name-' + id);
      $name.focus().select();
      return false;
    },

    applyEditById: function(id, silent) {
      var name = this.$('#custom-format-name-' + id).val();
      var code = this.$('#custom-format-code-' + id).val();

      // don't apply the edit if either input is empty
      if (name === '' || code === '') {
        return;
      }

      this._forceUpdate = true;
      return this.updateCustomFormatEntry(
        id,
        {
          editing: false,
          name: name,
          code: code,
        },
        silent
      );
    },

    onConfirmEditCustomFormat: function(e) {
      var id = this.$(e.currentTarget).data('id');
      this.applyEditById(id);
      return false;
    },

    onCancelEditCustomFormat: function(e) {
      var id = this.$(e.currentTarget).data('id');
      this.updateCustomFormatEntry(id, {
        editing: false,
      });
      return false;
    },

    onDeleteCustomFormat: function(e) {
      // do not allow deletion if editing
      if (this.isEditing()) {
        return false;
      }

      if (!confirm('Are you sure?')) {
        return false;
      }

      var model = this.model;
      var id = this.$(e.currentTarget).data('id') + '';
      var items = _.clone(model.get('addCustomFormatOptions'));
      var newList = _.reject(items, {
        id: id,
      });
      this.$(e.currentTarget)
        .closest('li')
        .fadeOut(400, function() {
          model.set('addCustomFormatOptions', newList);
        });
      return false;
    },

    onSortChange: function(e, ui) {
      var items = _.clone(this.model.get('addCustomFormatOptions'));
      var index = this.$('#addCustomFormat .list-group-item').index(ui.item);
      var id = this.$(ui.item).data('id');
      var fIndex = _.findIndex(items, {
        id: id,
      });

      // swap
      if (index !== fIndex) {
        items.splice(index, 0, items.splice(fIndex, 1)[0]);
      }

      this.model.set('addCustomFormatOptions', items);
    },

    isEditing: function() {
      return _.any(this.model.get('addCustomFormatOptions'), {
        editing: true,
      });
    },

    onRender: function() {
      var onSortChange = _.bind(this.onSortChange, this);
      setTimeout(() => {
        $('#addCustomFormat').sortable({
          axis: 'y',
          items: '.list-group-item',
          update: onSortChange,
          scroll: true,
          scrollSensitivity: 80,
          scrollSpeed: 3,
        });
      }, 100);

      // check if any of the watched props matched the ones changed
      _.forEach(watchedProps, (p) => {
        if (this.model.changed[p]) {
          // check if the prop is custom format
          if (p === 'addCustomFormatOptions') {
            const isEditing = this.isEditing();

            // we don't want to submit if we're editing a custom format, just continue
            if (isEditing) {
              return true;
            }
          }

          // execute submit
          this.onSubmit();
          return false;
        }
      });
    },
  });

  return ExportView;
});
