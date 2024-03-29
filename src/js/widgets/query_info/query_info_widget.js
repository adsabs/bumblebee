define([
  'marionette',
  'backbone',
  'underscore',
  'js/components/api_request',
  'js/components/api_query',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/query_info/query_info_template',
  'js/mixins/formatter',
  'bootstrap',
  'js/components/api_feedback',
], function(
  Marionette,
  Backbone,
  _,
  ApiRequest,
  ApiQuery,
  BaseWidget,
  queryInfoTemplate,
  FormatMixin,
  Bootstrap,
  ApiFeedback
) {
  var QueryModel = Backbone.Model.extend({
    defaults: {
      selected: 0,
      // for libraries
      libraryDrawerOpen: false,
      // for rendering library select
      libraries: [],
      loggedIn: false,
      feedback: undefined,
      newLibraryName: undefined,
      selectedLibrary: undefined,
    },
  });

  var QueryDisplayView = Marionette.ItemView.extend({
    className: 'query-info-widget s-query-info-widget',
    template: queryInfoTemplate,
    initialize() {
      this.onOpen = this.onOpen.bind(this);
      this.onClose = this.onClose.bind(this);
    },

    serializeData: function() {
      var data = this.model.toJSON();
      data.selected = this.formatNum(data.selected);
      return data;
    },

    modelEvents: {
      'change:selected': 'render',
      'change:loggedIn': 'render',
      'change:libraries': 'render',
      'change:feedback': 'render',
      'change:libraryDrawerOpen': 'render',
    },

    triggers: {
      'click .clear-selected': 'clear-selected',
      'click .limit-to-selected': 'limit-to-selected',
      'click .exclude-selected': 'exclude-selected',
    },

    events: {
      'change #all-vs-selected': 'recordAllVsSelected',
      'change #library-select': 'recordLibrarySelection',
      'keyup .new-library-name': 'recordNewLibraryName',
      'click .library-add-title': 'toggleLibraryDrawer',
      'click .submit-add-to-library': 'libraryAddOrCreate',
    },

    recordLibrarySelection: function(e) {
      this.model.set('selectedLibrary', $(e.currentTarget).val());
    },

    recordNewLibraryName: function(e) {
      this.model.set('newLibraryName', $(e.currentTarget).val());
    },

    recordAllVsSelected: function(e) {
      this.model.set('selectedVsAll', $(e.currentTarget).val());
    },

    libraryAddOrCreate: function() {
      var data = {};

      const selected = this.$('#library-select').val();
      const createNew = this.model.get('newLibraryName');

      // if selected existing library
      if (selected && selected !== '0' && !createNew) {
        data.libraryID = this.$('#library-select').val();
        if (this.model.get('selected')) {
          data.recordsToAdd = this.$('#all-vs-selected').val();
        } else {
          data.recordsToAdd = 'all';
        }
        // show loading view
        this.$('.submit-add-to-library').html(
          '<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>'
        );
        this.trigger('library-add', data);
      }

      // else if creating new library
      else if ((!selected || selected === '0') && createNew) {
        data.name = this.model.get('newLibraryName');
        if (this.model.get('selected')) {
          data.recordsToAdd = this.$('#all-vs-selected').val();
        } else {
          data.recordsToAdd = 'all';
        }

        data.name = this.model.get('newLibraryName') || '';
        data.name = data.name.trim();
        // show loading view
        this.$('.submit-add-to-library').html(
          '<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>'
        );
        this.trigger('library-create', data);
      }

      // both selected, invalid
      else if (selected && selected !== '0' && createNew) {
        this.model.set('feedback', {
          success: false,
          error: 'Either select from an existing or create a new one',
        });
      }

      // none selected, invalid
      else {
        this.model.set('feedback', {
          success: false,
          error: 'Select from an existing library or create a new one',
        });
      }
    },

    toggleLibraryDrawer: function() {
      this.model.set(
        'libraryDrawerOpen',
        !this.model.get('libraryDrawerOpen'),
        { silent: true }
      );
    },

    onOpen() {
      this.model.set('libraryDrawerOpen', true);
      this.model.trigger('change:libraryDrawerOpen');
    },

    onClose() {
      this.model.set('libraryDrawerOpen', false);
      this.model.trigger('change:libraryDrawerOpen');
    },

    onRender: function() {
      this.$('.icon-help').popover({
        trigger: 'hover',
        placement: 'right',
        html: true,
      });

      this.$('#library-console')
        .off('show.bs.collapse', this.onOpen)
        .on('show.bs.collapse', this.onOpen)
        .off('hide.bs.collapse', this.onClose)
        .on('hide.bs.collapse', this.onClose);
    },
  });

  _.extend(QueryDisplayView.prototype, FormatMixin);

  var Widget = BaseWidget.extend({
    modelConstructor: QueryModel,
    viewConstructor: QueryDisplayView,

    initialize: function(options) {
      options = options || {};

      this.model = new QueryModel();
      this.view = new QueryDisplayView({
        model: this.model,
        template: options.template,
      });
      BaseWidget.prototype.initialize.call(this, options);
    },

    viewEvents: {
      'clear-selected': 'clearSelected',
      'limit-to-selected': 'limitToSelected',
      'exclude-selected': 'excludeSelected',
      'library-add': 'libraryAddSubmit',
      'library-create': 'libraryCreateSubmit',
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      _.bindAll(this);

      var that = this;

      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.STORAGE_PAPER_UPDATE, this.onStoragePaperChange);
      pubsub.subscribe(pubsub.LIBRARY_CHANGE, this.processLibraryInfo);
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.handleUserAnnouncement);

      // check if user is signed in (because widget was just instantiated, but app might have been running for a while
      if (
        this.getBeeHive()
          .getObject('User')
          .isLoggedIn()
      ) {
        // know whether to show library panel
        this.model.set('loggedIn', true);
        // fetch list of libraries
        var libraryData = this.getBeeHive()
          .getObject('LibraryController')
          .getLibraryMetadata()
          .done(function(data) {
            that.processLibraryInfo(data);
          });
      }
    },

    handleUserAnnouncement: function(event, arg) {
      var user = this.getBeeHive().getObject('User');
      if (event == user.USER_SIGNED_IN) {
        this.model.set('loggedIn', true);
      } else if (event == user.USER_SIGNED_OUT) {
        this.model.set('loggedIn', false);
      }
    },

    onStoragePaperChange: function(numSelected) {
      this.model.set('selected', numSelected);
    },

    processLibraryInfo: function(data) {
      data.sort(function(a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
      this.model.set('libraries', data);
    },

    clearSelected: function() {
      this.getBeeHive()
        .getObject('AppStorage')
        .clearSelectedPapers();
    },

    limitToSelected: function() {
      const ps = this.getPubSub();
      ps.publish(ps.CUSTOM_EVENT, 'second-order-search/limit');
    },

    excludeSelected: function() {
      const ps = this.getPubSub();
      ps.publish(ps.CUSTOM_EVENT, 'second-order-search/exclude');
    },

    libraryAddSubmit: function(data) {
      var options = {};
      var that = this;

      options.library = data.libraryID;
      // are we adding the current query or just the selected bibcodes?
      // if it's an abstract page widget, will have this._bibcode val
      if (this.abstractPage) {
        options.bibcodes = [this._bibcode];
      } else {
        options.bibcodes = data.recordsToAdd;
      }

      var name = _.findWhere(this.model.get('libraries'), {
        id: data.libraryID,
      }).name;

      // this returns a promise
      this.getBeeHive()
        .getObject('LibraryController')
        .addBibcodesToLib(options)
        .done(function(response, status) {
          var numAlreadyInLib =
            response.numBibcodesRequested - parseInt(response.number_added);
          that.model.unset('selectedLibrary');
          that.model.set('feedback', {
            success: true,
            name: name,
            id: data.libraryID,
            numRecords: response.number_added,
            numAlreadyInLib: numAlreadyInLib,
          });
        })
        .fail(function(response) {
          that.model.set('feedback', {
            success: false,
            name: name,
            id: data.libraryID,
            error: JSON.parse(arguments[0].responseText).error,
          });
        });

      this.clearFeedbackWithDelay();
    },

    libraryCreateSubmit: function(data) {
      var options = {},
        that = this;
      // are we adding the current query or just the selected bibcodes?
      // if it's an abstract page widget, will have this._bibcode val
      if (this.abstractPage) {
        options.bibcodes = [this._bibcode];
      } else {
        options.bibcodes = data.recordsToAdd;
      }
      options.name = data.name;
      // XXX:rca - to decide
      this.getBeeHive()
        .getObject('LibraryController')
        .createLibAndAddBibcodes(options)
        .done(function(response, status) {
          // reset library add name (in input field)
          that.model.set('newLibraryName', undefined);

          that.model.set('feedback', {
            create: true,
            success: true,
            name: data.name,
            id: response.id,
            numRecords: response.bibcode.length,
          });
        })
        .fail(function(response) {
          that.model.set('feedback', {
            success: false,
            name: data.name,
            create: true,
            error: JSON.parse(arguments[0].responseText).error,
          });
        });

      this.clearFeedbackWithDelay();
    },

    clearFeedbackWithDelay: function() {
      var that = this,
        // ten seconds
        timeout = 30000;

      setTimeout(function() {
        that.model.unset('feedback');
      }, timeout);
    },

    processResponse: function(apiResponse) {
      var q = apiResponse.getApiQuery();
      var filters = [];
      _.each(q.keys(), function(k) {
        if (k.substring(0, 2) == 'fq') {
          _.each(q.get(k), function(v) {
            if (v.indexOf('{!') == -1) {
              filters.push(v);
            }
          });
        }
      });
      this.view.model.set('fq', filters);
    },
  });

  return Widget;
});
