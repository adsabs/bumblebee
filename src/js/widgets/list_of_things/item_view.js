define([
  'marionette',
  'backbone',
  'js/components/api_request',
  'js/components/api_query',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/list_of_things/templates/item-template',
  'analytics',
  'mathjax',
], function (
  Marionette,
  Backbone,
  ApiRequest,
  ApiQuery,
  BaseWidget,
  ItemTemplate,
  analytics,
  MathJax
) {
  var ItemView = Marionette.ItemView.extend({
    tagName: 'li',
    template: ItemTemplate,
    constructor: function (options) {
      var self = this;
      if (options) {
        _.defaults(
          options,
          _.pick(this, ['model', 'collectionEvents', 'modelEvents'])
        );
      }
      _.bindAll(this, 'resetToggle');

      return Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },

    render: function () {
      if (this.model.get('visible')) {
        return Marionette.ItemView.prototype.render.apply(this, arguments);
      }
      if (this.$el) {
        // it was already rendered, so remove it
        this.$el.empty();
      }

      return this;
    },

    onRender: function () {
      // this is necessary on every render after the initial one, since the
      // containe rview also calls mathjax initially
      if (MathJax) MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.el]);
      $('>', this.$el).on('keyup', (e) => {
        if (e.which === 13) {
          $('a.abs-redirect-link', this.$el).mousedown().mouseup().click();
        }
      });
    },

    events: {
      'change input[name=identifier]': 'toggleSelect',
      'focus .letter-icon': 'showLinks',
      'mouseenter .letter-icon': 'showLinks',
      'mouseleave .letter-icon': 'hideLinks',
      'focusout .letter-icon': 'hideLinks',
      'click .letter-icon a': 'emitAnalyticsEvent',
      'click .show-all-authors': 'showAllAuthors',
      'click .show-less-authors': 'showLessAuthors',
      // only relevant to results view for the moment
      'click .show-full-abstract': 'showFullAbstract',
      'click .hide-full-abstract': 'hideFullAbstract',
      'click .orcid-action': 'orcidAction',
      'click .abs-redirect-link': 'onAbsLinkClick',
      'click .citations-redirect-link': 'onCitationsLinkClick',
    },

    modelEvents: {
      'change:visible': 'render',
      'change:showAbstract': 'render',
      'change:showHighlights': 'render',
      'change:orcid': 'render',
      'change:chosen': 'render',
    },

    collectionEvents: {
      add: 'render',
      'change:visible': 'render',
    },

    emitAnalyticsEvent: function (e) {
      analytics(
        'send',
        'event',
        'interaction',
        'letter-link-followed',
        $(e.target).text()
      );
    },

    onAbsLinkClick: function (e) {
      var bibcode = this.model.get('bibcode');
      analytics('send', 'event', 'interaction', 'abstract-link-followed', {
        target: 'abstract',
        bibcode: bibcode,
      });
    },

    onCitationsLinkClick: function (e) {
      var bibcode = this.model.get('bibcode');
      analytics('send', 'event', 'interaction', 'citations-link-followed', {
        target: 'citations',
        bibcode: bibcode,
      });
    },

    showAllAuthors: function (e) {
      this.$('.s-results-authors.less-authors').addClass('hidden');
      this.$('.s-results-authors.all-authors').removeClass('hidden');
      return false;
    },

    showLessAuthors: function (e) {
      this.$('.s-results-authors.less-authors').removeClass('hidden');
      this.$('.s-results-authors.all-authors').addClass('hidden');
      return false;
    },

    showFullAbstract: function () {
      this.$('.short-abstract').addClass('hidden');
      this.$('.full-abstract').removeClass('hidden');
      return false;
    },

    hideFullAbstract: function () {
      this.$('.short-abstract').removeClass('hidden');
      this.$('.full-abstract').addClass('hidden');
      return false;
    },

    toggleSelect: function () {
      var isChosen = !this.model.get('chosen');

      this.trigger('toggleSelect', {
        selected: isChosen,
        data: this.model.attributes,
      });
      this.model.set('chosen', isChosen);
    },

    resetToggle: function () {
      this.setToggleTo(false);
    },

    setToggleTo: function (to) {
      var $checkbox = $('input[name=identifier]');
      if (to) {
        this.$el.addClass('chosen');
        this.model.set('chosen', true);
        $checkbox.prop('checked', true);
      } else {
        this.$el.removeClass('chosen');
        this.model.set('chosen', false);
        $checkbox.prop('checked', false);
      }
    },

    /*
     * adding this to make the dropdown
     * accessible, and so people can click to sticky
     * open the quick links
     * */

    removeActiveQuickLinkState: function ($node) {
      $node.find('i').removeClass('s-icon-draw-attention');
      $node.find('.link-details').addClass('hidden');
      $node.find('ul').attr('aria-expanded', false);
    },

    addActiveQuickLinkState: function ($node) {
      $node.find('i').addClass('s-icon-draw-attention');
      $node.find('.link-details').removeClass('hidden');
      $node.find('ul').attr('aria-expanded', true);
    },

    deactivateOtherQuickLinks: function ($c) {
      var $hasList = this.$('.letter-icon')
        .filter(function () {
          if (
            $(this)
            .find('i')
            .hasClass('s-icon-draw-attention')
          ) {
            return true;
          }
        })
        .eq(0);

      // there should be max 1 other icon that is active

      if ($hasList.length && $hasList[0] !== $c[0]) {
        this.removeActiveQuickLinkState($hasList);
      }
    },

    showLinks: function (e) {
      var $c = $(e.currentTarget);
      if (!$c.find('.active-link').length) {
        return;
      }

      this.deactivateOtherQuickLinks($c);
      this.addActiveQuickLinkState($c);
    },

    hideLinks: function (e) {
      var $c = $(e.currentTarget);
      this.removeActiveQuickLinkState($c);
    },

    orcidAction: function (e) {
      if (!e) return false;

      var $target = $(e.currentTarget);

      var msg = {
        action: $target.data('action') ?
          $target.data('action') : $target.text().trim(),
        model: this.model,
        view: this,
        target: $target,
      };
      this.trigger('OrcidAction', msg);
      return false;
    },
  });

  return ItemView;
});
