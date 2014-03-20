require(['js/widgets/facets/facets-widget', 'js/widgets/facets/test', 'js/components/api_response', 'js/components/beehive', 'js/services/pubsub'],
    function(FacetController, test, ApiResponse, Beehive, Pubsub) {

        describe("Facets (UI Widget)", function() {

            var beehive = new Beehive();
            var pubsub = new Pubsub();
            var key = pubsub.getPubSubKey();

            beehive.addService("PubSub", pubsub);

            var f = function(request) {
                var a = new ApiResponse(test);
                a.setApiQuery(request.get("query"))
                console.log(a)
                pubsub.publish(key, pubsub.DELIVERING_RESPONSE, a)
            };

            var f2 = sinon.spy(function(apiQuery) {
                pubsub.publish(key, pubsub.INVITING_REQUEST, apiQuery);

            })

            pubsub.subscribe(key, pubsub.NEW_QUERY, f2);

            pubsub.subscribe(key, pubsub.DELIVERING_REQUEST, f);

            var facets = new FacetController();

            facets.activate(beehive.getHardenedInstance());



            

   


            $("#test").append(facets.view.render().el)


            it("should return a Marionette.CollectionView object for insertion into the application layout", function() {


                expect(facets.returnView()).to.be.instanceof(Backbone.Marionette.CompositeView)

            });

            // it("should receive data and display it", function(done){

            //     var facets = new FacetController();

            //     var beehive = new Beehive();
            //     var pubsub = new Pubsub();
            //     beehive.addService("PubSub", pubsub);
            //     facets.activate(beehive.getHardenedInstance());

            //     var f = sinon.spy(function(request){
            //         var a =  new ApiResponse(test);
            //         a.setApiQuery(request.get("query"))
            //         return a

            //     });

            //     var f2 = sinon.spy(function(apiQuery){
            //         pubsub.publish(pubsub.pubSubKey, pubsub.INVITING_REQUEST, apiQuery)

            //     })

            //     pubsub.subscribe(pubsub.pubSubKey, pubsub.NEW_QUERY, f2)

            //     pubsub.subscribe(pubsub.pubSubKey, pubsub.DELIVERING_REQUEST, f)

            //     done();

            //     expect(f2.callCount).to.equal(3)



            // })


        })


    })
