define([
  'underscore',
  'marionette',
  'hbs!js/widgets/preferences/templates/application',
  'js/widgets/config',
], function(_, Marionette, ApplicationTemplate, config) {
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
      initialValue: [
        {
          name: 'Physics',
          value: false,
        },
        {
          name: 'Astronomy',
          value: false,
        },
        {
          name: 'General',
          value: false,
        },
        {
          name: 'Earth Science',
          value: false,
        },
      ],
    },
    hideSidebars: {
      initialValue: 'Show',
      initialOptions: ['Show', 'Hide'],
    },
  };

  const watchedProps = [
    'numAuthorsSelected',
    'externalLinksSelected',
    'databaseSelected',
    'homePageSelected',
    'hideSideBarsSelected',
  ];

  var ApplicationView = Marionette.ItemView.extend({
    initialize: function() {
      // Get the latest value from the incoming model, or just take the default
      var numAuthors =
        this.model.get('minAuthorsPerResult') ||
        DEFAULTS.numAuthors.initialValue;
      var externalLinks =
        this.model.get('externalLinkAction') ||
        DEFAULTS.externalLinks.initialValue;
      var homePage =
        this.model.get('homePage') || DEFAULTS.homePage.initialValue;
      var database =
        this.model.get('defaultDatabase') || DEFAULTS.database.initialValue;
      var hideSidebars =
        this.model.get('defaultHideSidebars') ||
        DEFAULTS.hideSidebars.initialValue;

      // must clone the props that will get mutated
      this.model.set({
        numAuthorsOptions: DEFAULTS.numAuthors.initialOptions,
        numAuthorsDefault: DEFAULTS.numAuthors.initialValue,
        numAuthorsSelected: this._convertToNumber(_.clone(numAuthors)),
        externalLinksOptions: DEFAULTS.externalLinks.initialOptions,
        externalLinksDefault: DEFAULTS.externalLinks.initialValue,
        externalLinksSelected: _.clone(externalLinks),
        databaseSelected: _.cloneDeep(database),
        homePageOptions: DEFAULTS.homePage.initialOptions,
        homePageDefault: DEFAULTS.homePage.initialValue,
        homePageSelected: _.clone(homePage),
        hideSideBarsDefault: DEFAULTS.hideSidebars.initialValue,
        hideSideBarsOptions: DEFAULTS.hideSidebars.initialOptions,
        hideSideBarsSelected: _.clone(hideSidebars),
      });
      this.model.trigger('change');

      this.render = _.debounce(_.bind(this.render), 280);
    },

    template: ApplicationTemplate,

    className: 'panel panel-default s-form-container',

    events: {
      'click .database-select': 'onDatabaseSelect',
      'change select': 'syncModel',
    },

    modelEvents: {
      change: 'render',
    },

    onDatabaseSelect: function(e) {
      var data = this.model.get('databaseSelected');

      // find the current index of the element
      var idx = $('.database-select', this.el).index(e.currentTarget);

      // grab the object at [idx] and make our change
      var newVal = _.assign({}, data[idx], {
        value: !data[idx].value,
      });

      // place our new value in the array
      var newData = data
        .slice(0, idx)
        .concat(newVal)
        .concat(data.slice(idx + 1));
      this.model.set('databaseSelected', newData);
      this.model.trigger('change');
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
      this.trigger('change:applicationSettings', {
        minAuthorsPerResult: this._convertToString(
          this.model.get('numAuthorsSelected')
        ),
        externalLinkAction: this.model.get('externalLinksSelected'),
        defaultDatabase: this.model.get('databaseSelected'),
        defaultHideSidebars: this.model.get('hideSideBarsSelected'),
        homePage: this.model.get('homePageSelected'),
      });
      return false;
    },

    onCancel: function(e) {
      this.initialize();
      return false;
    },

    onResetToDefaults: function() {
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

  return ApplicationView;
});
