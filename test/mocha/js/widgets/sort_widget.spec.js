/**
 * Created by alex on 5/19/14.
 */
define(['backbone', 'marionette', 'jquery',
    'js/widgets/sort/widget', 'js/widgets/base/base_widget',
  'js/bugutils/minimal_pubsub', 'js/components/api_query','js/components/api_request', 'js/components/api_response', 'bootstrap'],
  function (Backbone, Marionette, $, SortWidget, BaseWidget, MinimalPubsub, ApiQuery, ApiRequest, ApiResponse) {


  describe("Sort Widget (UI Widget)", function(){

    var sw, view, minsub, fakeData;

    beforeEach(function(){

      sw = new SortWidget();
      sw.render();
      view = sw.view;
      $("#test").append(view.el);




      minsub = new MinimalPubsub()

      sw.activate(minsub.beehive.getHardenedInstance());

      fakeData =  {
        "responseHeader":{
          "status":0,
          "QTime":4,
          "params":{
            "sort":"citation_count asc",
            "fl":"title",
            "indent":"true",
            "q":"star",
            "wt":"json",
            "rows":"1"}},
        "response":{"numFound":856512,"start":0,"docs":[
          {
            "title":["Crystal growth and scintillation properties of LSO and LYSO crystals"]}]
        }};


    });


    afterEach(function(){
      minsub.close();
      $("#test").empty();

    })


    it("should be a simple widget consisting of Base Widget and an ItemView", function(){

      expect(sw).to.be.instanceof(BaseWidget)
      expect(view).to.be.instanceof(Marionette.ItemView)
    })

    it("should display options to sort by relevance, date, citations, and popularity", function(){

      expect(sw.view.$("a[value='citation_count asc']").length).to.equal(1)
      expect(sw.view.$("a[value='citation_count desc']").length).to.equal(1)

      expect(sw.view.$("a[value='pubdate_sort desc']").length).to.equal(1)
      expect(sw.view.$("a[value='pubdate_sort asc']").length).to.equal(1)

      expect(sw.view.$("a[value='score']").length).to.equal(1)

      expect(sw.view.$("a[value='read_count asc']").length).to.equal(1)
      expect(sw.view.$("a[value='read_count desc']").length).to.equal(1)

    })

//    it("should listen to pubsub's INVITING_REQUEST and ask for the current sort ", function(){
//      var apiQuery = new ApiQuery({
//        q: "star",
//        sort: "citation_count asc"
//      });
//
//      var apiRequest = new ApiRequest({
//        query : apiQuery
//      })
//
//      minsub.publish(minsub.INVITING_REQUEST, apiRequest);
//
//
//    })

    it("should listen to pubsub's DELIVERING_RESPONSE  and keep an updated copy of current sort in its model", function(){

      expect(view.model.get("current")).to.equal(undefined)

      var apiResponse = new ApiResponse(fakeData)

      minsub.publish(minsub.DELIVERING_RESPONSE, apiResponse);

      expect(view.model.get("current")).to.equal("citation_count asc")


    })

    it("should automatically display the current sort order in the template", function(){
      view.model.set("current", "citation_count asc");

      expect($("#test").find("#sort-button").text()).to.match(/\s*Citation\s+Ascending\s*/)

      view.model.set("current", "read_count desc");

      expect($("#test").find("#sort-button").text()).to.match(/\s*Popularity\s+Descending\s*/)

    })

    it("should listen to all selection events in the menu view and translate that to a new ApiQuery", function(){
      var newQuery = undefined;

      minsub.subscribe(minsub.NEW_QUERY, function(e){
        newQuery = e
      })

      $("#test").find("a[value='pubdate_sort asc']").click()

      expect(JSON.stringify(newQuery.toJSON())).to.equal(JSON.stringify({sort:['pubdate_sort asc' ]}))

    })




  })

})