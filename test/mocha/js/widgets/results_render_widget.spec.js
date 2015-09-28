define([
    'marionette',
    'backbone',
    'js/bugutils/minimal_pubsub',
    'js/widgets/results/widget',
    'js/components/api_query',
    './test_json/test1',
    './test_json/test2',
    'js/widgets/list_of_things/widget',
    'js/components/api_response',
    'js/components/api_query',
    'js/components/app_storage'
  ],
  function (
    Marionette,
    Backbone,
    MinimalPubsub,
    ResultsWidget,
    ApiQuery,
    Test1,
    Test2,
    ListOfThingsWidget,
    ApiResponse,
    ApiQuery,
    AppStorage
    ) {

    describe("Render Results UI Widget (results_render_widget.spec.js)", function () {

      var minsub;
      beforeEach(function (done) {

        minsub = new (MinimalPubsub.extend({
          request: function (apiRequest) {
            if (this.requestCounter % 2 === 0) {
              return Test1();
            } else {
              var ret = Test1();
              ret.response.start = 10;
              return ret;
            }
          }
        }))({verbose: false});
        done();


      });

      afterEach(function (done) {
        minsub.destroy();
        var ta = $('#test');
        if (ta) {
          ta.empty();
        }
        done();
      });

      it("returns ResultsWidget object", function (done) {
        expect(new ResultsWidget()).to.be.instanceof(ResultsWidget);
        expect(new ResultsWidget()).to.be.instanceof(ListOfThingsWidget);
        done();
      });

      var _getWidget = function() {
        var widget = new ResultsWidget();

        var fakeUserObject = {getHardenedInstance : function(){return this}, isOrcidModeOn : function(){return false}, getUserData : function(){ return {link_server :  "foo"}}};
        minsub.beehive.addObject("User", fakeUserObject);

        widget.activate(minsub.beehive.getHardenedInstance());
        return widget;
      };

      it("should listen to START_SEARCH and automatically request and render data", function (done) {
        var widget = _getWidget();
        widget.foox = 1;
        expect(widget.collection.length).to.eql(0);
        expect(widget.getCurrentQuery().toJSON()).to.eql({});
        minsub.publish(minsub.START_SEARCH, new ApiQuery({q: "star isbn:* *:*"}));
        setTimeout(function() {

          expect(widget.model.get('currentQuery').toJSON()).to.eql({
              "q": [
                "star isbn:* *:*"
              ],
              "hl": [
                "true"
              ],
              "hl.q": [
                "star"
              ],
              "hl.fl": [
                "title,abstract,body,ack"
              ],
              "hl.maxAnalyzedChars": [
                "150000"
              ],
              "hl.requireFieldMatch": [
                "true"
              ],
              "hl.usePhraseHighlighter": [
                "true"
              ],
              "fl": [
                "title,abstract,bibcode,author,keyword,id,links_data,property,[citations],pub,aff,email,volume,pubdate,doi"
              ],
              "rows": [
                20
              ],
              "start": [
                0
              ]
            });
          expect(widget.model.get('currentQuery').url()).to.eql('fl=title%2Cabstract%2Cbibcode%2Cauthor%2Ckeyword%2Cid%2Clinks_data%2Cproperty%2C%5Bcitations%5D%2Cpub%2Caff%2Cemail%2Cvolume%2Cpubdate%2Cdoi&hl=true&hl.fl=title%2Cabstract%2Cbody%2Cack&hl.maxAnalyzedChars=150000&hl.q=star&hl.requireFieldMatch=true&hl.usePhraseHighlighter=true&q=star+isbn%3A*+*%3A*&rows=20&start=0');
          expect(widget.collection.length).to.eql(10);
          done();
        }, 50);
      });

      it("provides the openurl linkserver info to each model's data for the link_generator_mixin", function(){

        //each model will interact with the link generator mixin, which expectes the link_server param

        var widget = _getWidget();

        minsub.publish(minsub.START_SEARCH, new ApiQuery({q: "star"}));

        expect(widget.collection.pluck("link_server")).to.eql(["foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo"]);

      });


      it("should join highlights with their records on a model by model basis", function (done) {
        var widget = _getWidget();
        minsub.publish(minsub.START_SEARCH, new ApiQuery({q: "star"}));
        setTimeout(function() {
          expect(widget.collection.findWhere({"recid": 4189917}).get("highlights")[0]).to.eql("External triggers of <em>star</em> formation.");
          done();
        },5);
      });

      it.skip("should show three authors with semicolons in the correct places and, if there are more, show the number of the rest", function () {
        //$('#test').append($w);
        var $parentRow = $($w.find("input[value='2002CeMDA..82..113F']").parents().eq(4));
        //
        expect($parentRow.find("ul.just-authors li:first").text()).to.equal("Fellhauer, M.;");
        expect($parentRow.find("ul.just-authors li:eq(2)").text()).to.equal("Kroupa, P.");
        expect($parentRow.find("ul.just-authors").siblings().eq(0).text()).to.equal("and 1 more");
      });


      it.skip("should show details (if available) when a user clicks on 'show details'", function (done) {
        //
        var widget = new ListOfThingsWidget();
        widget.activate(minsub.beehive.getHardenedInstance());
        widget.render();
        //
        //$('#test').append(widget.render().el);
        //
        minsub.publish(minsub.INVITING_REQUEST, new ApiQuery({
          q: "star"
        }));

        var $w = $(widget.render().el);
        //
        expect($w.find('.more-info:last').hasClass("hide")).to.equal(true);
        //
        $w.find("button.show-details").click();
        expect($w.find('.more-info:last').hasClass("hide")).to.be.equal(false);
        $w.find("button.show-details").click();
        expect($w.find('.more-info:last').hasClass("hide")).to.be.equal(true);
        done();
      });

      it.skip("should hide detail controls if no record has details", function (done) {
        //
        var changeIt = true;
        var widget = new (ListOfThingsWidget.extend({
          parseResponse: function (apiResponse) {
            var resp = ListOfThingsWidget.prototype.parseResponse.apply(this, arguments);
            //
            _.each(resp, function (model) {
              if (changeIt) {
                delete model['details'];
              }
              else {
                model.details = 'one';
              }
            });
            //
            return resp;
          }
        }))();
        //
        widget.activate(minsub.beehive.getHardenedInstance());
        var $w = $(widget.render().el);
        //
        //$('#test').append(widget.render().el);
        //
        minsub.publish(minsub.INVITING_REQUEST, new ApiQuery({
          q: "star"
        }));
        //
        expect($w.find('.results-controls').hasClass("hide")).to.equal(true);
        //
        changeIt = false;
        minsub.publish(minsub.INVITING_REQUEST, new ApiQuery({
          q: "star"
        }));
        //
        expect($w.find('.results-controls').hasClass("hide")).to.equal(false);
        done();
      });

      it.skip("should listen to INVITING_REQUEST event", function (done) {
        //
        var widget = new (ListOfThingsWidget.extend({
          parseResponse: function (apiResponse) {
            var resp = ListOfThingsWidget.prototype.parseResponse.apply(this, arguments);
            _.each(resp, function (model) {
              model['identifier'] = model.bibcode;
            });
            return resp;
          }
        }))();
        //
        widget.activate(minsub.beehive.getHardenedInstance());
        var $w = widget.render().$el;
        //
        //get widget to request info
        minsub.publish(minsub.INVITING_REQUEST, new ApiQuery({
          q: "star"
        }));
        //
        //find bibcode rendered
        expect($w.find(".identifier").eq(0).text()).to.equal("2013arXiv1305.3460H");
        //
        //
        minsub.publish(minsub.INVITING_REQUEST, new ApiQuery({
          q: "star"
        }));
        //
        //find new first bib to confirm re-render
        expect($w.find(".identifier").eq(0).text()).to.equal("2006IEDL...27..896K");
        done();
      });


      it("should render the show snippets button only if highlights exist given the paginated docs", function () {

        var widget = _getWidget();
        var responseWithHighlights = new ApiResponse({
          "responseHeader": {
            "status": 0,
            "QTime": 11,
            "params": {
              "fl": "id",
              "indent": "true",
              "q": "author:accomazzi,a",
              "hl.simple.pre": "<em>",
              "hl.simple.post": "</em>",
              "wt": "json",
              "hl": "true"}},
          "response": {"numFound": 175, "start": 0, "docs": [
            {
              "id": "10406064"},
            {
              "id": "3513629"},
            {
              "id": "5422941"}
          ]
          },
          "highlighting": {
            "10406064": {"title": "fooblydoo"},
            "3513629": {"abstract": ""}
          }});
        responseWithHighlights.setApiQuery(new ApiQuery({start : 0, rows : 25}));
        widget.processResponse(responseWithHighlights);
        expect(widget.model.get('showHighlights')).to.eql('open');

        var $w = widget.render().$el;
        $('#test').append($w);

        //expect results button;
        expect(widget.view.render().$el.find(".show-highlights").length).to.eql(1);


        widget.model.set('showHighlights', false);
        expect(widget.view.render().$el.find(".show-highlights").length).to.eql(0);


        var responseWithoutHighlights = new ApiResponse({
          "responseHeader": {
            "status": 0,
            "QTime": 11,
            "params": {
              "fl": "id",
              "indent": "true",
              "q": "author:accomazzi,a",
              "hl.simple.pre": "<em>",
              "hl.simple.post": "</em>",
              "wt": "json",
              "hl": "true"}},
          "response": {"numFound": 3, "start": 0, "docs": [
            {
              "id": "10406064"},
            {
              "id": "3513629"},
            {
              "id": "5422941"}
          ]
          },
          "highlighting": {
            "10406064": {"title": ""},
            "3513629": {"abstract": ""}
          }});
        responseWithoutHighlights.setApiQuery(new ApiQuery());

        widget.reset();
        expect(widget.model.get('showHighlights')).to.be.false;
        widget.processResponse(responseWithoutHighlights);
        expect(widget.model.get('showHighlights')).to.be.false;


      });


      it("has a view that displays records for each model in the collection", function(done){

        var widget = new ResultsWidget({perPage: 10});

        var fakeUserObject = {getHardenedInstance : function(){return this}, isOrcidModeOn : function(){return false}, getUserData : function(){ return {link_server :  "foo"}}};
        minsub.beehive.addObject("User", fakeUserObject);
        widget.activate(minsub.beehive.getHardenedInstance());

        var $w = widget.render().$el;
        $("#test").append($w);

        minsub.publish(minsub.START_SEARCH, new ApiQuery({'q': 'foo:bar'}));

        //now check to make sure it was rendered correctly
        setTimeout(function() {

          //checking first record
          expect($w.find(".s-identifier:first").text().trim()).to.eql("2013arXiv1305.3460H");
          expect($w.find(".s-identifier:first a").attr("href").trim()).to.eql("#abs/2013arXiv1305.3460H/abstract");
          /// expect($w.find(".s-results-links:first").find('div:not(.orcid-actions)').find("a").text().trim()).to.eql("arXiv eprint"); // without .orcid-actions
          expect($w.find("h3:first").text().trim()).to.eql("A bijection for tri-cellular maps");
          expect($w.find(".article-author:first").text().trim()).to.eql("Han, Hillary S. W.;");

          //checking last record
          expect($w.find(".s-identifier:last").text().trim()).to.eql("1987sbge.proc...47M");
          expect($w.find(".s-identifier:last a").attr("href").trim()).to.eql("#abs/1987sbge.proc...47M/abstract");
          /// expect($w.find(".s-results-links:last").find('div:not(.orcid-actions)').find("a").text().trim()).to.eql("Table of Contents"); // without .orcid-actions
          expect($w.find("h3:last").text().trim()).to.eql("Diffuse high-energy radiation from regions of massive star formation.");

          //checking render order of more than 3 authors
          expect($w.find(".just-authors:last").text().replace(/\s+/g, '')).to.eql("Montmerle,T.;FakeAuthor1;FakeAuthor2and3more");
          done();
        }, 5);
      });


      it("should have the num formatter", function() {
        var widget  = _getWidget();
        expect(widget.formatNum(889899)).to.be.eql('889,899');
      });


      it("should mark papers as selected", function() {
        var s = new AppStorage();
        s.activate(minsub.beehive);
        minsub.beehive.addObject('AppStorage', s);

        var widget  = _getWidget();
        var $w = widget.render().$el;

        s.addSelectedPapers('2013arXiv1305.3460H');
        minsub.publish(minsub.START_SEARCH, new ApiQuery({'q': 'foo:bar'}));

        var $w = widget.render().$el;
        $("#test").append($w);

        // select a paper and observe it gets into the storage
        expect(s.isPaperSelected('1993sfgi.conf..324C')).to.eql(false);
        $w.find('input[value="1993sfgi.conf..324C"]').click();
        expect(s.isPaperSelected('1993sfgi.conf..324C')).to.eql(true);



      });
    })
  });