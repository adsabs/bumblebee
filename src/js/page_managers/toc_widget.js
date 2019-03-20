define([
  'backbone',
  'marionette'
], function (
  Backbone,
  Marionette
) {
  /*
   * widget to coordinate the showing of other widgets within the framework of a TOC page manager
   * You need to provide a template with a nav that looks like this: (with the data attributes
   * corresponding to NAV EVENTS in the navigator.js file, e.g.
   *
   * this.set('ClassicSearchForm', function() {
   * app.getObject('MasterPageManager').show('LandingPage', ["ClassicSearchForm"]);
   * });
   *
   * MUST have a navConfig object: e.g.
   *   navConfig : {
   *   UserPreferences : {"title": "User Preferences", "path":"user/settings/preferences","category":"preferences" },
   *    UserSettings__email : {"title": "Change Email", "path":"user/settings/email","category":"settings"},
   *    }
   *
   *
   toc widget listens to "new-widget" event and, if it can find teh corresponding data in the markup,
   adds an entry to its nav
   the toc controller will call a navigate event when the toc widget emits a "widget-selected" event
   * */


  var WidgetData = Backbone.Model.extend({
    defaults: function () {
      return {
        id: undefined, // widgetId
        path: undefined,
        title: undefined,
        showCount: false,
        category: undefined,
        isActive: false,
        isSelected: false,
        numFound: 0,
        showCount: true,
        alwaysThere: false
      };
    }
  });

  var WidgetCollection = Backbone.Collection.extend({
    model: WidgetData,
    initialize: function () {

      // trigger when one of the models is selected, this ensures that
      // we capture any initial load (like on page load, not directly clicked)
      this.on('change:isSelected', function (model) {

        // only trigger if going from false -> true
        if (model.get('isSelected')) {
          this.trigger('widget-selected', model);
        }
      });
    },
    selectOne: function (widgetId) {
      var s = null;
      this.each(function (m) {
        if (m.id == widgetId) {
          s = m;
        } else {
          m.set('isSelected', false, { silent: true });
        }
      });

      // make sure that `s` exists, otherwise just set it to the first element
      s = s ? s : this.first();
      s.set('isSelected', true);
    },

    comparator: function (m) {
      return m.get('order');
    }
  });


  var WidgetModel = Backbone.Model.extend({

    defaults: function () {
      return {
        bibcode: undefined,
        query: undefined,
        path: undefined,
        idAttribute: undefined
      };
    }
  });

  var TocNavigationView = Marionette.ItemView.extend({

    initialize: function (options) {
      options = options || {};

      this.collection = options.collection || new WidgetCollection();
      this.model = options.model || new WidgetModel();
      this.on('page-manager-message', this.onPageManagerMessage);

      // if any of the models in the collection are selected, trigger an event here
      this.listenTo(this.collection, 'widget-selected', function (model) {
        var val = model.get('id').split('__');
        this.model.set({
          path: model.get('path'),
          idAttribute: val[0],
          subView: val.length > 1 ? val[1] : undefined
        });

        // trigger when collection selection is made
        this.triggerSelection();
      });
      if (!options.template) {
        // for testing
        this.template = function () { return ''; };
      }
    },

    // or else controller will detach, and then never put it back
    noDetach: true,

    serializeData: function () {
      var data = this.model.toJSON(),
        col = this.collection.toJSON(),
        groupedCollectionJSON;

      // if any entries from the data has a "category" param, group by that, otherwise, just return it
      if (_.find(col, function (c) { return c.category !== undefined; })) {
        groupedCollectionJSON = _.groupBy(this.collection.toJSON(), function (object) {
          return object.category;
        });
        data = _.extend(data, groupedCollectionJSON);
      } else {
        data = _.extend(data, { tabs: col });
      }
      return data;
    },

    events: {
      'click a': 'navigateToPage'
    },

    navigateToPage: function (e) {
      var $t = $(e.currentTarget),
        idAttribute = $t.attr('data-widget-id');

      var data = { idAttribute: idAttribute };

      // it's inactive
      if ($t.find('div').hasClass('s-nav-inactive')) {
        return false;
      }
      // it's active
      if (idAttribute !== this.$('.s-nav-selected').attr('data-widget-id')) {
        data.href = $t.attr('href');

        // make sure only a single element is selected
        this.collection.selectOne(idAttribute);

        // finally, close the mobile menu, which might be open
        this.$el.parent('.nav-container').removeClass('show');
        $('button.toggle-menu').html(' <i class="fa fa-bars"></i> Show Menu');
      }
      return false;
    },

    modelEvents: {
      'change:bibcode': 'resetActiveStates',
      'change': 'render'
    },

    collectionEvents: {
      'add': 'render',
      'change:isActive': 'render',
      'change:isSelected': 'render',
      'change:numFound': 'render'
    },

    /*
     every time the bibcode changes (got by subscribing to pubsub.DISPLAY_DOCUMENTS)
     clear the collection of isactive and numfound in the models of the toc widget, so that the next view on
     the widget will show the appropriate defaults
     */
    resetActiveStates: function () {
      this.collection.each(function (model) {
        model.set({
          isSelected: false,
          isActive: true,
          numFound: 0
        });
      });

      // trigger on bibcode update
      this.triggerSelection();
    },

    triggerSelection: function () {

      // if nothing is selected, select the abstract element and return
      if (this.collection.where({ isSelected: true }).length === 0) {
        return this.collection.selectOne('ShowAbstract');
      }
      var path = this.model.get('path') || 'abstract';

      var data = {
        idAttribute: this.model.get('idAttribute') || 'showAbstract',
        subView: this.model.get('subView') || '',
        href: 'abs/' + (this.model.get('bibcode') || '') + '/' + path,
        bibcode: this.model.get('bibcode')
      };
      this.trigger('page-manager-event', 'widget-selected', data);
    },

    onPageManagerMessage: function (event, data) {
      if (event == 'new-widget') {
        // building the toc collection

        var widgetId = arguments[1],
          tocData = Marionette.getOption(this, 'navConfig');

        var widgetData = tocData[widgetId];

        if (widgetData) {
          var toAdd = _.extend(_.clone(widgetData), { id: widgetId });
          this.collection.add(toAdd);
        } else {
          // it might be a widget name + subview in the form ShowExport__bibtex
          // id consists of widgetId + arg param
          var widgetsWithSubViews = _.pick(tocData, function (v, k) {
            return k.split('__') && (k.split('__')[0] == widgetId);
          });
          _.each(widgetsWithSubViews, function (v, k) {
            // arg is the identifying factor-- joining with double underscore so it can be split later
            var toAdd = _.extend(_.clone(v), { id: k });
            this.collection.add(toAdd);
          }, this);
        }
      } else if (event == 'widget-ready') {
        var model = this.collection.get(data.widgetId);
        _.defaults(data, { isActive: !!data.numFound });
        if (model) {
          model.set(_.pick(data, model.keys()));
        }

        // if the widget should reset, switch to the abstract view
        if (data.shouldReset) {
          if (model && model.get('isSelected')) {
            this.collection.selectOne('ShowAbstract');
          }
          model && model.set('isActive', false);
        }
      } else if (event === 'broadcast-payload') {
        this.model.set('bibcode', data.bibcode);
      } else if (event == 'dynamic-nav') {
        // expects object like {links : [{title: x, id : y}]}
        // insert dynamic nav entries into the nav template

      }
    }

  });

  return TocNavigationView;
});
