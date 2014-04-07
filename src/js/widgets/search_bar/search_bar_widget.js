define(['marionette', 'hbs!./templates/search_bar_template', 'js/components/api_query', 'bootstrap'], function(Marionette, SearchBarTemplate, ApiQuery) {

  //this widget is just a view with access to beehive pubsub to publish the new query
  //when it is submitted


  var SearchBarView = Marionette.ItemView.extend({

    template: SearchBarTemplate,

    events: {
      "click .search-submit": "submitQuery",
      "keydown .q": "suggestQuery",
    },

    submitQuery: function() {
      var query = (this.$(".q").val());
      query = new ApiQuery({
        q: query
      });
      this.trigger("new_query", query)
    },

    //if we want to do autocomplete?
    //suggestQuery: function() {
    // console.log(this.$(".q").val())

    //},


  })

  var SearchBarWidget = Marionette.Controller.extend({
    view: new SearchBarView(),

    activate: function(beehive) {

      this.pubsub = beehive.Services.get('PubSub');
      this.key = this.pubsub.getPubSubKey();

    },

    render: function() {
      return this.view.render().el;
    },

    initialize: function() {
      this.listenTo(this.view, "new_query", function(q) {
        this.submitNewQuery(q);
      });
    },

    submitNewQuery: function(query) {
      
      this.pubsub.publish(this.key, 'query-changed', query)
    }
  })


  return SearchBarWidget




})
