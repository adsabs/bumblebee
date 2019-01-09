define([
  'underscore',
  'marionette',
  'hbs!js/page_managers/templates/results-page-layout',
  'hbs!js/page_managers/templates/results-control-row',
  'js/widgets/base/base_widget'
],
function (
  _,
  Marionette,
  pageTemplate,
  controlRowTemplate
) {
  /*
       * keeps track of the open/closed state of the three columns
       * */
  var ResultsStateModel = Backbone.Model.extend({
    defaults: function () {
      return {
        left: 'open',
        right: 'open',
        user_left: null,
        user_right: null,
      };
    }
  });


  var ThreeColumnView = Marionette.ItemView.extend({

    initialize: function (options) {
      var options = options || {};
      this.widgets = options.widgets;
      this.model = new ResultsStateModel();
    },

    destroy: function () {
      Marionette.ItemView.prototype.destroy.call(this, arguments);
    },

    template: pageTemplate,

    modelEvents: {
      'change:left': '_updateColumnView',
      'change:right': '_updateColumnView',
    },

    events: {
      'click .btn-expand': 'onClickToggleColumns'
    },

    onRender: function () {
      this.$('#results-control-row')
        .append(controlRowTemplate());

      this.displaySearchBar(this.options.displaySearchBar);
      this.displayControlRow(this.options.displayControlRow);
      this.displayLeftColumn(this.options.displayLeftColumn);
      this.displayRightColumn(this.options.displayRightColumn);
      this.displayMiddleColumn(this.options.displayMiddleColumn);
    },

    onShow: function () {
      // these functions must be called every time the template is inserted
      this.displaySearchBar(true);
    },

    displaySearchBar: function (show) {
      $('#search-bar-row').toggle(show === undefined ? true : show);
    },

    displayLeftColumn: function (show) {
      this.$('.s-left-col-container').toggle(show === undefined ? true : show);
    },

    displayControlRow: function (show) {
      this.$('#results-control-row').toggle(show === undefined ? true : show);
    },

    displayRightColumn: function (show) {
      this.$('.s-left-col-container').toggle(show === undefined ? true : show);
    },

    displayMiddleColumn: function (show) {
      this.$('.s-left-col-container').toggle(show === undefined ? true : show);
    },


    _returnBootstrapClasses: function () {
      var classes = this.classList;
      var toRemove = [];
      _.each(classes, function (c) {
        if (c.indexOf('col-') !== -1) {
          toRemove.push(c);
        }
      });
      return toRemove.join(' ');
    },

    /**
         * Method to display/hide columns, accepts object with keys:
         *  left: true/false
         *  right: true|false
         *  force: true if you want to override user action (i.e. open
         *         column, even if they changed it manually)
         * @param options
         */
    showCols: function (options) {
      options = options || { left: true, right: true, force: false };
      var keys = ['left', 'right'];
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k in options) {
          var ul = this.model.get('user_' + k);
          if (ul === null) {
            this.model.set(k, options[k] ? 'open' : 'closed');
          } else if (options.force) {
            this.model.set(k, options[k] ? 'open' : 'closed');
            this.model.set('user_' + k, null);
          }
        }
      }
    },


    _updateColumnView: function () {
      var leftState,
        rightState,
        $leftCol,
        $rightCol,
        $middleCol;

      leftState = this.model.get('left');
      rightState = this.model.get('right');

      $leftCol = this.$('#results-left-column');
      $rightCol = this.$('#results-right-column');
      $middleCol = this.$('#results-middle-column');


      _.each([['left', leftState, $leftCol], ['right', rightState, $rightCol]], function (x) {
        if (x[1] == 'open') {
          x[2].removeClass('hidden');
          var $col = x[2];
          setTimeout(function () {
            $col.children().show(0);
          }, 200);
        } else {
          x[2].addClass('hidden');
        }
      });

      if (leftState === 'open' && rightState === 'open') {
        $middleCol.removeClass(this._returnBootstrapClasses)
          .addClass('col-sm-9 col-md-7');
      }
      // else if (leftState === "closed" && rightState === "open") {
      //  $middleCol.removeClass(this._returnBootstrapClasses)
      //      .addClass("col-md-9 col-sm-12")
      // }
      // else if (leftState === "open" && rightState === "closed") {
      //  $middleCol.removeClass(this._returnBootstrapClasses)
      //      .addClass("col-md-10 col-sm-8")
      // }
      else if (leftState === 'closed' && rightState === 'closed') {
        $middleCol.removeClass(this._returnBootstrapClasses)
          .addClass('col-md-12 col-sm-12');
      }
    }

  });
  return ThreeColumnView;
});
