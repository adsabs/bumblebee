/**
 * Created by alex on 5/19/14.
 */
define(['backbone', 'marionette', 'jquery', 'js/widgets/abstract/widget',
    'js/widgets/base/base_widget','js/bugutils/minimal_pubsub' ],
  function (Backbone, Marionette, $, AbstractWidget, BaseWidget, MinimalPubSub) {


    describe("Abstract Renderer (abstract_widget.spec.js)", function(){

      var testJSON, minsub;
      beforeEach(function(){
        testJSON = {  "responseHeader": {    "status": 0, "QTime": 62, "params": {
          "fl": "abstract,title,author,aff,pub,pubdate,keyword", "indent": "true", "start": "4", "q": "planet\n", "wt": "json", "rows": "1"}},
          "response": {
            "numFound": 238540, "start": 4,
            "docs": [
              { "bibcode": "foo",
                "keyword": ["HARMONY OF THE UNIVERSE", "THEORY OF MUSIC", "PLATO'S BODIES"],
                "author": ["Lieske, J. H.", "Standish, E. M."],
                "abstract": "In the past twenty years there has been a great amount of growth in radiometric observing methods.",
                "pub": "IAU Colloq. 56: Reference Coordinate Systems for Earth Dynamics",
                "pubdate": "1981-00-00",
                "title": ["Planetary Ephemerides"],
                "aff": ["Heidelberg, Universität, Heidelberg, Germany", "California Institute of Technology, Jet Propulsion Laboratory, Pasadena, CA"]
              }
            ]}};
        minsub = new (MinimalPubSub.extend({
          request: function (apiRequest) {
            return testJSON;
          }
        }))({verbose: false});

      });

      afterEach(function(){
        $("#test").empty();
        minsub.close();
      });

      it("should be a simple widget consisting of Base Widget, an ItemView, and a Backbone Model", function(){
        var aw = new AbstractWidget();
        expect(aw).to.be.instanceof(BaseWidget);
        expect(aw.view).to.be.instanceof(Marionette.ItemView);
        expect(aw.model).to.be.instanceof(Backbone.Model);
      });

      it("should have a model that takes raw solr data and parses it to template-ready condition", function(){
        var aw = new AbstractWidget();

        var spy = sinon.spy(aw, 'processResponse');
        aw.activate(minsub.beehive.getHardenedInstance());


        minsub.publish(minsub.DISPLAY_DOCUMENTS, minsub.createQuery({'q': 'foo'}));

        expect(spy.callCount).to.eql(1);
        expect(aw._docs['foo'].hasAffiliation).to.equal(2);
        expect(aw._docs['foo'].hasMoreAuthors).to.equal(0);
        expect(aw._docs['foo'].pubdate).to.equal("1981");
        expect(aw._docs['foo'].pub).to.equal("IAU Colloq. 56: Reference Coordinate Systems for Earth Dynamics");
        expect(aw._docs['foo'].authorAff[0]).to.eql(["Lieske, J. H.", "Heidelberg, Universität, Heidelberg, Germany", "%22Lieske%2C%20J.%20H.%22"]);
        expect(aw._docs['foo'].authorAff[1]).to.eql(["Standish, E. M.", "California Institute of Technology, Jet Propulsion Laboratory, Pasadena, CA", "%22Standish%2C%20E.%20M.%22"]);
        expect(aw._docs['foo'].authorAffExtra).to.eql([]);

        aw.maxAuthors = 1;
        minsub.publish(minsub.DISPLAY_DOCUMENTS, minsub.createQuery({'q': 'foo'}));
        expect(spy.callCount).to.eql(1); // it is not loaded again

        delete aw._docs['foo'];

        minsub.publish(minsub.DISPLAY_DOCUMENTS, minsub.createQuery({'q': 'foo'}));
        expect(spy.callCount).to.eql(2);
        expect(aw._docs['foo'].hasAffiliation).to.eql(2);
        expect(aw._docs['foo'].hasMoreAuthors).to.eql(1);
        expect(aw._docs['foo'].authorAff[0]).to.eql(["Lieske, J. H.", "Heidelberg, Universität, Heidelberg, Germany", "%22Lieske%2C%20J.%20H.%22"]);
        expect(aw._docs['foo'].authorAffExtra[0]).to.eql(["Standish, E. M.", "California Institute of Technology, Jet Propulsion Laboratory, Pasadena, CA", "%22Standish%2C%20E.%20M.%22"]);

      });

      it("should render a view with the properly rendered information and 'view more' user interactions", function(){
        var aw = new AbstractWidget();
        aw.activate(minsub.beehive.getHardenedInstance());
        minsub.publish(minsub.DISPLAY_DOCUMENTS, minsub.createQuery({'q': 'bibcode:foo'}));
        var $w = aw.render().$el;

        // normally the query comes back with the __show parameter, but in the test we'll help it
        aw.model.set(aw._docs['foo']);

        $("#test").append($w);

        expect($w.find(".affiliation").filter(".hide").length).to.equal($w.find(".affiliation").length);

        $("#test").find("#toggle-aff").click();

        expect($w.find(".affiliation").filter(".hide").length).to.equal(0);
        expect($w.find(".s-abstract-text").text()).to.match(/In the past twenty years there has been a great amount of growth in radiometric observing methods./);
      });


    })


  });