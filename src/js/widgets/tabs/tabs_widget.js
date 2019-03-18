/**
 * Created by alex on 5/12/14.
 */
define([
  'underscore',
  'marionette',
  'bootstrap',
  'hbs!js/widgets/tabs/templates/tabs_inner',
  'hbs!js/widgets/tabs/templates/tabs_outer',
  'hbs!js/widgets/tabs/templates/tabs_title'],
function (
  _,
  Marionette,
  Bootstrap,
  innerTemplate,
  outerTemplate,
  titleTemplate) {
  var TabsWidget = Marionette.ItemView.extend({

    // expects in options a list of views like this:
    // {tabs: [{title : (title for tab) , widget: (actual widget), id : (unique id)}, {default : true/false} (a tab widget has only one default tab)]}

    /**
     * Activates all widgets (our children)  - we return them so that application
     * can correctly register them
     *
     * @param beehive (hardened version)
     */

    className: 's-tabs-widget',

    activate: function (beehive) {
      var children = [];
      var hardenedBee;
      _.each(this.widgets, function (w) {
        w.activate(hardenedBee = beehive.getHardenedInstance());
        children.push({ name: w.title, object: w, beehive: hardenedBee });
      });

      return children;
    },

    initialize: function (options) {
      this.tabs = options.tabs || [];
      this.widgets = _.map(this.tabs, function (t, i) {
        if (!t.widget) {
          throw new Error('Missing "widget" for: ' + t.title + ' [' + i + ']');
        }
        t.widget.trigger(t['default'] ? 'active' : 'hidden');
        return t.widget;
      });
      this.on('active', this.onActive);
      this.on('hidden', this.onHidden);
    },

    // overriding marionette render method
    render: function () {
      if (this.beforeRender) {
        this.beforeRender();
      }
      this.trigger('before:render', this);

      var $tempEl = $(outerTemplate());
      var $nav = $tempEl.find('ul.nav'),
        $tab = $tempEl.find('div.tab-content');

      _.each(this.tabs, function (t) {
        $nav.append(titleTemplate({ 'id': t.id, 'title': t.title, 'default': t.default }));
        $tab.append(innerTemplate({ 'id': t.id, 'default': t.default }));
      }, this);

      this.$el.html($tempEl.html());
      _.each(this.tabs, function (t) {
        var self = this;
        // attaching the html of child widgets
        this.$('#' + t.id).append(t.widget.getEl());

        this.$('a[href="#' + t.id + '"]')
          .on('show.bs.tab', function () {
            self.trigger('active', t);
          })
          .on('hide.bs.tab', function () {
            self.trigger('hidden', t);
          });
      }, this);

      this.bindUIElements();

      if (this.onRender) {
        this.onRender();
      }
      this.trigger('render', this);
      return this;
    },

    onDestroy: function () {
      _.each(this.tabs, function (t) {
        if (t.widget.destroy) {
          t.widget.destroy();
        } else if (t.widget.remove) {
          t.widget.remove();
        }
      }, this);
    },

    getEl: function () {
      if (this.el && this.$el.children().length) {
        return this.el;
      }

      return this.render().el;
    },

    onActive: function (tab) {
      tab.widget.trigger('active');
    },

    onHidden: function (tab) {
      tab.widget.trigger('hidden');
    }
  });

  return TabsWidget;
});
