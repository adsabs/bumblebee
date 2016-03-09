/*
 * Master manager is a simple widget which keeps track of what is
 * inside DOM - and on command swaps/adds/removes the subordinate
 * page managers (plus gives them commands on what to display).
 *
 * Page managers will be discovered automatically, from the
 * application object. But we need to know where in the page
 * should the managers be inserted.
 *
 * */

define([
  'js/widgets/base/base_widget',
  'js/components/generic_module',
  'js/page_managers/controller',
  'hbs!./templates/aria-announcement',
  'hbs!./templates/master-page-manager',
  'marionette',
  'js/mixins/dependon'

], function(
  BaseWidget,
  GenericModule,
  PageManagerController,
  AriaAnnouncementTemplate,
  MasterPageManagerTemplate,
  Marionette,
  Dependon
  ){

  var WidgetData = Backbone.Model.extend({
    defaults : function(){
      return {
        id: undefined, // widgetId
        isSelected : false,
        object: undefined,
        options: undefined // options used for the last show() call
      }
    }
  });

  var WidgetCollection = Backbone.Collection.extend({
    model : WidgetData,
    selectOne: function(widgetId) {
      var s = null;
      this.each(function(m) {
        if (m.id == widgetId) {
          s = m;
        }
        else {
          m.set("isSelected", false, {silent: true});
        }
      });

      s.set("isSelected", true);
    }
  });

  var WidgetModel = Backbone.Model.extend({
    defaults : function(){
      return {
        name: undefined,
        numCalled: 0,
        ariaAnnouncement: undefined
      }
    }
  });

  var MasterView = Marionette.ItemView.extend({

      className : "s-master-page-manager",

      constructor: function(options) {
        options = options || {};
        if (!options.collection)
          options.collection = new WidgetCollection();

        if (!options.model)
          options.model = new WidgetModel();
        options.template = MasterPageManagerTemplate;
        Marionette.ItemView.prototype.constructor.call(this, options);
      },

      //transition between page managers
      changeManager: function() {

        var model = this.collection.findWhere({ isSelected : true });
        // call the subordinate page-manager
        var res = model.attributes.object.show.apply(model.attributes.object, model.attributes.options);

        //detach previous controller
        this.$(".dynamic-container").children().detach();
        this.$(".dynamic-container").append(res.$el);
        model.attributes.numAttach += 1;

        //scroll to top
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        //and fix the search bar back in its default spot
        $(".s-search-bar-full-width-container").removeClass("s-search-bar-motion");
        $(".s-quick-add").removeClass("hidden");

        if (model.attributes.isSelected) {
          // call the subordinate page-manager
          var res = model.attributes.object.show.apply(model.attributes.object, model.attributes.options);
          this.$(".dynamic-container").append(res.el);

          //and fix the search bar back in its default spot
          $(".s-search-bar-full-width-container").removeClass("s-search-bar-motion");
          $(".s-quick-add").removeClass("hidden");
        }
        else {
          if (model.attributes.object && model.attributes.object.view.$el.parent().length > 0) {
            model.attributes.object.view.$el.detach();
          }
        }
        console.timeEnd("waiting for first render");

      },

      //transition widgets within a manager
      changeWithinManager : function(){

        var model = this.collection.findWhere({ isSelected : true });
        model.attributes.object.show.apply(model.attributes.object, model.attributes.options);
        model.attributes.numAttach += 1;
      }
    }
  );

  var MasterPageManager = PageManagerController.extend({

    initialize : function(options){
      options = options || {};
      this.view = new MasterView(options);
      this.collection = this.view.collection;
      this.model = this.view.model;
      PageManagerController.prototype.initialize.apply(this, arguments);
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.ARIA_ANNOUNCEMENT, this.handleAriaAnnouncement);
    },

    assemble: function(app) {
      this.setApp(app);
      PageManagerController.prototype.assemble.call(this, app);
    },


    show: function(pageManagerName, options) {

      var app = this.getApp();

      if (!this.collection.find({'id': pageManagerName})) {
        this.collection.add({'id': pageManagerName});
      }

      var pageManagerModel = this.collection.find({id: pageManagerName});
      //to be called once getWidget has completed
      var assembleManager = function (pageManagerWidget) {

        if (pageManagerWidget.assemble) {
          // assemble the new page manager (while the old one is still in place)
          pageManagerWidget.assemble(app);
        }
        else {
          console.error('eeeek, ' + pageManager + ' has no assemble() method!');
        }

        if (!pageManagerModel.attributes.isSelected) {
          //hide other managers
          this.hideAll();
        }

        // activate the new pageManagerWidget
        if (!pageManagerModel.get('isSelected')){
          //'changeWithinManager' also gets triggered if options are changed, leading to
          //a wasteful re-render!
          pageManagerModel.set({options: options, object : pageManagerWidget}, {silent : true});
          //this triggers 'changeManager'
          pageManagerModel.set({'isSelected': true});
        }
        else {
          //it's already selected, trigger a change within the manager
          pageManagerModel.set({options : options, object : pageManagerWidget})
        }

        // send notification
        this.getPubSub().publish(this.getPubSub().ARIA_ANNOUNCEMENT, pageManagerName);

        //figure out which pages should be cached/destroyed
        this.manageHistoryQueue(pageManagerName);

      }.bind(this);

      //if the model does not already reference the actual manager widget, add it now
      var pageManagerWidget;
      if (pageManagerModel.get('object')) {
        pageManagerWidget = pageManagerModel.get('object');
        assembleManager(pageManagerWidget);
      }
      else {
        app._getWidget(pageManagerName).done(function(widget){
          pageManagerModel.set('object', widget);
          assembleManager(widget);
        });
      }

    },

    manageHistoryQueue : function(pageManagerName){

      // it's a new page
      if (!pageManagerModel.get('isSelected')){
        pageManagerModel.set({options: options, object : pageManagerWidget});
        this.collection.selectOne(pageManagerName);
        this.view.changeManager();
      }
      else {
        //it's within a page
        pageManagerModel.set({options : options, object : pageManagerWidget});
        //it's already selected, trigger a change within the manager
        this.view.changeWithinManager();
      // check whether to disassemble an old page manager in the historyQueue
      if (this.currentChild === pageManagerName ) return;

      if (this.currentChild) {
        //this will be undefined at the very beginning
        //make sure there's only one instance of a page manager in the queue at all times,
        //we are adding the soon-to-be-former page name to the end of the queue
        this.historyQueue = _.without(this.historyQueue, this.currentChild);
        this.historyQueue.push(this.currentChild);
      }

      //re-assign the current child to the new page manager
      this.currentChild = pageManagerName;

      //don't destroy the old page manager if it's about to be inserted
      if (this.historyQueue[0] === pageManagerName) return;

      if (this.historyQueue.length < 2) return;

      var twoManagersAgo = this.historyQueue.shift();

      var oldPM = this.collection.find({id: twoManagersAgo});
      if (oldPM && oldPM.get('object')){
          console.log('disassembling ' + twoManagersAgo);
          this.disAssemble.call(oldPM.get('object'), this.getApp());
        }

        this.getPubSub().publish(this.getPubSub().ARIA_ANNOUNCEMENT, pageManagerName);

    },

    //used by discovery mediator
    getCurrentActiveChild: function() {
      if ( this.collection.get(this.currentChild) ){
        return this.collection.get(this.currentChild).get('object'); // brittle?
      }
    },

    /**
     * only disassemble the manager before the previous manager
     * this ensures smooth back button navigation
    * **/
    historyQueue : [],

    /**
     * Return the instances that are under our control and are
     * not active any more
     */
    disAssemble: function(app) {

      _.each(_.keys(this.widgets), function(widgetName) {
        var widget = this.widgets[widgetName];
        if (widget.disAssemble)
          widget.disAssemble();
        app.returnWidget(widgetName);
        if (!app._isBarbarianAlive("widget:" + widgetName)){
          $(this.widgetDoms[widgetName]).empty();
        }
        else {
          $(this.widgetDoms[widgetName]).detach();
        }
        delete this.widgets[widgetName];
        delete this.widgetDoms[widgetName];
      }, this);
      this.assembled = false;
      /*
      * for the page controllers, this will force widgets to be
      * re-instantiated on next assemble
      * */
      delete this.widgetsInstantiated;

    },

    handleAriaAnnouncement: function(msg) {
      //template will match the page name with the proper message
      //this doesn't work using voiceover when it's inside a div container for some infuriating reason,
      //the skip to link becomes unfocusable
      $("a#skip-to-main-content").remove();
      $("div#aria-announcement-container").remove();
      $("#app-container").before(AriaAnnouncementTemplate({page : msg}));
    }

  });

  _.extend(MasterPageManager.prototype, Dependon.App);
  return MasterPageManager;
});
