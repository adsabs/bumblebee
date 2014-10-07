define(['marionette', 'backbone',
    'js/widgets/base/base_widget',
    'js/components/api_response',
    'js/components/api_request',
    'js/components/api_query',
    'js/bugutils/minimal_pubsub'
  ],
  function(Marionette, Backbone,
           BaseWidget,
           ApiResponse,
           ApiRequest,
           ApiQuery,
           MinimalPubSub) {

    describe("Base Widget (UI Widget)", function() {

      var minsub;
      beforeEach(function() {

        minsub = new (MinimalPubSub.extend({
          request: function(apiRequest) {
            return {
              "responseHeader": {
                "status": 0,
                "QTime": 543,
                "params": {
                  "q": "star"
                }
              }
            }
          }
        }))({verbose: false});
      });

      afterEach(function() {
        minsub.close();
      });

      it("returns BaseWidget object", function() {
        expect(new BaseWidget()).to.be.instanceof(BaseWidget);
      });

      it("listens to certain signals", function(done) {
        var W = BaseWidget.extend({
          processResponse: function(response) {
            this.setCurrentQuery(response.getApiQuery());
          }
        });

        var widget = new W();
        _.each(['dispatchRequest', 'customizeQuery', 'composeRequest', 'processResponse'], function(name) {
          sinon.spy(widget, name);
        });

        widget.activate(minsub.beehive.getHardenedInstance());


        minsub.publish(minsub.START_SEARCH, new ApiQuery({q: 'pluto'}));

        expect(widget.dispatchRequest.firstCall.args[0].url()).to.eql('q=pluto');
        expect(widget.customizeQuery.calledOnce).to.be.true;
        expect(widget.customizeQuery.calledBefore(widget.composeRequest)).to.be.true;
        expect(widget.processResponse.called).to.be.true;
        done();

      });

      it("has the activate, getView, and close methods necessary for most/all ui widgets", function(){
        var widget = new BaseWidget();

        expect(widget.activate).to.be.instanceof(Function);
        expect(widget.close).to.be.instanceof(Function);
        expect(widget.getView).to.be.instanceof(Function);
        expect(widget.render).to.be.instanceof(Function);
      });

      it("has a loading view option that resolves automatically for itemviews and on add, reset or nonFound events for Collection or CompositeViews", function(){

        var widget = new BaseWidget();

        expect(widget.startWidgetLoad).to.be.instanceof(Function);
        expect(widget.loadingTemplate().trim()).to.eql("<div class=\"s-loading\"></div>");

        //test 1: adding and removing a loading view for an item view

        widget.view = new Backbone.Marionette.ItemView({
          template : function(){return "<div>not loading</div>"}
        });
        $("#test").append(widget.view.render().el);

        widget.startWidgetLoad();

        expect($("#test").find(".s-loading").length).to.eql(1);

        widget.view.render();

        expect($("#test").find(".s-loading").length).to.eql(0);

        $("#test").empty();

        // test 2: adding and removing a loading view for a composite view
        //  loading view needs to remove itself on collection reset, add, or "noneFound" events

        var c = new Backbone.Collection();

        var widget = new BaseWidget();

        widget.collection = c;

        var V =  Backbone.Marionette.CompositeView.extend({
          template : function(){return "<div class=\"container\"></div>"},

          itemViewContainer : ".container"

        });

        widget.view = new V({ collection : widget.collection });

        $("#test").append(widget.view.render().el);

        widget.startWidgetLoad();

        expect($("#test").find(".s-loading").length).to.eql(1);

        widget.collection.reset();

        expect($("#test").find(".s-loading").length).to.eql(0);

        widget.startWidgetLoad();

        expect($("#test").find(".s-loading").length).to.eql(1);

        widget.collection.add({testModel : true});

        expect($("#test").find(".s-loading").length).to.eql(0);

        widget.startWidgetLoad();

        expect($("#test").find(".s-loading").length).to.eql(1);

        widget.collection.trigger("noneFound");

        expect($("#test").find(".s-loading").length).to.eql(0);

      })


    })

  });
