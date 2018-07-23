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
        { name: 'Astrophysics', value: false },
        { name: 'General', value: false }
      ]
    }
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
        exportFormatSelected: _.clone(exportFormat)
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
        defaultExportFormat: this.model.get('exportFormatSelected')
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
        defaultExportFormat: undefined
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
    }
  });

  return ApplicationView;
});
