/**
 * This widget knows about the central region manager (passed it on instantiation)
 * and can manipulate it (also it can add sub regions)
 *
 * It listens to any events that request the abstract page or a sub part of it and
 * displays the necessary views
 *
 * Exposes an api that can be used by the router (to change what is currently
 * displayed)
 *
 */


define([
  "marionette",
  "hbs!./templates/results-page-layout",
  'js/widgets/base/base_widget',
  'js/widgets/loading/widget',
  'hbs!./templates/results-control-row',
  'js/components/api_query'],
  function (
    Marionette,
    threeColumnTemplate,
    BaseWidget,
    LoadingWidget,
    resultsControlRowTemplate,
    ApiQuery) {

    var widgetDict, history, API;

    // -----------------------------------
    function getColString(identifierName){
      var colString = $(identifierName).attr('class');
      return colString;
    }

    function searchString(strArray){
      console.log("Searching:" + strArray);
      for (var j=0; j<strArray.length; j++){
        var ser = strArray[j].match("col-md-");
        if (ser){
          return strArray[j];
        }
      }
    }

    function getColVal(colString){

      var colArray = colString.split(" ");
      var colNum = parseInt(searchString(colArray).replace("col-md-", ""));
      console.log("getting value:" + colNum.toString())
      return colNum;
    }
    // -----------------------------------

    //  router can make use of these functions

    API = {

      insertTemplate: function () {

        $("#body-template-container").children().detach();

        $("#body-template-container").append(threeColumnTemplate());

        $("#results-control-row").append(resultsControlRowTemplate())

      },


      insertLoadingView: function () {
        $("#body-template-container").append(this.loadingWidget.render().el);

        this.loadingWidget.trigger("showLoading")

      },

      displayFacets: function () {

        var $leftCol = $("#s-left-col-container");

        $leftCol.append(widgetDict.authorFacets.render().el).append(widgetDict.database.render().el).append(widgetDict.refereed.render().el).append(widgetDict.keywords.render().el).append(widgetDict.pub.render().el).append(widgetDict.bibgroup.render().el).append(widgetDict.data.render().el).append(widgetDict.vizier.render().el).append(widgetDict.grants.render().el);

      },

      displayControlRow: function () {
        $("#query-info-container").append(widgetDict.queryInfo.render().el)
      },

      displayRightColumn: function () {
        var $rightCol = $("#s-right-col-container");

        $rightCol.append(widgetDict.graphTabs.render().el).append(widgetDict.queryDebugInfo.render().el);

      },

      displaySearchBar: function () {
        $("#search-bar-row").append(widgetDict.searchBar.render().el);

      },

      displayResultsList: function () {

        var $middleCol = $("#s-middle-col-container");

        $middleCol.append(widgetDict.results.render().el);

        $(".list-of-things").removeClass("hide")

      },

      enableLeftColToggle: function () {

        $("#left-col-toggle").on("click", function (e) {

          var $this = $(this);
          var $i = $this.find("i");

          // Calculate col-md for each panel
          var middleString = getColString("#middle-column");
          var middleNum = getColVal(middleString);

          // if the right column is open, then resize this way
          if ($("#right-col-toggle").find("i").hasClass("right-col-close")) {
            var rightNum = 0;
            var rightString = "0";
          }
          else{
            var rightString = getColString("#right-column")
            var rightNum = getColVal(rightString);
          }

          var leftNum = 2;

          console.log("Right:" + rightString);
          console.log("Middle:" + middleString);
          console.log("Calculations complete.")

          // We want to close the panel
          if ($i.hasClass("right-col-close")) {

            // var leftNum = 12 - middleNum - rightNum;
            console.log("Left:" + leftNum.toString());
            $i.removeClass("right-col-close").addClass("right-col-open");
            $this.find("span").text("show specifiers");

            // Hide left column
            $("#left-column").addClass("no-display");


            $("#middle-column").removeClass("col-md-"+middleNum.toString()).addClass("col-md-"+(leftNum+middleNum).toString());
            console.log("Closing left. Making middle:" + "col-md-"+(leftNum+middleNum).toString());

          }
          // Open the panel
          else {

            // Show left display
            $("#left-column").removeClass("no-display")

            $i.removeClass("right-col-open").addClass("right-col-close");
            $this.find("span").text("hide specifiers");

            console.log("Left:" + leftNum.toString());
            $("#middle-column").removeClass("col-md-"+middleNum.toString()).addClass("col-md-"+(middleNum-leftNum).toString());
            console.log("Opening left. Making middle:" + "col-md-"+(middleNum-leftNum));
          }
        })
      },

      enableRightColToggle: function () {

        $("#right-col-toggle").on("click", function (e) {

          var $this = $(this);
          var $i = $this.find("i");

          // Calculate col-md for each panel
          var middleString = getColString("#middle-column");
          var middleNum = getColVal(middleString);
          console.log("Here1");
          // if the left column is open, then resize this way
          if ($("#left-col-toggle").find("i").hasClass("right-col-close")) {
            var leftNum = 0;
          }
          else{

            var leftString = getColString("#left-column")
            var leftNum = getColVal(leftString);
          }
          console.log("Here2");
          var rightNum = 3;
          var rightString = rightNum.toString();

          if ($i.hasClass("right-col-open")) {

            $i.removeClass("right-col-open").addClass("right-col-close");
            $this.find("span").text("show 3rd col");

            // Hide right column
            $("#right-column").addClass("no-display");
            $("#middle-column").removeClass("col-md-"+middleNum.toString()).addClass("col-md-"+(rightNum+middleNum).toString());
            console.log("Closing right. Making middle:" + "col-md-"+(rightNum+middleNum).toString());

            // $("#right-column").addClass("no-display");
            // $("#middle-column").removeClass("col-md-7").addClass("col-md-9");
            // $("#left-column").removeClass("col-md-2").addClass("col-md-3");

          }
          else {
            $this.find("span").text("hide 3rd col");

            $i.removeClass("right-col-close").addClass("right-col-open");

            $("#right-column").removeClass("no-display");
            $("#middle-column").removeClass("col-md-"+middleNum.toString()).addClass("col-md-"+(middleNum-rightNum).toString());

            console.log("Right:" + rightNum.toString());
            console.log("Opening right. Making middle:" + "col-md-"+(middleNum-rightNum));


            // $("#middle-column").removeClass("col-md-9").addClass("col-md-7");
            // $("#left-column").removeClass("col-md-3").addClass("col-md-2");

          }
        })
      }

      // enableRightColToggle: function () {
      //
      //   $("#right-col-toggle").on("click", function (e) {
      //
      //     var $this = $(this);
      //     var $i = $this.find("i");
      //
      //     if ($i.hasClass("right-col-open")) {
      //
      //       $i.removeClass("right-col-open").addClass("right-col-close");
      //       $this.find("span").text("show 3rd col");
      //
      //       $("#right-column").addClass("no-display");
      //       $("#middle-column").removeClass("col-md-7").addClass("col-md-9");
      //       $("#left-column").removeClass("col-md-2").addClass("col-md-3");
      //
      //     }
      //     else {
      //       $this.find("span").text("hide 3rd col");
      //
      //       $i.removeClass("right-col-close").addClass("right-col-open");
      //
      //       $("#right-column").removeClass("no-display");
      //       $("#middle-column").removeClass("col-md-9").addClass("col-md-7");
      //       $("#left-column").removeClass("col-md-3").addClass("col-md-2");
      //
      //     }
      //   })
      // }
    };

    var ResultsController = BaseWidget.extend({

      initialize: function (options) {

        options = options || {};

        _.bindAll(this, 'showPage');

        _.extend(this, API);

        if (!options.widgetDict) {
          throw new error("page managers need a dictionary of widgets to render");
        }

        widgetDict = options.widgetDict;

        history = options.history;

        this.loadingWidget = new LoadingWidget();

      },

      activate: function (beehive) {

        this.pubsub = beehive.Services.get('PubSub');

        this.pubsub.subscribe(this.pubsub.START_SEARCH, this.showPage);

      },

      showPage: function (apiQuery) {

        //it's false when the router uses this function to display the results page
        if (apiQuery !== false) {

          var tempQuery = new ApiQuery();
          if (apiQuery.get("q")){
            tempQuery.set("q", apiQuery.get("q"));
          }
          if (apiQuery.get("fq")){
            tempQuery.set("fq", apiQuery.get("fq"));
          }

          var urlData = {page: "resultsPage", subPage: undefined, data: apiQuery.toJSON(), path: "search/" + tempQuery.url()};

          this.pubsub.publish(this.pubsub.NAVIGATE_WITHOUT_TRIGGER, urlData);

        }

        //showing page in response to "start search"
        // don't reshow if it's already in the dom
        if (!$("#results-page-layout").length){
          this.insertTemplate();
          this.displaySearchBar();
          this.displayControlRow();
          this.displayFacets();
          this.displayRightColumn();
          this.displayResultsList();
          this.enableRightColToggle();
          this.enableLeftColToggle();
          //this.insertLoadingView()

        }


      }

    });

    return ResultsController

  });