/**
 * This widget controls what gets displayed on the 'abstract' view
 *
 * It knows about the central region manager (passed it on instantiation)
 * and can manipulate it (also it can add sub regions)
 *
 * Listens to any events that request the abstract page or a sub part
 * of it and displays the necessary views
 *
 * Provides an api that can be used by the router
 */

define(["marionette",
    "hbs!./templates/abstract-page-layout",
    'js/widgets/base/base_widget',
    'js/components/api_query',
    'js/mixins/add_stable_index_to_collection',
    'js/page_managers/abstract_title_view_mixin',
    'js/page_managers/abstract_nav_view_mixin',
    'js/page_managers/page_manager_mixin'
  ],
  function(Marionette,
    threeColumnTemplate,
    BaseWidget,
    ApiQuery,
    WidgetPaginationMixin,
    AbstractTitleViewMixin,
    AbstractNavViewMixin,
    PageManagerMixin
    ){


    var AbstractMasterView = Marionette.ItemView.extend({

      initialize : function(options){
        this.widgetDict = options.widgetDict;
      },

      className : "s-abstract-page-layout",

      id : "abstract-page-layout",

      template : threeColumnTemplate,

      onRender : function(){

        this.displayRightColumn();
        this.showTitle();
        this.displayNav();

      },

      showTitle: function () {
        this.$("#abstract-title-container")
          .append(this.widgetDict.titleView.render().el);

      },

      displayRightColumn: function () {
        this.$("#right-col-container")
          .append(this.widgetDict.resources.render().el)

      },

      displayNav : function(){

        this.$(".s-left-col-container")
          .append(this.widgetDict.navView.render().el)
      },

      onShow : function(){

        this.displaySearchBar();

      },

      displaySearchBar: function () {
        $("#search-bar-row")
          .append(this.widgetDict.searchBar.render().el);

      }

    });


    var AbstractControllerModel = Backbone.Model.extend({
      defaults: function () {
        return {
          bibcode: undefined,
          title: undefined,
          resultsIndex : undefined
          //id will be the result Index
        }
      },

      idAttribute : "resultsIndex",

      parse : function(d){
        d.title = d.title[0];
        return d
      }

    });

    var AbstractControllerCollection = Backbone.Collection.extend({
      model: AbstractControllerModel,

      comparator: "resultsIndex"
    });


    var AbstractController = BaseWidget.extend({


      initialize : function(options){

        options = options || {}

        this.widgetDict = options.widgetDict;

        if (!options.widgetDict){
          throw new Error("page managers need a dictionary of widgets to render")
        }

        this.collection = new AbstractControllerCollection();

        //from the title view mixin
        this.widgetDict.titleView = this.returnNewTitleView();

        this.widgetDict.navView = this.returnNewAbstractNavView();

        this.controllerView = new AbstractMasterView({widgetDict : this.widgetDict});

        this.listenTo(this.widgetDict.navView, "navigate", this.subPageNavigate)

        //represents the current bibcode (always only 1)
        this._bibcode = undefined;

        //      to be explicit, transferring only those widgets considered "sub views" to this dict
        //      allowing abstractSubViews to be set by options for testing purposes
        this.abstractSubViews = options.abstractSubViews ||  {
          //the keys are also the sub-routes
          "abstract": {widget: this.widgetDict.abstract, title:"Abstract", descriptor: "Abstract for:"},
          "references": {widget: this.widgetDict.references, title:"References", descriptor: "References in:", showNumFound : true},
          "citations": {widget: this.widgetDict.citations, title: "Citations", descriptor: "Papers that cite:", showNumFound : true},
          "coreads" : {widget: this.widgetDict.coreads, title: "Co-Reads", descriptor: "Other papers read by those who read:"},
          "tableofcontents" : {widget: this.widgetDict.tableOfContents, title: "Table of Contents", descriptor: "Table of Contents for:", showNumFound : false},
          //          "similar": {widget : this.widgetDict.similar, title : "Similar Papers", descriptor : "Papers with similar characteristics to:"}
        };

        this.listenTo(this.widgetDict.titleView, "all", this.onAllInternalEvents)

        BaseWidget.prototype.initialize.call(this, options);

      },

      onAllInternalEvents : function(ev, arg1, arg2){

        if (ev.indexOf("loadMore")!== -1){
          //from abstract title view mixin
          this.checkLoadMore();
        }

      },


      loadWidgetData: function () {

        var that = this;

        _.each(this.abstractSubViews, function (v, k) {

          if (k === "abstract") {

            v.widget.loadBibcodeData(this._bibcode);

            that.widgetDict.navView.collection.get("abstract").set("numFound", 1)

          }
          else {
            var promise = v.widget.loadBibcodeData(this._bibcode);

            promise.done(function (numFound) {

                that.widgetDict.navView.collection.get(k).set("numFound", numFound);

            })
          }
          this.widgetDict.resources.loadBibcodeData(this._bibcode);

        }, this)

      },

      renderAbstractNav: function (subPage) {

        this.widgetDict.navView.render(subPage);

      },


      showSubView: function (viewName) {

        var dataForRouter, $middleCol, widget;

        var that = this;

        if (!viewName) {
          console.warn("viewname undefined")
          return
        }

        //tell router to display the correct subview only if it's not already there
        if (!this.collection.subPage || this.collection.subPage.viewKey !== viewName || this.controllerView.$("s-middle-col-container").children().length === 0){

          dataForRouter = "abs/" + this._bibcode + "/" + viewName;

          this.pubsub.publish(this.pubsub.NAVIGATE_WITHOUT_TRIGGER, dataForRouter);

          $middleCol = this.controllerView.$("#current-subview");

          setTimeout(function(){

            $middleCol.children().detach();

            widget = that.abstractSubViews[viewName]["widget"];

            $middleCol.append(widget.render().el);

            /*The two lines below notify the title descriptor view to change*/
            that.collection.subPage = that.abstractSubViews[viewName];
            that.collection.subPage.viewKey = viewName

            that.collection.trigger("subPageChanged");

          }, 150)


        }

      },

      subPageNavigate : function(route){

        //now, just render the relevant page
        var sub  = route.match(/\/(\w+)$/)[1];
        this.showSubView(sub);
      },


      setCurrentBibcode :function(bib){
        this._bibcode = bib;
        this.widgetDict.navView.collection.reset(this.widgetDict.navView.collection.defaults);

        //this will trigger initial render of abstract nav view
        this.widgetDict.navView.model.set("bibcode", bib);

      },

      getCurrentBibcode : function(){
        return this._bibcode;
      },

      // called by the router

      showPage : function(options){

        var bib = options.bibcode;
        var subPage = options.subPage;
        var inDom = options.inDom;


        if (!inDom) {

          this.insertControllerView();

        }

        if (bib !== this.getCurrentBibcode()){

          this.setCurrentBibcode(bib);
          this.renderNewBibcode();
          this.loadWidgetData(bib);

        }

        //these functions must be called
        //every time the page is shown

        this.renderAbstractNav(subPage);
        this.widgetDict.navView.collection.setActive(subPage);
        this.showSubView(subPage);

      }

    })

    /*
    * _.defaults won't override a function if it's already in the prototype
    * _.extend will
    * */

    _.extend(AbstractController.prototype, WidgetPaginationMixin);
    _.extend(AbstractController.prototype, AbstractTitleViewMixin);
    _.extend(AbstractController.prototype, AbstractNavViewMixin);
    _.defaults(AbstractController.prototype, PageManagerMixin);


    return AbstractController


  })