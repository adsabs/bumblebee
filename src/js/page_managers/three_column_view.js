define([
  'lodash/dist/lodash.compat',
  'marionette',
  './templates/results-page-layout.hbs',
  './templates/results-control-row.hbs',
  'js/widgets/base/base_widget',
], function(_, Marionette, pageTemplate, controlRowTemplate) {
  const ResultsStateModel = Backbone.Model.extend({
    defaults: {
      left: 'open',
      right: 'open',
      user_left: null,
      user_right: null,
    },
  });

  return Marionette.ItemView.extend({
    id: 'results-container',
    className: 'results-container',
    template: pageTemplate,

    ui: {
      controlRow: '#results-control-row',
    },

    initialize: function() {
      this.state = new ResultsStateModel();
      this.listenTo(this.state, 'change', this.updateLayout);
    },

    onRender: function() {
      $(this.ui.controlRow).html(controlRowTemplate());
      this.setupToggleButtons();
      this.updateLayout();
    },

    setupToggleButtons: function() {
      this.$('.btn-expand').on('click', (e) => {
        const side = $(e.currentTarget).data('side');
        const current = this.state.get(side);
        const toggled = current === 'open' ? 'closed' : 'open';

        const update = {
          [side]: toggled,
        };
        update[`user_${side}`] = toggled;

        this.state.set(update);
      });
    },

    showCols: function({ left, right, force = false }) {
      const updates = {};

      if (left !== undefined) {
        updates.left = left ? 'open' : 'closed';
        if (force || this.state.get('user_left') === null) {
          updates.user_left = null;
        }
      }

      if (right !== undefined) {
        updates.right = right ? 'open' : 'closed';
        if (force || this.state.get('user_right') === null) {
          updates.user_right = null;
        }
      }

      this.state.set(updates);
    },

    updateLayout: function() {
      const showLeft = this.state.get('left') === 'open';
      const showRight = this.state.get('right') === 'open';

      this.displayColumn('#results-left-column', showLeft);
      this.displayColumn('#results-right-column', showRight);
      this.updateMiddleColumn(showLeft, showRight);
    },

    displayColumn: function(selector, show) {
      this.$(selector).toggle(show);
    },

    updateMiddleColumn: function(showLeft, showRight) {
      const $middle = this.$('#results-middle-column');
      $middle.removeClass('col-md-7 col-md-10 col-md-12');

      let className = 'col-md-7';
      if (!showLeft || !showRight) className = 'col-md-10';
      if (!showLeft && !showRight) className = 'col-md-12';

      $middle.addClass(className);
    },
  });
});
