define([
    'underscore',
    'jquery',
    'marionette',
    'js/components/application',
    'js/page_managers/master',
    'js/widgets/base/base_widget',
    'js/page_managers/three_column_view',
    'js/page_managers/controller',
    'hbs!/test/mocha/js/page_managers/one-column',
    'hbs!/test/mocha/js/page_managers/three-column',
    'js/page_managers/one_column_view',
    'js/page_managers/toc_controller',
    'hbs!/js/wraps/abstract_page_manager/abstract-page-layout',
    '../widgets/test_json/test1',
    'js/components/api_response',
    'js/components/api_query',
    'hbs!/test/mocha/js/page_managers/master-manager',
    'hbs!/test/mocha/js/page_managers/simple',
    'js/components/beehive',
    'js/services/pubsub'
  ],
  function( _,
    $,
    Marionette,
    Application,
    MasterManager,
    BaseWidget,
    ThreeColumnView,
    PageManagerController,
    OneColumnTemplate,
    ThreeColSearchResultsTemplate,
    OneColumnView,
    TOCPageManagerController,
    TOCTemplate,
    testData,
    ApiResponse,
    ApiQuery,
    MasterTemplate,
    SimpleTemplate,
    Beehive,
    PubSub
    ){

    describe("PageManager (all_tests.spec.js)", function () {

      var config = null;
      beforeEach(function() {
        config = {
          core: {
            services: {
              'Api': 'js/services/api',
              'PubSub': 'js/services/pubsub',
               QM: 'js/components/query_mediator'

            },
            objects: {
              'Navigator': 'js/components/navigator'
            }
          },
          widgets: {
            SearchWidget: 'js/widgets/search_bar/search_bar_widget',
            Results: 'js/widgets/results/widget',
            AuthorFacet: 'js/wraps/author_facet',
            GraphTabs : 'js/wraps/graph_tabs',
            ShowAbstract: 'js/widgets/abstract/widget',
            ShowReferences: 'js/wraps/references',

            PageManager: 'js/page_managers/controller'
          }
        };
      });

      describe("Three column page manager", function() {
        it("should create page manager object", function() {
          expect(new PageManagerController()).to.be.instanceof(BaseWidget);
        });

        it("should give children the same pubsub instance", function() {
          var beehive = new Beehive();
          beehive.addService('PubSub', new PubSub());
          beehive.activate();
          var pm = new PageManagerController();

          pm.activate(beehive);

          expect(pm.getPubSub()).to.eql(pm.getPubSub());
          expect(pm.getPubSub().__facade__).to.be.true;
        });



        it("the three-col view reacts to user actions", function() {

          var view = new ThreeColumnView();

          expect(view.model.get('left')).to.be.eql('open');
          expect(view.model.get('right')).to.be.eql('open');
          expect(view.model.get('user_left')).to.be.eql(null);
          expect(view.model.get('user_right')).to.be.eql(null);

          view.showCols({left: true, right: false});

          expect(view.model.get('left')).to.be.eql('open');
          expect(view.model.get('right')).to.be.eql('closed');
          expect(view.model.get('user_left')).to.be.eql(null);
          expect(view.model.get('user_right')).to.be.eql(null);

          view.model.set('user_left', 'open');
          view.showCols({left: false, right: false});

          expect(view.model.get('left')).to.be.eql('open');
          expect(view.model.get('right')).to.be.eql('closed');
          expect(view.model.get('user_left')).to.be.eql('open');
          expect(view.model.get('user_right')).to.be.eql(null);

          view.showCols({left: false, right: true, force: true});
          expect(view.model.get('left')).to.be.eql('closed');
          expect(view.model.get('right')).to.be.eql('open');
          expect(view.model.get('user_left')).to.be.eql(null);
          expect(view.model.get('user_right')).to.be.eql(null);
        });
      });


      describe("Master page manager", function() {

        it("caches the previous page and releases the page before that", function(){

          var m = new MasterManager();
          m.collection = new Backbone.Collection([
            {id : 'foo', object : {name : 'foo'}},
            {id : 'bar', object : {name : 'bar'}},
            {id : 'baz', object : {name : 'baz'}},
          ]);

          var disassembleSpy = sinon.spy(m, 'disAssemble');

          expect(m.historyQueue).to.eql([]);
          m.currentChild = 'baz';
          m.manageHistoryQueue('foo');
          expect(m.currentChild).to.eql('foo');
          expect(m.historyQueue).to.eql(['baz']);

          m.manageHistoryQueue('bar');
          expect(m.currentChild).to.eql('bar');
          expect(m.historyQueue).to.eql(['foo']);
          expect(disassembleSpy.callCount).to.eql(1);

          m.manageHistoryQueue('foo');
          expect(m.historyQueue).to.eql(["foo", "bar"]);
          expect(disassembleSpy.callCount).to.eql(1);

          m.manageHistoryQueue('baz')
          expect(m.historyQueue).to.eql(['foo']);
          expect(disassembleSpy.callCount).to.eql(2);

        });

        it("swapping of page managers in/out manually", function(done) {
          var app = new Application({debug: false});
          delete config.widgets.PageManager;
          delete config.widgets.PageManager;
          config.core.objects.PageManager = 'js/page_managers/master';

          config.widgets.FirstPageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';
          config.widgets.SecondPageManager = 'js/wraps/landing_page_manager/landing_page_manager';

          app.loadModules(config).done(function() {

              $.when(app._getWidget('FirstPageManager'), app._getWidget('SecondPageManager')).done(function(pm, pm2) {

                app.activate();

                pm.assemble(app);
                pm2.assemble(app);

                //var $body = $('#test');
                var $body = $('<div/>');

                var masterPageManager = app.getObject('PageManager');
                masterPageManager.assemble(app);

                var navigator = app.getObject('Navigator');
                navigator.router = new Backbone.Router();

                navigator.set('show-stuff', function() {
                  $body.children().detach();
                  $body.append(pm2.show().el);
                });

                $body.append(pm.show().el);

                //should show abstract page
                expect($body.find("#abstract-page-layout").length).to.eql(1);

                var pubsub = app.getService('PubSub').getHardenedInstance();
                pubsub.publish(pubsub.NAVIGATE, 'show-stuff');

                expect($body.find("#landing-page-layout").length).to.eql(1);
                expect($body.find("#abstract-page-layout").length).to.eql(0);

                done();

              });

          });

        });


        it("using PageManager object", function(done) {
          var app = new Application({debug: false});
          delete config.widgets.PageManager;
          config.core.objects.PageManager = 'js/page_managers/master';
          config.widgets.FirstPageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';
          config.widgets.SecondPageManager = 'js/wraps/landing_page_manager/landing_page_manager';

          app.loadModules(config).done(function(){

            $.when(app.getWidget('FirstPageManager'), app.getWidget('SecondPageManager')).done(function(pm, pm2){

              var navigator = app.getObject('Navigator');
              navigator.router = new Backbone.Router();

              var masterPageManager = app.getObject('PageManager');
              var firstPageManager = pm;
              var secondPageManager = pm2;

              app.activate();
              masterPageManager.assemble(app);

              navigator.set('show-stuff', function() {
                app.getObject('PageManager').show('SecondPageManager');
              });

              masterPageManager.show('FirstPageManager');

              expect( masterPageManager.view.$el.find("#abstract-page-layout").length).to.eql(1);

              expect(masterPageManager.collection.length).to.eql(1);


              var pubsub = app.getService('PubSub').getHardenedInstance();
              pubsub.publish(pubsub.NAVIGATE, 'show-stuff');

              expect(masterPageManager.view.$el.find("#landing-page-layout").length).to.eql(1);
              expect(masterPageManager.view.$el.find("#abstract-page-layout").length).to.eql(0);

            expect(masterPageManager.getCurrentActiveChild()).to.eql(secondPageManager);
             expect(masterPageManager.collection.length).to.eql(2);


              done();

            });

          });

        });

      });
    });
  });
