define([
  'underscore',
  'marionette',
  'hbs!js/widgets/preferences/templates/application',
  'js/widgets/config',
], function (_, Marionette, ApplicationTemplate, config) {
  var DEFAULTS = {
    numAuthors: {
      initialOptions: _.range(1, 11).concat(['all']),
      initialValue: 4,
    },
    externalLinks: {
      initialOptions: ['Auto', 'Open new tab', 'Open in current tab'],
      initialValue: 'Auto',
    },
    homePage: {
      initialOptions: ['Modern Form', 'Classic Form', 'Paper Form'],
      initialValue: 'Modern Form',
    },
    database: {
      'All': false,
      'Physics': false,
      'Astronomy': false,
      'General': false,
      'Earth Science': false,
    },
    hideSidebars: {
      initialValue: 'Show',
      initialOptions: ['Show', 'Hide'],
    },
  };

  const isEqualToDefault = (prop, value) => {
    if (prop === 'numAuthorsSelected') {
      return value === DEFAULTS.numAuthors.initialValue;
    }
    if (prop === 'externalLinksSelected') {
      return value === DEFAULTS.externalLinks.initialValue;
    }
    if (prop === 'homePageSelected') {
      return value === DEFAULTS.homePage.initialValue;
    }
    if (prop === 'hideSideBarsSelected') {
      return value === DEFAULTS.hideSidebars.initialValue;
    }
    if (prop === 'databaseSelected') {
      return _.isEqual(value, DEFAULTS.database.initialValue);
    }
    return false;
  };

  /**
   * Incoming database isa an array of objects, we need to transform and merge it to our internal format
   * @param databases
   * @returns {*|*[]}
   */
  const mergeDatabases = (databases) => {
    if (
      !Array.isArray(databases) ||
      (Array.isArray(databases) && databases.length === 0)
    ) {
      return DEFAULTS.database;
    }

    // remove any undefined values
    const cleanedDbs = databases.filter((d) => !!d);

    const merged = {};
    Object.keys(DEFAULTS.database).forEach((name) => {
      const found = cleanedDbs.find((d) => d.name === name);
      merged[name] = found ? !!found.value : DEFAULTS.database[name];
    });
    return merged;
  };

  /**
   * Transform the internal database format to the external format
   * @param databases
   */
  const transformDatabases = (databases) => {
    return Object.keys(databases).map((name) => ({
      name,
      value: databases[name],
    }));
  };

  const watchedProps = [
    'numAuthorsSelected',
    'externalLinksSelected',
    'databaseSelected',
    'homePageSelected',
    'hideSideBarsSelected',
  ];

  const ApplicationView = Marionette.ItemView.extend({
    initialize: function () {
      // Get the latest value from the incoming model, or just take the default
      const numAuthors =
        this.model.get('minAuthorsPerResult') ||
        DEFAULTS.numAuthors.initialValue;
      const externalLinks =
        this.model.get('externalLinkAction') ||
        DEFAULTS.externalLinks.initialValue;
      const homePage =
        this.model.get('homePage') || DEFAULTS.homePage.initialValue;
      const hideSidebars =
        this.model.get('defaultHideSidebars') ||
        DEFAULTS.hideSidebars.initialValue;
      const databases = mergeDatabases(this.model.get('defaultDatabase'));

      // must clone the props that will get mutated
      this.model.set({
        numAuthorsOptions: DEFAULTS.numAuthors.initialOptions,
        numAuthorsDefault: DEFAULTS.numAuthors.initialValue,
        numAuthorsSelected: this._convertToNumber(_.clone(numAuthors)),
        externalLinksOptions: DEFAULTS.externalLinks.initialOptions,
        externalLinksDefault: DEFAULTS.externalLinks.initialValue,
        externalLinksSelected: _.clone(externalLinks),

        // remove the 'All' database from the list, so it doesn't get rendered as a button
        databaseSelected: databases,
        databaseOptions: Object.keys(databases).filter((name) => name !== 'All'),
        homePageOptions: DEFAULTS.homePage.initialOptions,
        homePageDefault: DEFAULTS.homePage.initialValue,
        homePageSelected: _.clone(homePage),
        hideSideBarsDefault: DEFAULTS.hideSidebars.initialValue,
        hideSideBarsOptions: DEFAULTS.hideSidebars.initialOptions,
        hideSideBarsSelected: _.clone(hideSidebars),

        modifySections: [
          // databases section is modified if any of the entries are true
          ...(Object.keys(databases).some((name) => databases[name])
            ? ['database']
            : []),
        ],
      });
      this.model.trigger('change');

      this.render = _.debounce(_.bind(this.render), 60);
    },

    template: ApplicationTemplate,

    className: 'panel panel-default s-form-container',

    events: {
      'click .database-select': 'onDatabaseSelect',
      'change #database_all': 'onDatabaseALLSelect',
      'change select': 'syncModel',
      'click .section-modify': 'onModifySection',
      'click .section-reset': 'onResetSection',
      'click .reset-to-defaults': 'onResetToDefaults',
    },

    modelEvents: {
      change: 'render',
    },

    onDatabaseALLSelect: function (e) {
      const checked = $(e.currentTarget).prop('checked');

      this.model.set('databaseSelected', {
        ...DEFAULTS.database,
        All: checked,
      });

      this.model.trigger('change');
    },

    onDatabaseSelect: function (e) {
      const dbState = this.model.get('databaseSelected');

      // if 'ALL' selected, then the other options are disabled
      if (dbState.All) {
        return;
      }

      const id = $(e.currentTarget).data('id');

      this.model.set('databaseSelected', {
        ...dbState,

        // toggle the state of the database entry
        [id]: !dbState[id],
      });
      this.model.trigger('change');
    },

    onModifySection(e) {
      const section = $(e.currentTarget).data('section');
      this.model.set('modifySections', [
        ...this.model.get('modifySections'),
        section,
      ]);
    },

    onResetSection(e) {
      const section = $(e.currentTarget).data('section');
      this.model.set({
        modifySections: this.model.get('modifySections').filter((s) => s !== section),
        ...(section === 'database'
          ? {
            databaseSelected: DEFAULTS.database,
          }
          : {}),
      });
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

        if (!$el.data('noConvert')) {
          val = convert(val);
        }
        update[$el.attr('id') + 'Selected'] = val;
      });
      this.model.set(update);
    },

    onSubmit: function () {
      this.model.set({
        updateSucceeded: false,
        updateFailed: false,
        loading: true,
      });
      this.syncModel();

      this.trigger('change:applicationSettings', {
        minAuthorsPerResult: this._convertToString(
          this.model.get('numAuthorsSelected'),
        ),
        externalLinkAction: this.model.get('externalLinksSelected'),
        defaultDatabase: transformDatabases(this.model.get('databaseSelected')),
        defaultHideSidebars: this.model.get('hideSideBarsSelected'),
        homePage: this.model.get('homePageSelected'),
      });
      return false;
    },

    onCancel: function (e) {
      this.initialize();
      return false;
    },

    onResetToDefaults: function () {
      // clear the model
      this.model.set(
        {
          minAuthorsPerResult: undefined,
          externalLinkAction: undefined,
          defaultDatabase: undefined,
          defaultHideSidebars: undefined,
        },
        {
          unset: true,
        },
      );

      this.onCancel.apply(this, arguments);
    },

    onError: function () {
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

    onSuccess: function () {
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

    hideMessage: function () {
      $('#app-settings-msg').fadeOut(500, function () {
        $(this).empty();
      });
    },

    onSortChange: function (e, ui) {
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

    isEditing: function () {
      return _.any(this.model.get('addCustomFormatOptions'), {
        editing: true,
      });
    },

    _renderCount: 1,

    onRender: function () {
      // skip initial x renders, because when we first get data it'll render and detect a change
      if (this._renderCount > 0) {
        this._renderCount -= 1;
        return;
      }

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

  return ApplicationView;
});
