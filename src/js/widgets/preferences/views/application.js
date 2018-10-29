define([
  'underscore',
  'marionette',
  'hbs!js/widgets/preferences/templates/application',
  'js/widgets/config'
], function (_, Marionette, ApplicationTemplate, config) {

  var DEFAULTS = {
    numAuthors: {
      initialOptions: (_.range(1, 11)).concat(['all']),
      initialValue: 4
    },
    externalLinks: {
      initialOptions: [ 'Auto', 'Open new tab', 'Open in current tab' ],
      initialValue: 'Auto'
    },
    exportFormat: {
      initialOptions: _.map(config.export.formats, 'label'),
      initialValue: 'BibTeX'
    },
    database: {
      initialValue: [
        { name: 'Physics', value: false },
        { name: 'Astronomy', value: false },
        { name: 'General', value: false }
      ]
    },
    hideSidebars: {
      initialValue: 'Show',
      initialOptions: ['Show', 'Hide']
    },
    addCustomFormatOptions: []
  };

  var ApplicationView = Marionette.ItemView.extend({

    initialize: function () {

      // Get the latest value from the incoming model, or just take the default
      var numAuthors = this.model.get('minAuthorsPerResult') ||
        DEFAULTS.numAuthors.initialValue;
      var externalLinks = this.model.get('externalLinkAction') ||
        DEFAULTS.externalLinks.initialValue;
      var database = this.model.get('defaultDatabase') ||
        DEFAULTS.database.initialValue;
      var exportFormat = this.model.get('defaultExportFormat') ||
        DEFAULTS.exportFormat.initialValue
      var hideSidebars = this.model.get('defaultHideSidebars') ||
        DEFAULTS.hideSidebars.initialValue
      var addCustomFormatOptions = this.model.get('customFormats') ||
        DEFAULTS.addCustomFormatOptions;

      // must clone the props that will get mutated
      this.model.set({
        numAuthorsOptions: DEFAULTS.numAuthors.initialOptions,
        numAuthorsDefault: DEFAULTS.numAuthors.initialValue,
        numAuthorsSelected: this._convertToNumber(_.clone(numAuthors)),
        externalLinksOptions: DEFAULTS.externalLinks.initialOptions,
        externalLinksDefault: DEFAULTS.externalLinks.initialValue,
        externalLinksSelected: _.clone(externalLinks),
        databaseSelected: _.cloneDeep(database),
        exportFormatOptions: DEFAULTS.exportFormat.initialOptions,
        exportFormatDefault: DEFAULTS.exportFormat.initialValue,
        exportFormatSelected: _.clone(exportFormat),
        hideSideBarsDefault: DEFAULTS.hideSidebars.initialValue,
        hideSideBarsOptions: DEFAULTS.hideSidebars.initialOptions,
        hideSideBarsSelected: _.clone(hideSidebars),
        addCustomFormatOptions: _.clone(addCustomFormatOptions)
      });
      this.model.trigger('change');
    },

    template: ApplicationTemplate,

    className: 'panel panel-default s-form-container',

    events: {
      'click #appSettingsSubmit': 'onSubmit',
      'click #appSettingsCancel': 'onCancel',
      'click #appSettingsReset': 'onResetToDefaults',
      'click .database-select': 'onDatabaseSelect',
      'click #addCustomFormatAdd': 'onAddCustomFormat',

      // Custom format editor events
      'click #addCustomFormatEdit': 'onEditCustomFormat',
      'click #addCustomFormatConfirmEdit': 'onConfirmEditCustomFormat',
      'click #addCustomFormatCancelEdit': 'onCancelEditCustomFormat',

      // custom format deleting events
      'click #addCustomFormatDelete': 'onDeleteCustomFormat',
      'change select': 'syncModel'
    },

    modelEvents: {
      'change': 'render'
    },

    onDatabaseSelect: function (e) {
      var data = this.model.get('databaseSelected');

      // find the current index of the element
      var idx = $('.database-select', this.el).index(e.currentTarget);

      // grab the object at [idx] and make our change
      var newVal = _.assign({}, data[idx], { value: !data[idx].value });

      // place our new value in the array
      var newData = data.slice(0, idx).concat(newVal).concat(data.slice(idx + 1));
      this.model.set('databaseSelected', newData);
      this.model.trigger('change');
    },

    _convertToNumber: function (val) {
      try {
        return _.isNaN(Number(val)) ? val : Number(val);
      } catch (e) {
        return val;
      }
    },

    _convertToString: function (val) {
      try {
        return String(val) !== '[object Object]' ? String(val) : val;
      } catch (e) {
        return val;
      }
    },

    syncModel: function () {
      var update = {};
      var convert = this._convertToNumber;
      $('.form-control', this.el).each(function () {
        var $el = $(this);
        var val = $el.val();
        update[$el.attr('id') + 'Selected'] = convert(val);
      });
      this.model.set(update);
    },

    onSubmit: function (e) {
      e.preventDefault();
      this.model.set({
        updateSucceeded: false,
        updateFailed: false,
        loading: true
      });
      this.syncModel();
      this.trigger('change:applicationSettings', {
        minAuthorsPerResult: this._convertToString(this.model.get('numAuthorsSelected')),
        externalLinkAction: this.model.get('externalLinksSelected'),
        defaultDatabase: this.model.get('databaseSelected'),
        defaultExportFormat: this.model.get('exportFormatSelected'),
        defaultHideSidebars: this.model.get('hideSideBarsSelected'),
        customFormats: _.map(this.model.get('addCustomFormatOptions'), function (i) {
          return _.pick(i, ['id', 'name', 'code']);
        })
      });
    },

    onCancel: function (e) {
      e.preventDefault();
      this.initialize();
    },

    onResetToDefaults: function () {

      // clear the model
      this.model.set({
        minAuthorsPerResult: undefined,
        externalLinkAction: undefined,
        defaultDatabase: undefined,
        defaultExportFormat: undefined,
        defaultHideSidebars: undefined
      }, { unset: true });

      this.onCancel.apply(this, arguments);
    },

    onError: function () {
      var model = this.model;
      model.set({
        updateFailed: true,
        loading: false
      });
      setTimeout(function () {
        model.set('updateFailed', false);
      }, 5000);
    },

    onSuccess: function () {
      var model = this.model;
      model.set({
        updateSucceeded: true,
        loading: false
      });
      setTimeout(function () {
        model.set('updateSucceeded', false);
      }, 5000);
    },

    onAddCustomFormat: function (e) {
      e.preventDefault();
      var items = _.clone(this.model.get('addCustomFormatOptions'));
      var applyEditById = _.bind(this.applyEditById, this);
      items = _.map(items, function (i, idx) {
        return i.editing ? applyEditById(i.id, true)[idx] : i;
      });

      var id = _.uniqueId('format-');
      items.unshift({
        id: id,
        name: 'My New Format',
        code: '<---- Format ---->',
        editing: true
      });
      this.model.set('addCustomFormatOptions', items);
      var $name = $('#custom-format-name-' + id);
      $name.focus().select();
      var $msg = this.$('#new-format-msg');
      $msg.fadeIn('slow', function () {
        $msg.fadeOut('slow');
      });
    },

    updateCustomFormatEntry: function (_id, data, silent) {
      var items = _.clone(this.model.get('addCustomFormatOptions'));
      var id = _id + '';
      var idx = _.findIndex(items, { id: id });
      if (_.isPlainObject(data)) {
        items[idx] = _.assign({}, items[idx], data);
      }
      if (!silent) {
        this.model.set('addCustomFormatOptions', items);
        this.model.trigger('change');
      }
      return items;
    },

    onEditCustomFormat: function (e) {
      e.preventDefault();
      var id = this.$(e.currentTarget).data('id');

      // update the page
      this.updateCustomFormatEntry(id, {
        editing: true
      });

      // apply some listeners
      var $name = $('#custom-format-name-' + id);
      $name.focus().select();
    },

    applyEditById: function (id, silent) {
      var name = this.$('#custom-format-name-' + id).val();
      var code = this.$('#custom-format-code-' + id).val();
      return this.updateCustomFormatEntry(id, {
        editing: false,
        name: name,
        code: code
      }, silent);
    },

    onConfirmEditCustomFormat: function (e) {
      e.preventDefault();
      var id = this.$(e.currentTarget).data('id');
      this.applyEditById(id);
    },

    onCancelEditCustomFormat: function (e) {
      e.preventDefault();
      var id = this.$(e.currentTarget).data('id');
      this.updateCustomFormatEntry(id, {
        editing: false
      });
    },

    onDeleteCustomFormat: function (e) {
      e.preventDefault();
      var model = this.model;
      var id = this.$(e.currentTarget).data('id') + '';
      var items = _.clone(model.get('addCustomFormatOptions'));
      var newList = _.reject(items, { id: id });
      this.$(e.currentTarget).closest('li').fadeOut(400, function () {
        model.set('addCustomFormatOptions', newList);
      });
    },

    onSortChange: function (e, ui) {
      var items = _.clone(this.model.get('addCustomFormatOptions'));
      var index = this.$('#addCustomFormat .list-group-item').index(ui.item);
      var id = this.$(ui.item).data('id');
      var fIndex = _.findIndex(items, { id: id });

      // swap
      if (index !== fIndex) {
        items.splice(index, 0, items.splice(fIndex, 1)[0]);
      }

      this.model.set('addCustomFormatOptions', items);
    },

    onRender: function () {
      this.$('form input.custom-format-edit').on('keydown', _.bind(function (e) {
        if (e.keyCode === 13) {
          this.onConfirmEditCustomFormat(e);
        }
      }, this));
      var onSortChange = _.bind(this.onSortChange, this);
      setTimeout(function () {
        $('#addCustomFormat').sortable({
          axis: 'y',
          items: '.list-group-item',
          update: onSortChange,
          scroll: true,
          scrollSensitivity: 80,
          scrollSpeed: 3
        });
      }, 100);
    }
  });

  return ApplicationView;
});
