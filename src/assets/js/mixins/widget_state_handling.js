/**
 * This mixins adds predefined changeState interaction to the 'Widget'
 * (i.e. to the controller - this should not be used for views; see
 * 'view_states')
 *
 */
define([
  'underscore',
  'jquery',
  'js/widgets/widget_states',
  'hbs!js/widgets/base/templates/loading-template',
  'hbs!js/widgets/base/templates/loading-template-small',

], function (
  _,
  $,
  WidgetStates,
  LoadingTemplate,
  LoadingTemplateSmall
  ) {

  /**
   * This function tries hard to grab the topmost container (view)
   * of the widget (just using some probable locations)
   *
   * @param widget
   * @returns {*}
   */
  var getView = function(widget) {
    if (widget.view && widget.view.itemContainerView)
      return widget.view.itemContainerView;
    if (_.isFunction(widget.getView))
      return widget.getView();
    if (widget.view)
      return widget.view;
  };


  var handlers = {};

  /**
   * By default, this widget will indicate error by changing its
   * color
   *
   * @param state
   */
  handlers[WidgetStates.ERRORED] = {
    set: function(state) {
      var view = getView(this);
      if (view && view.$el) {
        view.$el.addClass('s-error'); // TODO: eventually, add an error msg
      }
    },
    revert: function() {
      var view = getView(this);
      if (view && view.$el) {
        view.$el.removeClass('s-error');
      }
    }
  };

  /**
   * The widget has requested data and is waiting for them to
   * arrive (we should indicate it)
   */
  handlers[WidgetStates.WAITING] = {
    set: function(state) {
      var view = getView(this);
      if (view && view.$el) {
        if(view.$el.find(".s-loading").length === 0) {
          //if the widget is small, it can have an attribute on the object
          //or be passed an option to show a small loading indicator
          if (Marionette.getOption(view, "smallLoadingIcon")){
            view.$el.append(LoadingTemplateSmall(state));
          }
          else {
            //otherwise, show a larger indivator
            view.$el.append(LoadingTemplate(state));
          }
        }
      }
    },
    revert: function() {
      var view = getView(this);
      if (view && view.$el) {
        if(view.$el.find(".s-loading").length !== 0) {
          view.$el.find(".s-loading").remove();
        }
      }
    }
  };

  handlers[WidgetStates.IDLE] = {
    set: function(state) {
      this._getStateHandler({state: WidgetStates.WAITING}).revert.apply(this, state);
    },
    revert: function() {
      //pass
    }
  };


  var Mixin = {

    widgetStateHandlers: handlers,

    /**
     * This is the entry point for controllers to provide
     * feedback to the user
     */
    changeState: function(newState) {
      this._states = this._states || [];

      if (newState.state == WidgetStates.RESET) {
        if (this._states.length > 0) {
          var self = this;
          for (var i=this._states.length-1; i>=0; i--) {
            var state = this._states[i];
            this._getStateHandler(state).revert.call(this, state);
          }
        }
        this._states = [];
        return;
      }

      var stateHandler = this._getStateHandler(newState);
      if (!stateHandler) {
        throw new Error("This is unknown/unhandled widget state: ", newState);
      }
      stateHandler.set.call(this, newState);
      this._saveNewState(newState);
    },

    _getStateHandler: function(newState) {
      return this.widgetStateHandlers[newState.state];
    },

    /**
     * I'm being careful not to hold to references, only simple flat object
     * made of primitives will be stored
     *
     * @param newState
     */
    _saveNewState: function(newState) {
      var s = _.object(_.filter(_.pairs(newState), function(p) {return !_.isObject(p[1]) && !_.isArray(p[1])}));
      this._states.push(s);
    }


  };

  return Mixin;

});