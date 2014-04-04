define(['jquery', 'js/widgets/search_bar/search_bar_widget', 'js/components/beehive', 'js/services/pubsub'], function($, SearchBarWidget, BeeHive, PubSub) {


  describe("Search Bar (UI Widget)", function() {

    var beehive, pubsub, key, widget, widget, $w;

    before(function() {
        
      beehive = new BeeHive();
      pubsub = new PubSub();
      beehive.addService('PubSub', pubsub);
      key = pubsub.getPubSubKey();

      widget = new SearchBarWidget;
      widget.activate(beehive.getHardenedInstance());
      $w = $(widget.render());

    $("#test").append($w);

    });

    after(function(){
        $("#test").empty();
    })


    it("should render a search bar and a submit button", function() {

      expect($(".q").length).to.equal(1);
      expect($(".search-submit").length).to.equal(1);
    });

    it("should trigger a NEW_QUERY when the search-submit button is pressed", function(done) {

      var currentSearch;

      pubsub.subscribe(key, pubsub.NEW_QUERY, function(apiQuery) {
        currentSearch = apiQuery.get("q")[0]
      })

      $(".q").val("author:kurtz,m");
      $(".search-submit").click();

      expect(currentSearch).to.equal('author:kurtz,m');

      done();

    });

    it("should allow the user to click to add fielded search words to search bar")



  });

})
