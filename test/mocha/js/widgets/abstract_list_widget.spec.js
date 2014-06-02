/**
 * Created by alex on 6/1/14.
 */

define(['backbone', 'marionette', 'jquery', 'js/widgets/abstract_lists/widget',
    'js/widgets/results/widget' ],
  function (Backbone, Marionette, $, AbstractListWidget, ResultsWidget, MinimalPubSub) {

    var alw, view;

    beforeEach(function(){
      alw = new AbstractListWidget();
      alw.render();
      view = alw.view;

    })

    afterEach(function(){
      $("#test").empty()

    })

    describe("Abstract List Widget (UI Widget)", function(){

      it("should inherit from Results Widget", function(){

        expect(alw).to.be.instanceof(ResultsWidget)

      })

      it("has a function to accept a list of bibcodes or a single bibcode to request from pubsub", function(){

        expect(alw.bibcodes).to.equal(undefined)
        alw.registerBib("fakeBibcode")
        expect(JSON.stringify(alw.bibcodes)).to.equal(JSON.stringify(["fakeBibcode"]))
        

      })

      it("should accept an operator as an option and return a results list that reflects the solr results for that operator")




    })


  });