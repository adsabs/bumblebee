define([
  'jquery',
  'underscore',
  'marionette',
  'hbs!js/page_managers/templates/results-page-layout',
  'hbs!js/page_managers/templates/results-control-row',
  'js/widgets/base/base_widget',
  './three_column_view',
  './view_mixin',
  'js/mixins/dependon'
],
function ($, _,
  Marionette,
  pageTemplate,
  controlRowTemplate,
  BaseWidget,
  ThreeColumnView,
  PageManagerViewMixin,
  Dependon
) {

  var PRIORITY_WIDGETS = [
    'ShowAbstract'
  ];

  var PageManagerController = BaseWidget.extend({

    initialize: function (options) {
      this.widgets = {};
      this.widgetDoms = {};
      this.initialized = false;
      this.widgetId = null;
      this.assembled = false;
      _.extend(this, _.pick(options, ['debug', 'widgetId']));
    },

    /**
       * Necessary step: during activation we'll collect list of widgets
       * that were referenced by the template (and store them for future
       * reference)
       *
       * @param beehive
       */
    activate: function (beehive) {
      this.setBeeHive(beehive);
      this.debug = beehive.getDebug(); // XXX:rca - think of st better
      this.view = this.createView({ debug: this.debug, widgets: this.widgets });
    },

    setWidgetId: function (n) {
      this.widgetId = n;
    },

    /**
       * Creates the view: the pagemanger view (from the template
       * that references widgets)
       *
       * @param options
       * @returns {ThreeColumnView}
       */
    createView: function (options) {
      return new ThreeColumnView(options);
    },

    /**
       * Render the widgets and append them inside the appropriate places inside the
       * template. This happens only 1x during the lifetime of the page manager
       *
       * @param app
       */
    assemble: function (app) {
      var defer = $.Deferred();
      if (this.assembled) {
        defer.resolve(this.view.el);
        return defer.promise();
      }

      this.assembled = true;
      this.view.render();

      var self = this,
        el;
      _.extend(self.widgetDoms, self.getWidgetsFromTemplate(self.view.$el));
      var promises = [];

      _.each(self.widgetDoms, function (widgetDom, widgetName) {
        if (!app.hasWidget(widgetName)) {
          delete self.widgetDoms[widgetName];
          delete self.widgets[widgetName];
          return;
        }

        var promise = app._getWidget(widgetName).done(function(widget) {
          if (self.persistentWidgets && self.persistentWidgets.indexOf(widgetName) > -1) {
            // this increments the counter so the widget won't be de-referenced when this
            // page manager is disassembled
            app.incrRefCount('widget', widgetName);
          }

          if (widget) {
            var doRender = function () {
              // in case the user passed data params on the dom element,
              // create props on the widget
              _.assign(widget, { componentParams: $(widgetDom).data() });

              if (window.__PRERENDERED && widget.view && PRIORITY_WIDGETS.indexOf(widgetName) > -1) {
                var $el = $('*[data-widget="' + widgetName + '"]');
                widget.view.handlePrerenderedContent($el);
                window.__PRERENDERED = false;
              } else {
                el = widget.getEl ? widget.getEl() : widget.render().el;
                $(self.widgetDoms[widgetName]).html(el);
              }
            };

            // maybe it is a page-manager (this is a security hole though!)
            widget.assemble ? widget.assemble(app).done(doRender) : doRender();
            self.widgets[widgetName] = widget;
          }
        });
        promises.push(promise);
      }, this);

      $.when.apply($, promises)
        .then(function () {
          defer.resolve();
        })
        .fail(function () {
          console.error('Generic error - we were not successul in assembling page');
          if (arguments.length) console.error(arguments);
          defer.reject();
        });
      return defer.promise();
    },

    disAssemble: function (app) {
      _.each(_.keys(this.widgets), function (widgetName) {
        var widget = this.widgets[widgetName];
        if (widget.disAssemble) widget.disAssemble();
        app.returnWidget(widgetName);
        if (!app._isBarbarianAlive('widget:' + widgetName)) {
          $(this.widgetDoms[widgetName]).empty();
        } else {
          $(this.widgetDoms[widgetName]).detach();
        }
        delete this.widgets[widgetName];
        delete this.widgetDoms[widgetName];
      }, this);
      this.assembled = false;
    },

    /**
       * Display the widgets that are under our control (and hide all the rest)
       *
       * @param pageName
       * @returns {exports.el|*|queryBuilder.el|p.el|AppView.el|view.el}
       */
    show: function (pageName) {
      var self = this;

      if (!pageName) {
        this.showAll();
      } else {
        this.hideAll();

        // show just those that are requested + always show alerts widget
        var args = [].slice.apply(arguments);
        _.each(args, function (widgetName) {
          if (self.widgets[widgetName]) {
            var widget = self.widgets[widgetName];

            // don't call render each time or else we
            // would have to re-delegate widget events
            var $wcontainer = self.view.$el.find('[data-widget="' + widgetName + '"]');
            if ($wcontainer.length) {
              var d = $wcontainer.data('debug');
              if (d !== undefined && d && !self.debug) {
                return; // skip widgets that are there only for debugging
              }
              $wcontainer.append(widget.el ? widget.el : widget.view.el);

              // set data props from the container on the widget
              _.assign(widget, {
                componentParams: $wcontainer.data()
              });

              try {
                self.widgets[widgetName].triggerMethod('show');
              } catch (e) {
                console.error('Error when displaying widget: ' + widgetName, e.message, e.stack);
              }
            } else {
              console.warn('Cannot insert widget: ' + widgetName + ' (no selector [data-widget="' + widgetName + '"])');
            }
          } else if (self.debug) console.error('Cannot show widget: ' + widgetName + '(because, frankly... there is no such widget there!)');
        });
      }

      this.triggerMethod('show');
      return this.view;
    },

    hideAll: function () {
      // hide all widgets that are under our control
      _.each(this.widgets, function (w) {
        if (w.noDetach) return;
        if ('detach' in w && _.isFunction(w.detach)) {
          w.detach();
        } else if (w.view && w.view.$el) {
          w.view.$el.detach();
        } else if (w.$el) {
          w.$el.detach();
        }
      });
      return this.view;
    },


    showAll: function () {
      var self = this;
      // show just those that are requested
      _.each(_.keys(self.widgets), function (widgetName) {
        var widget = self.widgets[widgetName];
        // don't call render each time or else we
        // would have to re-delegate widget events
        var $wcontainer = self.view.$el.find('[data-widget="' + widgetName + '"]');
        $wcontainer.append(widget.el ? widget.el : widget.view.el);

        // set data props from the container on the widget
        _.assign(widget, {
          componentParams: $wcontainer.data()
        });
        self.widgets[widgetName].triggerMethod('show');
      });
      return this.view;
    },

    /**
       * broadcast the event to all other managed widgets
       * (call trigger on them)
       */
    broadcast: function () {
      var args = arguments;
      _.each(this.widgets, function (widget, widgetName) {
        widget.trigger.apply(widget, args);
      }, this);
    }

  });

  _.extend(PageManagerController.prototype, PageManagerViewMixin, Dependon.BeeHive, {
    // override the pubsub - we give every child the same (hardened)
    // instance of pubsub
    getPubSub: function () {
      if (this._ps && this.hasPubSub()) return this._ps;
      this._ps = this.getBeeHive().getHardenedInstance().getService('PubSub');
      return this._ps;
    }
  });
  return PageManagerController;
});
