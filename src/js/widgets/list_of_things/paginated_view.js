/**
 * Paginated view - it displays controls under the list of items.
 *
 */

define([
  'lodash/dist/lodash.compat',
  'marionette',
  'backbone',
  'js/components/api_request',
  'js/components/api_query',
  'js/widgets/base/base_widget',
  'js/widgets/list_of_things/templates/item-template.hbs',
  'js/widgets/list_of_things/templates/results-container-template.hbs',
  'js/mixins/link_generator_mixin',
  'js/mixins/add_stable_index_to_collection',
  'js/widgets/list_of_things/templates/empty-view-template.hbs',
  'js/widgets/list_of_things/templates/error-view-template.hbs',
  'js/widgets/list_of_things/templates/initial-view-template.hbs',
  'js/widgets/list_of_things/item_view',
  'analytics',
  '../../wraps/widget/loading/template.hbs',
], function(
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
  loadingTemplate
) {
  /**
   * A simple model that holds attributes of the
   * paginated view. Changes in this model are
   * propagated to the view
   */
  var MainViewModel = Backbone.Model.extend({
    defaults: function() {
      return {
        mainResults: false,
        title: undefined,
        // assuming there will always be abstracts
        showAbstract: 'closed',
        // often they won't exist
        showHighlights: false,
        showSidebars: true,
        pagination: true,
        start: 0,
        highlightsLoaded: false,
      };
    },
  });

  const getSuggestedQuery = (_query) => {
    const query = _query.clone();
    const q = query.get('q');

    // if the whole query is uppercase, lower it
    if (q[0] === q[0].toUpperCase()) {
      query.set('q', q[0].toLowerCase());
      query.unset('fl');
      return {
        url: '#search/' + query.url(),
        query: query.get('q'),
      };
    }
  };

  var EmptyView = Marionette.ItemView.extend({
    template: function(data) {
      if (data.query) {
        return EmptyViewTemplate(data);
      }
      if (data.error) {
        return ErrorViewTemplate(data);
      }
      return loadingTemplate(
        _.extend(data, {
          widgetLoadingSize: 'big',
          hideCloseButton: true,
        })
      );
    },
  });

  /**
   * This is the main view of the list of things. A composite
   * view that holds collection of items.
   */
  var ListOfThingsView = Marionette.CompositeView.extend({
    childView: ItemView,
    emptyView: EmptyView,

    initialize: function(options) {
      this.model = new MainViewModel();
    },

    serializeData: function() {
      var data = this.model.toJSON();
      // if it's an abstract page list with an 'export to results page'
      // option, provide the properly escaped url
      if (data.queryOperator) {
        data.queryURL = '#search/q=' + data.queryOperator + '(';
        data.queryURL += encodeURIComponent('bibcode:' + data.bibcode) + ')';
        if (data.removeSelf) data.queryURL += encodeURIComponent(' -bibcode:' + data.bibcode);
        if (data.sortOrder) data.queryURL += '&sort=' + encodeURIComponent(data.sortOrder);
      }
      return data;
    },

    onRender: function() {
      if (window.MathJax && window.MathJax.startup) {
        window.MathJax.startup.promise
          .then(() => {
            window.MathJax.typesetPromise([this.el]);
          })
          .catch((err) => console.error('MathJax failed to initialize:', err));
      }
    },

    className: 'list-of-things',

    alreadyRendered: false,

    emptyViewOptions: function(model) {
      var query = this.model.get('query');
      var isTugboat = this.model.get('isTugboat');
      var error = this.model.get('error');
      this.model.unset('error', {
        silent: true,
      });

      if (_.isArray(query)) {
        model.set({
          query: query[0],
          showTugboatMessage: isTugboat,
          suggestedQuery: getSuggestedQuery(this.model.get('currentQuery')),
        });
      } else if (_.has('query', query)) {
        model.set({
          query: query.query[0],
          showTugboatMessage: isTugboat,
          suggestedQuery: getSuggestedQuery(this.model.get('currentQuery')),
        });
      } else if (error) {
        model.set('error', error);
      }

      return {
        model: model,
      };
    },

    childViewContainer: '.results-list',

    events: {
      'click .show-highlights': 'toggleHighlights',
      'click .show-abstract': 'toggleAbstract',
      'click .toggle-sidebars': 'toggleShowSidebars',
      'click #go-to-bottom': 'goToBottom',
      'click #backToTopBtn': 'goToTop',
      'click a.page-control': 'changePageWithButton',
      'keyup input.page-control': 'tabOrEnterChangePageWithInput',
      'change #per-page-select': 'changePerPage',
    },

    toggleHighlights: function(e) {
      var state = this.model.get('showHighlights');
      state = _.isBoolean(state) && state ? 'closed' : state === 'open' ? 'closed' : 'open';

      this.model.set('showHighlights', state);
      if (!this.model.get('highlightsLoaded')) {
        this.model.set('highlightsLoaded', true);
        this.trigger('toggle-highlights', state === 'open');
      }
      analytics('send', 'event', 'interaction', `search_result_meta_toggled`, {
        search_result_meta_name: 'highlights',
        search_result_meta_state: state === 'open' ? 'open' : 'closed',
      });
    },

    toggleAbstract: function() {
      const value = this.model.get('showAbstract');
      this.model.set('showAbstract', value === 'open' ? 'closed' : 'open');
      analytics('send', 'event', 'interaction', `search_result_meta_toggled`, {
        search_result_meta_name: 'abstracts',
        search_result_meta_state: value === 'open' ? 'open' : 'closed',
      });
    },

    toggleShowSidebars: function() {
      var val = !this.model.get('showSidebars');
      this.model.set('showSidebars', val);
      analytics('send', 'event', 'interaction', `search_result_meta_toggled`, {
        search_result_meta_name: 'sidebars',
        search_result_meta_state: val ? 'open' : 'closed',
      });
    },

    goToBottom: function() {
      $(document.documentElement).animate(
        {
          scrollTop: this.$el.outerHeight(),
        },
        'fast'
      );
    },

    goToTop: function() {
      $(document.documentElement).animate(
        {
          scrollTop: 0,
        },
        'fast'
      );
    },

    modelEvents: {
      change: 'render',
      'change:showHighlights': 'toggleChildrenHighlights',
      'change:showAbstract': 'toggleChildrenAbstracts',
    },

    collectionEvents: {
      reset: 'onResetCollection',
    },

    template: ResultsContainerTemplate,

    onResetCollection: function() {
      this.model.set('highlightsLoaded', false);
      this.model.trigger('change:showAbstract');
    },

    /**
     * Displays the are inside of every item-view
     * with details (this place is normally hidden
     * by default)
     */
    toggleChildrenHighlights: function() {
      var show = this.model.get('showHighlights');
      this.collection.invoke('set', 'showHighlights', show === 'open');
    },

    toggleChildrenAbstracts: function() {
      var show = this.model.get('showAbstract');
      this.collection.invoke('set', 'showAbstract', show === 'open');
    },

    changePageWithButton: function(e) {
      var $target = $(e.currentTarget);
      if ($target.parent().hasClass('disabled')) return;
      var transform = $target.hasClass('next-page') ? 1 : -1;
      var pageVal = this.model.get('page') + transform;
      this.trigger('pagination:select', pageVal);

      if (this.resultsWidget) {
        analytics('send', 'event', 'interaction', 'results-list-pagination', pageVal);
      }
      return false;
    },

    tabOrEnterChangePageWithInput: function(e) {
      // subtract one since pages are 0 indexed
      var pageVal = parseInt($(e.target).val() - 1);
      // enter or tab
      if (e.keyCode == 13 || e.keyCode == 9) {
        this.trigger('pagination:select', pageVal);
      }

      if (this.resultsWidget) {
        analytics('send', 'event', 'interaction', 'results-list-pagination', pageVal);
      }
    },

    changePerPage: function(e) {
      var val = parseInt(e.currentTarget ? e.currentTarget.value : 25);
      val !== this.model.get('perPage') && this.trigger('pagination:changePerPage', val);
      return false;
    },
  });

  return ListOfThingsView;
});
