define([
  'jquery',
  'js/bugutils/minimal_pubsub',
  'js/components/api_query',
  './test_json/test1',
  './test_json/test2',
  'js/widgets/list_of_things/widget',
  'js/widgets/list_of_things/details_widget',
  'js/wraps/citations',
  'js/wraps/coreads',
  'js/wraps/references',
  'js/wraps/table_of_contents'

], function(
  $,
  MinPubSub,
  ApiQuery,
  test1,
  test2,
  LoTWidget,
  DetailsLoTWidget,
  CitationWidget,
  CoreadsWidget,
  ReferencesWidget,
  TableOfContentsWidget
  ){

  describe("Various show-detail LoT Widgets (lot_derivates.spec.js)", function(){

    var minsub, counter;

    beforeEach(function(){
      counter = 0;
      minsub = new (MinPubSub.extend({
        request: function(apiRequest) {
          counter++;
          var q = apiRequest.get('query');
          var ret = test1();
          if (counter % 2 == 0)
            ret = test2();

          _.each(q.keys(), function(k) {
            ret.responseHeader.params[k] = q.get(k)[0];
          });
          //but widget is currently checking in the response.start not the responseheader
          ret.response.start = q.get("start")[0];
          //_.extend(ret.responseHeader.params, q.toJSON());
          return ret;
        }
      }))({verbose: false});
    });



    it("Extends Details LoT widget", function() {
      expect(new DetailsLoTWidget()).to.be.instanceof(LoTWidget);
      expect(new CitationWidget()).to.be.instanceof(DetailsLoTWidget);
      expect(new ReferencesWidget()).to.be.instanceof(DetailsLoTWidget);
      expect(new CoreadsWidget()).to.be.instanceof(DetailsLoTWidget);
      expect(new TableOfContentsWidget()).to.be.instanceof(DetailsLoTWidget);
    });

    it("Details LoT widget has certain methods", function() {
      var widget = new DetailsLoTWidget();
      // makes sure that dispatchRequest goes through without waiting
      widget.canLoad = true;
      expect(widget.extractValueFromQuery(new ApiQuery({'q': 'bibcode:foo'}), 'q', 'bibcode')).to.eql('foo');
      expect(widget.extractValueFromQuery(new ApiQuery({'q': '"bibcode:foo"'}), 'q', 'bibcode')).to.eql('foo');
    });

    it("does not keep old records around in the hiddenCollection whenever the bibcode param is changed in the model", function(){

      var w = new DetailsLoTWidget();
      // makes sure that dispatchRequest goes through without waiting
      w.canLoad = true;
      w.hiddenCollection.add([{bibcode : 1}, {bibcode : 2}]);
      expect(JSON.stringify(w.hiddenCollection.toJSON())).to.eql('[{"bibcode":1,"resultsIndex":0,"emptyPlaceholder":false,"visible":false,"actionsVisible":true},{"bibcode":2,"resultsIndex":1,"emptyPlaceholder":false,"visible":false,"actionsVisible":true}]');
      //this will be triggered by TOC widget on a fresh "display_documents"
      w.model.set('bibcode', 'new_bibcode');
      expect(JSON.stringify(w.hiddenCollection.toJSON())).to.eql("[]")

    });

    it("resets pagination values whenever the bibcode param is changed in the model", function(){

      var widget = new DetailsLoTWidget();

      // makes sure that dispatchRequest goes through without waiting
      widget.canLoad = true;

      var updatePagination = widget.updatePagination;
      widget.updatePagination = function (opts) {
        return updatePagination.call(widget, _.assign(opts, { updateHash: false }));
      }

      widget.activate(minsub.beehive.getHardenedInstance());
      $("#test").append(widget.getEl());
      minsub.publish(minsub.DISPLAY_DOCUMENTS, new ApiQuery({'q': 'bibcode:bar'}));
      expect(JSON.stringify(widget.model.toJSON())).to.eql('{"mainResults":false,"showAbstract":"closed","showHighlights":"closed","showSidebars":true,"pagination":true,"start":0,"highlightsLoaded":false,"perPage":25,"numFound":841359,"currentQuery":{"q":["bibcode:bar"],"fl":["title,bibcode,author,keyword,pub,aff,volume,year,[citations],property,pubdate,abstract,esources,data"],"rows":[25],"start":[0]},"pageData":{"perPage":25,"totalPages":33655,"currentPage":1,"previousPossible":false,"nextPossible":true},"bibcode":"bar","query":false,"page":0,"showRange":[0,24],"loading":false}');

     //go to second page
      $(".page-control.next-page").click();
      expect(widget.model.get("pageData")).to.eql({perPage: 25, totalPages: 33655, currentPage: 2, previousPossible: true, nextPossible: true});
      minsub.publish(minsub.DISPLAY_DOCUMENTS, new ApiQuery({'q': 'bibcode:anotherbibcode'}));
      expect(widget.model.get("pageData")).to.eql({perPage: 25, totalPages: 10628, currentPage: 1, previousPossible: false, nextPossible: true});
      expect(JSON.stringify(widget.model.toJSON())).to.eql('{"mainResults":false,"showAbstract":"closed","showHighlights":"closed","showSidebars":true,"pagination":true,"start":0,"highlightsLoaded":false,"perPage":25,"numFound":265682,"currentQuery":{"q":["bibcode:anotherbibcode"],"fl":["title,bibcode,author,keyword,pub,aff,volume,year,[citations],property,pubdate,abstract,esources,data"],"rows":[25],"start":[0]},"pageData":{"perPage":25,"totalPages":10628,"currentPage":1,"previousPossible":false,"nextPossible":true},"bibcode":"anotherbibcode","query":false,"page":0,"showRange":[0,24],"loading":false}');


      $("#test").empty();
    });

    it("Show citations", function(){
      var widget = new CitationWidget();

      // makes sure that dispatchRequest goes through without waiting
      widget.canLoad = true;
      widget.activate(minsub.beehive.getHardenedInstance());

      var $w = widget.render().$el;
      //$('#test').append($w);

      minsub.publish(minsub.DISPLAY_DOCUMENTS, new ApiQuery({'q': 'bibcode:bar'}));
      expect($w.find("label").length).to.equal(26);

      expect($w.find("a:first").attr("href")).to.eql('#search/q=citations(bibcode%3Abar)&sort=date%20desc');

    });

    it("Show references", function(done){
      var widget = new ReferencesWidget();

      // makes sure that dispatchRequest goes through without waiting
      widget.canLoad = true;
      widget.activate(minsub.beehive.getHardenedInstance());

      var $w = widget.render().$el;
      //$('#test').append($w);

     var query =  widget.customizeQuery( new ApiQuery({'q': 'bibcode:bar'}));

    //should have sort  = author desc
     expect(query.url()).to.eql('fl=title%2Cbibcode%2Cauthor%2Ckeyword%2Cpub%2Caff%2Cvolume%2Cyear%2C%5Bcitations%5D%2Cproperty%2Cpubdate%2Cabstract%2Cesources%2Cdata&q=references(bibcode%3Abar)&rows=25&sort=first_author%20asc&start=0');

      minsub.publish(minsub.DISPLAY_DOCUMENTS, new ApiQuery({'q': 'bibcode:bar'}));
      expect($w.find("label").length).to.equal(26);

      expect($w.find(".s-list-description").text()).to.eql("Papers referenced by");

      widget.trigger("page-manager-message", "broadcast-payload", { title: "foo" });
      widget.trigger("page-manager-message", "widget-selected", { idAttribute: "ShowReferences" });

      expect($w.find("a:first").attr("href")).to.eql("#search/q=references(bibcode%3Abar)&sort=first_author%20asc");

      setTimeout(function(){
        expect($w.find(".s-article-title").text()).to.eql("foo");
        done()
      }, 200);
    });

    it("Show coreads", function(done){
      var widget = new CoreadsWidget();

      // makes sure that dispatchRequest goes through without waiting
      widget.canLoad = true;
      widget.activate(minsub.beehive.getHardenedInstance());

      var $w = widget.render().$el;
      //$('#test').append($w);

      var query =  widget.customizeQuery( new ApiQuery({'q': 'bibcode:bar'}));

      expect(query.url()).to.eql( 'fl=title%2Cbibcode%2Cauthor%2Ckeyword%2Cpub%2Caff%2Cvolume%2Cyear%2C%5Bcitations%5D%2Cproperty%2Cpubdate%2Cabstract%2Cesources%2Cdata&q=trending(bibcode%3Abar)-bibcode%3Abar&rows=25&sort=score%20desc&start=0');

      minsub.publish(minsub.DISPLAY_DOCUMENTS, new ApiQuery({'q': 'bibcode:bar'}));
      expect($w.find("label").length).to.equal(26);

      expect($w.find(".s-list-description").text()).to.eql("Papers also read by those who read");

      widget.trigger("page-manager-message", "broadcast-payload", {title: "foo"});
      widget.trigger("page-manager-message", "widget-selected", { idAttribute: "ShowCoreads" });

      setTimeout(function(){
        expect($w.find(".s-article-title").text()).to.eql("foo");
        done()
      }, 200)


      //should remove self from search results

      expect($w.find("a:first").attr("href")).to.eql('#search/q=trending(bibcode%3Abar)%20-bibcode%3Abar&sort=score%20desc');


    });

    it("Show TableOfContents", function(done){
      var widget = new TableOfContentsWidget();

      // makes sure that dispatchRequest goes through without waiting
      widget.canLoad = true;
      widget.activate(minsub.beehive.getHardenedInstance());

      var $w = widget.render().$el;

      minsub.publish(minsub.DISPLAY_DOCUMENTS, new ApiQuery({'q': 'bibcode:bar'}));
      expect($w.find("label").length).to.equal(26);

      expect($w.find(".s-list-description").text()).to.eql("Papers in the same volume as");

      widget.trigger("page-manager-message", "broadcast-payload", {title: "foo"});
      widget.trigger("page-manager-message", "widget-selected", { idAttribute: "ShowTableofcontents" });

      setTimeout(function(){
        expect($w.find(".s-article-title").text()).to.eql("foo");
        done()
      }, 200)


    });

  })
});
