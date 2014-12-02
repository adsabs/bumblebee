define([
    "marionette",
    "hbs!./templates/results-page-layout",
    'hbs!./templates/results-control-row',
    'js/widgets/base/base_widget'
  ],
  function (Marionette,
            pageTemplate,
            controlRowTemplate
            ) {


/*
* keeps track of the open/closed state of the three columns
* */
    ResultsStateModel = Backbone.Model.extend({

      defaults : function(){

        return {
          left : "open",
          right : "open",
          largerThanTablet : true

        }
      }
    })


    var ThreeColumnView = Marionette.ItemView.extend({

      initialize : function(options){
        var options = options || {};
        this.widgets = options.widgets;
        this.model = new ResultsStateModel

      },

      onDetach : function(){

      $(window).off("resize", this.setScreenSize)

      },

      template : pageTemplate,


      modelEvents: {
        "change:left": "toggleColumns",
        "change:right": "toggleColumns",
        "change:largerThanTablet": "updateColumnContent"
      },

      events: {

        "click .btn-expand": "toggleStateModel"
      },

      onRender : function(){
        var self = this;

        this.$("#results-control-row")
          .append(controlRowTemplate());

        this.displaySearchBar(this.options.displaySearchBar);
        this.displayControlRow(this.options.displayControlRow);
        this.displayLeftColumn(this.options.displayLeftColumn);
        this.displayRightColumn(this.options.displayRightColumn);
        this.displayMiddleColumn(this.options.displayMiddleColumn);

      },

      onShow : function(){
        //these functions must be called every time the template is inserted
        this.displaySearchBar(true);

        //let view know whether it should display a 2 or 3 column layout
        this.setScreenSize();

        //listen for resizing events
        $(window).resize(_.bind(this.setScreenSize, this));


      },

      displaySearchBar: function (show) {
        $("#search-bar-row").toggle(show === null ? true : show);
      },

      displayLeftColumn: function(show) {
        this.$(".s-left-col-container").toggle(show === null ? true : show);
      },

      displayControlRow: function (show) {
        this.$("#results-control-row").toggle(show === null ? true : show);
      },

      displayRightColumn: function (show) {
        this.$(".s-left-col-container").toggle(show === null ? true : show);
      },

      displayMiddleColumn: function (show) {
        this.$(".s-left-col-container").toggle(show === null ? true : show);
      },

      setScreenSize : _.debounce(function() {

          if (this.$(".right-expand").css("display") == "none") {
            this.model.set("largerThanTablet", false)
          }
          else {
            this.model.set("largerThanTablet", true)

          }
        // higher debounce times had a noticable lag

        }, 200),

      updateColumnContent: function () {

        var leftHidden = (this.model.get("left") === "closed");

        if (this.model.get("largerThanTablet")) {
          // it's a three column layout

          this.$("#results-right-column").append(this.$(".right-col-container"))

          if (leftHidden) {

            this.$(".right-col-container").show();

          }

        }
        else {
          // two column layout
          this.$("#results-left-column").append(this.$(".right-col-container"));
          if (leftHidden) {

            this.$(".right-col-container").show();
          }

        }
      },

        /**
       * Show/hide - in a slide fashion - the columns when user clicks on the
       * controls
       *
       * @param e
       */
      toggleStateModel: function (e) {

        var name, $button, state;

        $button = $(e.currentTarget);

        $button.toggleClass("btn-reversed");

        name = $button.hasClass("left-expand") ? "left" : "right";

        state = this.model.get(name) === "open" ? "closed" : "open";

        this.model.set(name, state);

      },

      returnBootstrapClasses: function () {

        var classes = this.classList;
        var toRemove = []
        _.each(classes, function (c) {
          if (c.indexOf("col-") !== -1) {
            toRemove.push(c)
          }
        })
        return toRemove.join(" ")
      },

      makeCenterFullWidth: function () {

        this.model.set("left", "closed");

        this.model.set("right", "closed");

      },

      returnColWidthsToDefault: function () {

        this.model.set("left", "open");

        this.model.set("right", "open");

      },


      toggleColumns: function (e) {

        var leftState, rightState, $leftCol, $rightCol, $middleCol;

        leftState = this.model.get("left");

        rightState = this.model.get("right");

        //this will remove all bootstrap column classes, it's used below

        $leftCol = this.$("#results-left-column");
        $rightCol = this.$("#results-right-column");
        $middleCol = this.$("#results-middle-column");

        if (leftState === "open" && rightState === "open") {

          $leftCol.removeClass("hidden-col")

            setTimeout(function(){

              $leftCol.children().show(0)

            }, 500)


          $rightCol.removeClass("hidden-col")

          setTimeout(function(){

            $rightCol.find(".right-col-container").show(0);

          }, 500)


          $middleCol.removeClass(this.returnBootstrapClasses)
            .addClass("col-md-7 col-sm-8")


        }
        else if (leftState === "closed" && rightState === "open") {

          $rightCol.removeClass("hidden-col")
            .find(".right-col-container")

          setTimeout(function(){

            $rightCol.find(".right-col-container").show(0);

          }, 500)

          $leftCol
            .addClass("hidden-col")
            .children().hide();

          $middleCol.removeClass(this.returnBootstrapClasses)
            .addClass("col-md-9 col-sm-12")

        }

        else if (leftState === "open" && rightState === "closed") {

          $leftCol.removeClass("hidden-col")

          setTimeout(function(){

            $leftCol.children().show(0)

          }, 500)

          $rightCol.addClass("hidden-col")
            .find(".right-col-container").hide()

          $middleCol.removeClass(this.returnBootstrapClasses)
            .addClass("col-md-10 col-sm-8")

        }

        else if (leftState === "closed" && rightState === "closed") {

          $rightCol.addClass("hidden-col")
            .find(".right-col-container")
            .hide();

          $leftCol.addClass("hidden-col")
            .children()
            .hide();

          $middleCol.removeClass(this.returnBootstrapClasses)
            .addClass("col-md-12 col-sm-12")

        }


      }

    });
    return ThreeColumnView;

  });