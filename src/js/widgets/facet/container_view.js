define(['backbone', 'marionette',
    'js/widgets/base/container_view',
    'js/mixins/widget_pagination',
    'js/components/paginator',
    'js/widgets/facet/item_view',
    'hbs!./templates/tooltip',
    'hbs!./templates/widget-container'
  ],
  function (Backbone,
    Marionette,
    ContainerView,
    WidgetPagination,
    Paginator,
    BaseItemView,
    FacetTooltipTemplate,
    WidgetContainerTemplate
    ) {


    var FacetContainerView = ContainerView.extend({

      initialize: function (options) {
        ContainerView.prototype.initialize.call(this, arguments);
        this.displayNum = Marionette.getOption(this, "displayNum") || 5;
        this.maxDisplayNum = Marionette.getOption(this, "maxDisplayNum") || 200;
        this.paginator = Marionette.getOption(this, "paginator");


        if (!this.paginator) {
          this.paginator = new Paginator({start: 0, rows: 20});
        }

        this.logicOptions = Marionette.getOption(this, "logicOptions");

        if (this.logicOptions) {
          if (!_.isObject(this.logicOptions) || !('single' in this.logicOptions && 'multiple' in this.logicOptions)) {
            throw new Error('logicOptions should be null or an object with single/multiple keys and arrays of strings inside');
          }

          this.listenTo(this.collection,"reset", function(){

            this.resetLogicTooltip();

          })

          this.on('all', function(ev, info) {
//            console.log("event!", ev)
            if (ev.indexOf('itemClicked') > -1
              //this catches each time the collection is re-rendered
              || ev.indexOf('render:collection') > -1
              || ev.indexOf('treeClicked') > -1) {
              this.refreshLogicTooltip();
            }
          });

          //this.on("childview:itemClicked", this.refreshLogicTooltip);

          //clear out logic template when collection is reset
          //this.on("composite:collection:rendered", this.refreshLogicTooltip);

          // for debugging
          //this.on('all', function(ev) {console.log(ev, arguments)});
        }

      },

      //id: "search-results",
      childView: BaseItemView,
      template: WidgetContainerTemplate,

      childViewContainer:".widget-body",

      events: function () {
        var addEvents;
        addEvents = {
          "click .dropdown-toggle": "enableLogic",
          "click .dropdown-menu .close": "closeLogic",
          "click .logic-container input": "onLogic"
        };
        return _.extend(_.clone(ContainerView.prototype.events), addEvents);
      },

      childViewOptions: function (model, index) {
//       merging in options from factory stage
        additionalOptions = Marionette.getOption(this, "additionalChildViewOptions") || {};

        return _.extend({hide: true}, additionalOptions);

        //if this is the initial round, hide fetchnum - displaynum
        if (this.paginator && this.paginator.getCycle() <= 1) {
          if (index < this.displayNum) {
            return _.extend({hide: false}, additionalOptions);
          }
          else {
            return _.extend({hide: true}, additionalOptions);
          }
        }
        else {
          //otherwise, keep the defaults (as set by the template)
          return additionalOptions;
        }
      },


      onRender: function() {
        this._onRender();
        if (this.collection && this.collection.models.length > this.displayNum) {
          this.enableShowMore();
        }
        else {
          this.disableShowMore();
        }
        if (this.logicOptions && this.collection.length) {
          this.refreshLogicTooltip();
          this.closeLogic();

        }
      },

      onShowMore: function() {
        this.trigger('fetchMore', this.$(".widget-body:first").children('.item-view.hide').length);
      },

      displayMore: function(howMany) {
        //show hidden data
        var $hidden = this.$('.widget-body:first').children('.item-view').filter('.hide'),
            hiddenLength = $hidden.length;
            $hidden.slice(0,howMany).removeClass('hide');
        if (hiddenLength > 0) {
          var offset = this.collection.models.length - hiddenLength;
          var max = this.children.length-offset;
          for (var i=0;i<howMany && i<max;i++) {
            this.children.findByIndex(offset+i).trigger('treeNodeDisplayed');
          }
        }
      },

      disableShowMore: function(text) {
        var $sm = this._getShowMore();
        $sm.text('');
      },

      enableShowMore: function(text) {
        var $sm = this._getShowMore();
        $sm.text('show more');
      },

      _getShowMore: function() {
        var $o = this.$('.widget-options.bottom:first');
        //console.log($o.html())
        var $sm = $o.find("button[wtarget=ShowMore]");
        //console.log($sm)
        if (!$sm.length) {
        //  console.log("show more", $sm)

          $sm = $('<button class="btn btn-xs btn-link" wtarget="ShowMore">show more</button>');
          $o.append($sm);
        }
        return $sm;
      },


      closeLogic: function (e) {

        if (e){
          e.stopPropagation();
        }

        this.$(".logic-dropdown").addClass("hide").removeClass("open");

      },


      onLogic: function(ev) {
        if (ev)
        ev.stopPropagation();
        //close the logic dropdown
        this.closeLogic();
        var val = $(ev.target).val();
        this.trigger("containerLogicSelected", val);
      },

      resetLogicTooltip : function(){

        this.$(".dropdown-menu").html(FacetTooltipTemplate({
          noneSelected: true
        }));
        this.$(".dropdown").removeClass("open").addClass("hide");

      },

      refreshLogicTooltip: function(){


        var selected = this.$(".widget-item:checked");
        var numSelected = selected.length;

        if (numSelected >= 1) {
          //highlight filter
          this.$(".logic-dropdown").removeClass("hide");
          //highlight caret
          this.$("i.main-caret").addClass("active-style");

        }
        else {
          //unhighlight filter
          this.$(".logic-dropdown").removeClass("open").addClass("hide");

          //unhighlight caret
          this.$("i.main-caret").removeClass("active-style");
        }

        //open the dropdown
        if (numSelected === 1) {
          this.$(".dropdown-menu").html(FacetTooltipTemplate({
            single: true,
            logic: this.logicOptions.single
          }));

          this.$(".dropdown").addClass("open");

        }
        else if (numSelected > 1) {
          var multiLogic = this.logicOptions.multiple;
          if (multiLogic === "fullSet") {
            /*any multiple selection automatically grabs the full set */
            this.$(".dropdown-menu").html(FacetTooltipTemplate({
              fullSet: true
            }))
          }
          else {
            this.$(".dropdown-menu").html(FacetTooltipTemplate({
              multiLogic: true,
              logic: multiLogic
            }))

          }
          this.$(".dropdown").addClass("open");
        }
        else {

          this.resetLogicTooltip();


        }
      }


    });

    _.extend(FacetContainerView.prototype, WidgetPagination);

    return FacetContainerView;
  });