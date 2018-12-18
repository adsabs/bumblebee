/**
 * Paginated view - it displays controls under the list of items.
 *
 */

define([
  'underscore',
  'marionette',
  'backbone',
  'js/components/api_request',
  'js/components/api_query',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/list_of_things/templates/item-template',
  'hbs!js/widgets/list_of_things/templates/results-container-template',
  'js/mixins/link_generator_mixin',
  'js/mixins/add_stable_index_to_collection',
  'hbs!js/widgets/list_of_things/templates/empty-view-template',
  'hbs!js/widgets/list_of_things/templates/error-view-template',
  'hbs!js/widgets/list_of_things/templates/initial-view-template',
  './item_view',
  'analytics',
  'mathjax',
  'hbs!js/wraps/widget/loading/template'
],

function (
  _,
  Marionette,
  Backbone,
  ApiRequest,
  ApiQuery,
  BaseWidget,
  ItemTemplate,
  ResultsContainerTemplate,
  LinkGenerator,
  WidgetPaginationMixin,
  EmptyViewTemplate,
  ErrorViewTemplate,
  InitialViewTemplate,
  ItemView,
  analytics,
  MathJax,
  loadingTemplate
) {
  /**
     * A simple model that holds attributes of the
     * paginated view. Changes in this model are
     * propagated to the view
     */
  var MainViewModel = Backbone.Model.extend({
    defaults: function () {
      return {
        mainResults: false,
        title: undefined,
        // assuming there will always be abstracts
        showAbstract: 'closed',
        // often they won't exist
        showHighlights: false,
        pagination: true,
        start: 0,
        highlightsLoaded: false
      };
    }
  });

  var EmptyView = Marionette.ItemView.extend({
    template: function (data) {
      if (data.query) {
        return EmptyViewTemplate(data);
      } if (data.error) {
        return ErrorViewTemplate(data);
      }
      return loadingTemplate(_.extend(data, {
        widgetLoadingSize: 'big',
        hideCloseButton: true
      }));
    }
  });

    /**
     * This is the main view of the list of things. A composite
     * view that holds collection of items.
     */
  var ListOfThingsView = Marionette.CompositeView.extend({

    childView: ItemView,
    emptyView: EmptyView,

    initialize: function (options) {
      this.model = new MainViewModel();
    },

    serializeData: function () {
      var data = this.model.toJSON();
      // if it's an abstract page list with an 'export to results page'
      // option, provide the properly escaped url
      if (data.queryOperator) {
        data.queryURL = '/search/q=' + data.queryOperator + '(';
        data.queryURL += encodeURIComponent('bibcode:' + data.bibcode) + ')';
        if (data.removeSelf) data.queryURL += encodeURIComponent(' -bibcode:' + data.bibcode);
        if (data.sortOrder) data.queryURL += '&sort=' + encodeURIComponent(data.sortOrder);
      }
      return data;
    },

    onRender: function () {
      if (MathJax) {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.el]);
      }
    },

    className: 'list-of-things',

    alreadyRendered: false,

    emptyViewOptions: function (model) {
      var query = this.model.get('query');
      var error = this.model.get('error');
      this.model.unset('error', { silent: true });

      if (_.isArray(query)) {
        model.set('query', query[0]);
      } else if (_.has('query', query)) {
        model.set('query', query.query[0]);
      } else if (error) {
        model.set('error', error);
      }

      return {
        model: model
      };
    },

    childViewContainer: '.results-list',

    events: {
      'click .show-highlights': 'toggleHighlights',
      'click .show-abstract': 'toggleAbstract',
      'click .toggle-make-space': 'toggleMakeSpace',
      'click #go-to-bottom': 'goToBottom',
      'click #backToTopBtn': 'goToTop',
      'click a.page-control': 'changePageWithButton',
      'keyup input.page-control': 'tabOrEnterChangePageWithInput',
      'change #per-page-select': 'changePerPage'
    },

    toggleHighlights: function (e) {
      var state = this.model.get('showHighlights');
      state = _.isBoolean(state) && state
        ? 'closed' : (state === 'open') ? 'closed' : 'open';

      this.model.set('showHighlights', state);
      if (!this.model.get('highlightsLoaded')) {
        this.model.set('highlightsLoaded', true);
        this.trigger('toggle-highlights', state === 'open');
      }
    },

    toggleAbstract: function () {
      if (this.model.get('showAbstract') == 'open') {
        this.model.set('showAbstract', 'closed');
      } else if (this.model.get('showAbstract') == 'closed') {
        this.model.set('showAbstract', 'open');
        analytics('send', 'event', 'interaction', 'abstracts-toggled-on');
      }
    },

    toggleMakeSpace: function () {
      var val = !this.model.get('makeSpace');
      this.model.set('makeSpace', val);
      analytics('send', 'event', 'interaction', 'sidebars-toggled-' + val ? 'on' : 'off');
    },

    goToBottom: function () {
      $('#app-container')
        .animate({ scrollTop: this.$el.outerHeight() }, 'fast');
    },

    goToTop: function () {
      $('#app-container')
        .animate({ scrollTop: 0 }, 'fast');
    },

    modelEvents: {
      'change': 'render',
      'change:showHighlights': 'toggleChildrenHighlights',
      'change:showAbstract': 'toggleChildrenAbstracts'
    },

    collectionEvents: {
      'reset': 'onResetCollection'
    },

    template: ResultsContainerTemplate,

    onResetCollection: function () {
      this.model.set('highlightsLoaded', false);
    },

    /**
       * Displays the are inside of every item-view
       * with details (this place is normally hidden
       * by default)
       */
    toggleChildrenHighlights: function () {
      var show = this.model.get('showHighlights');
      this.collection.invoke('set', 'showHighlights', show === 'open');
    },

    toggleChildrenAbstracts: function () {
      var show = this.model.get('showAbstract');
      this.collection.invoke('set', 'showAbstract', show === 'open');
    },

    changePageWithButton: function (e) {
      e.preventDefault();
      var $target = $(e.currentTarget);
      if ($target.parent().hasClass('disabled')) return;
      var transform = $target.hasClass('next-page') ? 1 : -1;
      var pageVal = this.model.get('page') + transform;
      this.trigger('pagination:select', pageVal);

      if (this.resultsWidget) { analytics('send', 'event', 'interaction', 'results-list-pagination', pageVal); }
    },

    tabOrEnterChangePageWithInput: function (e) {
      // subtract one since pages are 0 indexed
      var pageVal = parseInt($(e.target).val() - 1);
      // enter or tab
      if (e.keyCode == 13 || e.keyCode == 9) {
        this.trigger('pagination:select', pageVal);
      }

      if (this.resultsWidget) { analytics('send', 'event', 'interaction', 'results-list-pagination', pageVal); }
    },

    changePerPage: function (e) {
      e.preventDefault();
      var val = parseInt(e.currentTarget ? e.currentTarget.value : 25);
      val !== this.model.get('perPage') && this.trigger('pagination:changePerPage', val);
    }
  });


  return ListOfThingsView;
});
