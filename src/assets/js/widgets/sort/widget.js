/**
 * Created by alex on 5/19/14.
 */
define(['marionette',
  'backbone',
  'jquery',
  'js/widgets/base/base_widget',
  'hbs!./templates/sort_template',
  'bootstrap',
  'js/components/api_feedback',
  'analytics'

], function (
  Marionette,
  Backbone,
  $,
  BaseWidget,
  SortTemplate,
  bootstrap,
  ApiFeedback,
  analytics
  ) {

    var SortModel = Backbone.Model.extend({

      defaults: function () {
        return {
          sortOptions : [
          {value: "classic_factor", title: "Relevancy", default: true },
          {value: "date", title: "Publication Date" },
          {value: "citation_count", title: "Citation Count" },
          {value: "read_count", title: "Recent Reads" }],

          orderOptions : [
            {value: "desc", title: "Descending", default: true, faIcon: "fa-sort-numeric-desc"},
            {value: "asc", title: "Ascending",  faIcon: "fa-sort-numeric-asc"}]
        }
      },

      removeDefaults : function(){

        //arrays are pass by reference so
        //don't need to explicitly set

        var sortOptions = this.get("sortOptions");
        var orderOptions = this.get("orderOptions");

        _.each(sortOptions, function(o) {
          if (o.default) {
            delete o.default
          }
        });
        _.each(orderOptions, function(o) {
          if (o.default) {
            delete o.default
          }

        });
      },

      addDefault : function(attributeKey, value){
        _.each(this.get(attributeKey), function(d){
          if(d.value === value){
            d.default = true
          }
        })
      }

    });

    var SortView = Marionette.ItemView.extend({

      initialize: function (options) {
        //using custom event because backbone doesnt do nested events
        this.listenTo(this.model, "change:formData", this.render)
      },

      template: SortTemplate,

      events: {
        "change input[name=order-options]": "showInfo",
        "click  li.sort-options": "changeSort",
        "click .dropdown-menu label": "preventClose"
      },

      showInfo : function(){
        this.$(".instructions").removeClass("hidden");
      },

      preventClose : function(e){
        e.stopPropagation();
      },

      serializeData: function () {
        var newJSON;
        newJSON = this.model.toJSON();
        _.each(newJSON.sortOptions, function(input){

          if (input.default){
            newJSON.current = input.title
          }
        });

        //and appending "asc" if that is the default order
        _.each(newJSON.orderOptions, function(input){
          if (input.value === "asc" && input.default === true){
            newJSON.current += " Asc";
          }
        });

        //so we have a reference
        this.model.set("current", newJSON.current);
        return newJSON;
      },

      getCurrentSortVal : function() {
        var currentSortVal = '';
        var j = this.model.toJSON();
        _.each(j.sortOptions, function(input){
          if (input.default){
            currentSortVal = input.title
          }
        });

        _.each(j.orderOptions, function(input){
          if ( input.default === true){
            currentSortVal += " ";
            currentSortVal += input.value;
          }
        });
        return currentSortVal;
      },

      changeSort: function (ev) {
        var newVal, current, button;

        current = this.getCurrentSortVal();
        newVal = this.$(ev.currentTarget).find("button").data("value");
        var order = this.$("input[name=order-options]:checked").attr("value");

        newVal += " ";
        newVal += order;

        if (newVal !== current) {
          this.trigger("sortChange", newVal)
        }
      }
    });

    var SortWidget = BaseWidget.extend({

      initialize: function (options) {
        this.model = new SortModel();
        this.view = new SortView({model : this.model});
        this.listenTo(this.view, "all", this.onAll);
        BaseWidget.prototype.initialize.apply(this, arguments)
      },

      activate: function (beehive) {
        _.bindAll(this, "handleFeedback");
        this.setBeeHive(beehive);
        var pubsub = this.getPubSub();

        // widget doesn't need to execute queries (but it needs to listen to them)
        pubsub.subscribe(pubsub.FEEDBACK, _.bind(this.handleFeedback, this));
      },

      onAll: function (ev, data) {
        if (ev == "sortChange") {
          //find current sort values
          this.submitQuery(data);
        }
      },

      submitQuery: function (data) {
        var apiQuery = this.getCurrentQuery().clone();
        apiQuery.set("sort", data);
        this.getPubSub().publish(this.getPubSub().START_SEARCH, apiQuery);

        analytics('send', 'event', 'interaction', 'sort-applied', data);

      },

      handleFeedback: function(feedback) {
        switch (feedback.code) {
          case ApiFeedback.CODES.SEARCH_CYCLE_STARTED:
            this.setCurrentQuery(feedback.query);
            this.extractSort(feedback.query);
            break;
        }
      },

      extractSort: function (q) {

        var sortVals;

        if (q.has('sort')) {
          sortVals = q.get('sort')[0].split(/\s+/);
          this.model.removeDefaults();
          this.model.addDefault("sortOptions", sortVals[0]);
          this.model.addDefault("orderOptions", sortVals[1]);
        }
        else { // if there is no sort indicated, it is the default, "relevant"
          this.view.model.set(_.result(this.model, "defaults"))
        }
        //need to explicitly tell the view that the model changed
        this.model.trigger("change:formData")
      }

    });

    return SortWidget
  });