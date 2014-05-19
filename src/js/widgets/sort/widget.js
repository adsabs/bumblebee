/**
 * Created by alex on 5/19/14.
 */
define(['marionette', 'backbone', 'jquery', 'js/widgets/base/base_widget', 'hbs!./templates/sort_template'], function (Marionette, Backbone, $, BaseWidget, SortTemplate) {

    var SortModel = Backbone.Model.extend({
      defaults: function () {
        return {
          current    : undefined,
          //         not sure if this is the ideal structure to store this, I was thinking
          //        other info might need to be added later
          sortOptions: {
            "score"              : {displayName: "Relevance Descending"},
            "pubdate_sort asc"   : {displayName: "Date Ascending"},
            "pubdate_sort desc"  : {displayName: "Date Descending"},
            "citation_count asc" : {displayName: "Citation Ascending"},
            "citation_count desc": {displayName: "Citation Descending"},
            "read_count asc"     : {displayName: "Popularity Ascending"},
            "read_count desc"    : {displayName: "Popularity Descending"},

          }
        }

      }
    });

    var SortView = Marionette.ItemView.extend({
      initialize: function (options) {
        this.model = new SortModel;

        this.listenTo(this.model, "change:current", this.render)

      },

      template: SortTemplate,

      events: {
        "click .choose-sort": "changeSort"

      },

      serializeData: function () {
        var newJSON;
        newJSON = this.model.toJSON();
        //    switching out the display version of currentSort
        if (newJSON.sortOptions[newJSON.current]) {
          newJSON.current = newJSON.sortOptions[newJSON.current].displayName
        }

        return newJSON
      },

      changeSort: function (ev) {
        var val;
        val = $(ev.target).attr("value");

        if (val !== this.model.get("current")) {

          this.trigger("sortChange", val)
        }

      },

      onRender : function(){
        //hiding the option that appears in the button
        var currentlyChosen = this.model.get("current");
        $(".choose-sort[value='"+currentlyChosen+"']").hide()

      }

    })

    var SortWidget = BaseWidget.extend({
      initialize: function (options) {

        this.view = new SortView();

        this.listenTo(this.view, "all", this.onAll)

        BaseWidget.prototype.initialize.apply(this, arguments)

      },

      onAll: function (ev, data) {
        if (ev == "sortChange") {
          //    find current sort values
          this.submitQuery(data)

        }

      },

      submitQuery: function (data) {
        var apiQuery = this.getCurrentQuery();

        apiQuery.set("sort", data)

        this.pubsub.publish(this.pubsub.NEW_QUERY, apiQuery);

      },

      processResponse: function (apiResponse) {

        var q = apiResponse.getApiQuery();
        this.setCurrentQuery(q);

        var r = apiResponse.toJSON();
        var currentSort = r.responseHeader.params.sort;
        if (currentSort) {
          this.view.model.set("current", currentSort)
        }
//       if there is no sort indicated, it is the default, "score"
        else {
          this.view.model.set("current", "score")
        }

      }


    })

    return SortWidget
  });