define([
    'underscore',
    'jquery',
    'marionette',
    'js/components/application',
    'js/widgets/base/base_widget',
    'js/page_managers/three_column_view',
    '../widgets/test_json/test1',
    'js/components/api_response',
    'js/components/api_query'

  ],
  function(
    _,
    $,
    Marionette,
    Application,
    BaseWidget,
    ThreeColumnView,
    testData,
    ApiResponse,
    ApiQuery

    ) {

    describe("TOC Manager", function () {

      var config = null;
      beforeEach(function () {
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

            SearchWidget : 'js/widgets/search_bar/search_bar_widget',


            DetailsPage: 'js/wraps/abstract_page_manager/abstract_page_manager',



            ShowAbstract: 'js/widgets/abstract/widget',
            ShowGraphics: 'js/widgets/graphics/widget',
            ShowGraphicsSidebar: 'js/wraps/sidebar-graphics-widget',
            ShowReferences: 'js/wraps/references',
            ShowCitations: 'js/wraps/citations',
            ShowCoreads: 'js/wraps/coreads',
            //can't camel case because router only capitalizes first letter
            ShowTableofcontents: 'js/wraps/table_of_contents',
            ShowResources: 'js/widgets/resources/widget',
            ShowRecommender: 'js/widgets/recommender/widget',
            ShowMetrics: 'js/wraps/paper_metrics',
            ShowPaperExport : 'js/wraps/paper_export',
            ShowLibraryAdd : 'js/wraps/abstract_page_library_add/widget',


            PageManager: 'js/page_managers/controller'
          }
        };
      });

      /*

       TOC Page Manager/ Widget Implementation

       A way for the page manager to communicate with the navigator to easily switch between widgets or multiple views within a widget
       Instructions:
       (see wraps for abstract page manager or user settings page manager for examples)
       1.	provide a nav template with data attributes with name of widget OR name of widget__parameter
       2.	main page manager layout template should have a div.nav-container somewhere
       3.	nav template has to provide data-widget-id attribute for each entry
       4.	Set this as TOCTemplate in the wrap of the toc page manager
       5.	toc widget will listen to “new widget” events, and, if name of widget matches a key
       from “data” OR name of widget matches key from data minus the “__” and param, it will
       add an item to its nav collection
       6.	when link from nav collection is clicked, the toc_widget listens to the click and runs
       “navigateToPage”, which takes the data-widget-id value and  splits it if it has a “__”,
       and then triggers widget-selected with the widget name and optional param
       7.	TOC controller catches “widget-selected” event which then emits
       pubsub.publish(pubsub.NAVIGATE, data.idAttribute, data);
       where data consists of data.href (in case the navigator wants to change the route) and data.arg
       (to identify the subview)
       8.	any widget that has multiple views needs to have a “setSubView” function for toc manager to tell it the right view so that
       the TOC_controller can call this after it sets the right nav option
       * */

      it("assembles the page view", function (done) {
        this.timeout(30000);
        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          var pageManager = app._getWidget("PageManager").done(function(pageManager){

            app.activate();

            pageManager.requireAndInstantiateWidgets(app).done(function(){

              pageManager.assemble(app).done(function(){

                //$('#test').append(pageManager.view.el);
                var $w = pageManager.view.$el;

                expect($w.find('[data-widget="SearchWidget"]').children().length).to.be.equal(1);
                expect($w.find('[data-widget="ShowAbstract"]').children().length).to.be.equal(1);
                expect($w.find('[data-widget="ShowReferences"]').children().length).to.be.equal(1);

                pageManager.show('SearchWidget', 'ShowAbstract', 'TOCWidget');

                  done();

                });

              });

            })

          });

        });


      it("has a wrap (details manager) which listens to pubsub.DISPLAY_DOCUMENTS and places the current bibcode in the model of the TOC Widget", function (done) {
        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          // hack (normally this will not be the usage pattern)
          app._getWidget("PageManager").done(function(pageManager){

            app.activate();

            pageManager.assemble(app).done(function(){

              pageManager.widgets.tocWidget.collection.get("ShowReferences").set({numFound: 40, isActive: true});

              var pubsub = app.getService('PubSub').getHardenedInstance();
              pubsub.publish(pubsub.DISPLAY_DOCUMENTS, new ApiQuery({q: "bibcode:foo"}));


              expect(pageManager.widgets.tocWidget.collection.get("ShowReferences").get("numFound")).to.eql(40)
              expect(pageManager.widgets.tocWidget.collection.get("ShowReferences").get("isActive")).to.eql(true);

              //now testing details manager wrap, I'm not sure if this goes here but otherwise coverage fails
              pageManager.addQuery(new ApiQuery({q: "bibcode:foo"}));
              expect(pageManager.view.model.get("query")).to.eql('q=bibcode%3Afoo');

              //testing back button
              var view = pageManager.show();
              expect(view.$el.find('.s-back-button-container').html()).to.eql('<a href="#search/q=bibcode%3Afoo" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left"></i> Back to results</a>');

              //testing toc widget reset
              pageManager.widgets.tocWidget.resetActiveStates();
              setTimeout(function () {

                //default
                expect(view.$("[data-widget-id='ShowAbstract']>div").hasClass("s-nav-selected")).to.be.true;
                expect(view.$("[data-widget-id='ShowReferences]>div']").hasClass("s-nav-selected")).to.be.false;

                pageManager.widgets.tocWidget.collection.selectOne("ShowReferences");
                expect(view.$("[data-widget-id='ShowAbstract']>div").hasClass("s-nav-selected")).to.be.false;
                expect(view.$("[data-widget-id='ShowReferences']>div").hasClass("s-nav-selected")).to.be.true;
                done();

              }, 1000);

            });

          })

        })

      });

      it("can show multiple views from a single widget by adding data entries to the nav element in the following form: WidgetName__viewname", function (done) {

        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          // hack (normally this will not be the usage pattern)
          var pageManager = app._getWidget("PageManager");
          app.activate();
          pageManager.assemble(app);

          var view = pageManager.show();

          expect(pageManager.widgets.tocWidget.collection.get("ShowPaperExport__bibtex").get("category")).to.eql("export")
          expect(pageManager.widgets.tocWidget.collection.get("ShowPaperExport__aastex").get("category")).to.eql("export")
          expect(pageManager.widgets.tocWidget.collection.get("ShowPaperExport__endnote").get("category")).to.eql("export")

          var spy = sinon.spy();
          var pubsub = app.getService('PubSub').getHardenedInstance();

          pubsub.subscribe(pubsub.NAVIGATE, spy);

          pageManager.widgets.tocWidget.resetActiveStates();

          view.$("a[data-widget-id=ShowPaperExport__aastex]").click();

          expect(spy.args[0][0]).to.eql("ShowPaperExport");
          expect(spy.args[0][1]["idAttribute"]).to.eql("ShowPaperExport");
          expect(spy.args[0][1]["href"]).to.eql("/abs//export/aastex");


      pageManager.widgets.ShowPaperExport.setSubView = sinon.spy();

          //should both set the toc nav collection properly, and tell the export widget which view to show
          pageManager.setActive("ShowPaperExport", "aastex");

          expect(pageManager.widgets.ShowPaperExport.setSubView.calledWith("aastex")).to.be.true;
          expect(pageManager.widgets.tocWidget.collection.get("ShowPaperExport__bibtex").get("isSelected")).to.be.false;
          expect(pageManager.widgets.tocWidget.collection.get("ShowPaperExport__aastex").get("isSelected")).to.be.true;


        });
        done();

      });

      it("destroys itself properly", function(){
        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          // hack (normally this will not be the usage pattern)
         app.getWidget("PageManager").done(function(pageManager){
           app.activate();
           pageManager.assemble(app);

           var view = pageManager.show();

           pageManager.destroy();

           expect(_.isEmpty(pageManager._listeningTo)).to.be.true;

           expect(_.isEmpty(pageManager.widgets)).to.be.true;

           expect(view.isDestroyed).to.be.true;

         });

        });

      })

    })

  });
