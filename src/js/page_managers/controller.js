define([
    'jquery',
    'underscore',
    "marionette",
    "hbs!./templates/results-page-layout",
    'hbs!./templates/results-control-row',
    'js/widgets/base/base_widget',
    './three_column_view',
    './view_mixin',
    'js/mixins/dependon'
  ],
  function (
            $,
            _,
            Marionette,
            pageTemplate,
            controlRowTemplate,
            BaseWidget,
            ThreeColumnView,
            PageManagerViewMixin,
            Dependon
            ) {

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
        this.view = this.createView({debug : this.debug, widgets: this.widgets});
      },

      /**
       * Creates the view: the pagemanger view (from the template
       * that references widgets)
       *
       * @param options
       * @returns {ThreeColumnView}
       */
      createView: function(options) {
        return new ThreeColumnView(options);
      },

      /* this will load and instantiate an instance of every
         widget necessary for the page manager
       */

      requireAndInstantiateWidgets : function(app, options) {

        options = options || {};
        var that = this;

        //widgets have already been loaded, just return the promise
        if (this.widgetsInstantiated) return this.widgetsInstantiated;

        if (!app) console.error("requireAndInstantiateWidgets function wasn't provided with an app object");

        _.extend(this.widgetDoms, this.getWidgetsFromTemplate(this.view.render().$el));

        var promises = [],
            delay = 0;

        _.each(this.widgetDoms, function(widgetDom, widgetName) {

          //this option should be provided if widgets are being loaded in the background
          if (options.stagger){

            var d = $.Deferred();
            promises.push(d);

            setTimeout(
                function() {
                  app._getWidget(widgetName).then(function(w){
                    d.resolve.apply($, arguments);
                  });
                }, delay);
            delay +=70;

          }
          else {
            var p = app._getWidget(widgetName);
            promises.push(p);
          }

        }, this);


        this.widgetsInstantiated = $.when.apply($, promises).then(function(){
          var widgets = [].slice.apply(arguments);
          return _.object(_.zip(_.keys(that.widgetDoms), widgets));
        });

        return this.widgetsInstantiated;

      },

      /**
       * Render the widgets and append them inside the appropriate places inside the
       * template. This happens only 1x during the lifetime of the page manager
       *
       * @param app
       */

      /**
      * the disassemble function is applied from the master.js
      **/
      assemble: function(app) {

        var d = $.Deferred();

        if (this.assembled) return d.resolve().promise();

        this.assembled = true;

        var that = this, el;

        var numberWidgetsToBeInserted;

        //this gets called after each widget is fetched
        function onWidgetLoad (widgetName, widget) {

          if (widget) {
            // maybe it is a page-manager (this is a security hole though!)
            if (widget.assemble) {
              widget.assemble(app);
            }

            //reducing unnecessary rendering
            if (widget.getEl){
              el = widget.getEl()
            }
            else {
              el = widget.render().el;
            }
            $(that.widgetDoms[widgetName]).empty().append(el);
            that.widgets[widgetName] = widget;

            numberWidgetsToBeInserted-=1;
            if (numberWidgetsToBeInserted === 0){
              //so that callers of this function can know when everything is inserted!!
              //just added for tests
              d.resolve();
            }
          }

        };


      this.requireAndInstantiateWidgets(app).done(function(widgets){
        numberWidgetsToBeInserted = _.keys(widgets).length;
        _.each(widgets,  function(widget, widgetName){
          onWidgetLoad(widgetName, widget);
        });
      });

        return d.promise();

      },

      /**
       * Display the widgets that are under our control (and hide all the rest)
       *
       * @param pageName
       * @returns {exports.el|*|queryBuilder.el|p.el|AppView.el|view.el}
       */
      show: function(pageName){

        var args = [].slice.apply(arguments);

        var self = this;
        if (!this.widgetsInstantiated){ console.error("page controller wasn't activated in time")}
        else if (this.widgetsInstantiated.state() !== "resolved"){
          this.widgetsInstantiated.done(function(){
            self.show.apply(self, args);
          });
          //it can be returned anyway to the 'master controller' that
          //is trying to show it
          return this.view;
        }
        if (!pageName) {
          this.showAll();
        }
        else {
          this.hideAll();

          // show just those that are requested + always show alerts widget
          var args = [].slice.apply(arguments);
          _.each(args, function(widgetName) {
            if (self.widgets[widgetName]) {
              var widget = self.widgets[widgetName];

              //don't call render each time or else we
              //would have to re-delegate widget events
              var $wcontainer = self.view.$el.find('[data-widget="' + widgetName + '"]');
              if ($wcontainer.length) {
                var d = $wcontainer.data('debug');
                if ( d !== undefined && d && !self.debug) {
                  return; // skip widgets that are there only for debugging
                }
                $wcontainer.append(widget.el ? widget.el : widget.view.el);
                try {
                  self.widgets[widgetName].triggerMethod('show');
                }
                catch (e) {
                  console.error('Error when displaying widget: ' + widgetName, e.message, e.stack);
                }

              }
              else {
                console.warn('Cannot insert widget: ' + widgetName + ' (no selector [data-widget="' + widgetName + '"])');
              }
            }
            else {
              if (self.debug)
                console.error("Cannot show widget: " + widgetName + "(because, frankly... there is no such widget there!)");
            }
          });
        }

        this.triggerMethod("show");
        return this.view;
      },

      hideAll: function() {

        // hide all widgets that are under our control
        _.each(this.widgets, function(w) {
          if (w.noDetach)
              return;
          if ('detach' in w && _.isFunction(w.detach)) {
            w.detach();
          }
          else if (w.view && w.view.$el) {
            w.view.$el.detach();
          }
          else if (w.$el) {
            w.$el.detach();
          }
        });
        return this.view;
      },


      showAll: function() {
        var self = this;
        // show just those that are requested
        _.each(_.keys(self.widgets), function(widgetName) {
            var widget = self.widgets[widgetName];
            //don't call render each time or else we
            //would have to re-delegate widget events
            self.view.$el.find('[data-widget="' + widgetName + '"]').append(widget.el ? widget.el : widget.view.el);
            self.widgets[widgetName].triggerMethod('show');
        });
        return this.view;
      },

      /**
       * broadcast the event to all other managed widgets
       * (call trigger on them)
       */
      broadcast: function(){
        var args = arguments;
        _.each(this.widgets, function(widget, widgetName) {
          widget.trigger.apply(widget, args);
        }, this);
      }

    });

    _.extend(PageManagerController.prototype, PageManagerViewMixin, Dependon.BeeHive, {
      // override the pubsub - we give every child the same (hardened)
      // instance of pubsub
      getPubSub: function() {
        if (this._ps && this.hasPubSub())
          return this._ps;
        this._ps = this.getBeeHive().getHardenedInstance().getService('PubSub');
        return this._ps;
      }
    });
    return PageManagerController;
  });