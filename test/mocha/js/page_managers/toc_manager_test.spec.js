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
              'PubSub': 'js/services/pubsub'
            },
            modules: {
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
            GraphTabs: 'js/wraps/graph_tabs',

            TOCWidget: 'js/page_managers/toc_widget',
            ShowAbstract: 'js/widgets/abstract/widget',
            ShowReferences: 'js/wraps/references',
            ShowPaperExport: 'js/wraps/paper_export',

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
        this.timeout(3000);
        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          // hack (normally this will not be the usage pattern)
          app._getWidget("PageManager").done(function(pageManager) {
            pageManager.dontKillMe = true;

            app.activate();
            pageManager.assemble(app).done(function() {

              //$('#test').append(pageManager.view.el);
              var $w = pageManager.view.$el;
              expect($w.find('[data-widget="SearchWidget"]').children().length).to.be.equal(1);
              expect($w.find('[data-widget="ShowAbstract"]').children().length).to.be.equal(1);
              expect($w.find('[data-widget="ShowReferences"]').children().length).to.be.equal(1);

              pageManager.show('SearchWidget', 'ShowAbstract', 'TOCWidget');

                // deliver data to the widget for display
                app.getWidget('ShowAbstract', 'ShowReferences').done(function(w) {

                  var abstract = w['ShowAbstract'];
                  var references = w['ShowReferences'];

                  var r = new ApiResponse(testData());
                  r.setApiQuery(new ApiQuery({q: 'foo'}));

                  abstract.processResponse(r);

                  app.getWidget("TOCWidget").done(function(widget) {

                    widget.resetActiveStates();
                    // the navigation must turn active
                    expect(pageManager.view.$el.find('[data-widget-id="ShowAbstract"]>div').hasClass('s-nav-inactive')).to.be.false;
                    expect(pageManager.view.$el.find('[data-widget-id="ShowReferences"]>div').hasClass('s-nav-inactive')).to.be.true;

                    // simulated late arrival
                    references.processResponse(r);
                    expect(pageManager.view.$el.find('[data-widget-id="ShowAbstract"]>div').hasClass('s-nav-inactive')).to.be.false;
                    expect(pageManager.view.$el.find('[data-widget-id="ShowReferences>div"]').hasClass('s-nav-inactive')).to.be.false;

                    // click on the link (NAVIGATE event should be triggered)
                    var pubsub = app.getService('PubSub').getHardenedInstance();
                    var spy = sinon.spy();
                    pubsub.subscribe(pubsub.NAVIGATE, spy);
                    pageManager.view.$el.find('[data-widget-id="ShowReferences"]').click();
                    expect(spy.callCount).to.be.eql(1);

                    // it has to be selected and contain numcount
                    //the navigator is what actually selects the nav so I removed that test
                    expect(pageManager.view.$el.find('[data-widget-id="ShowReferences"] span').eq(1).text().trim()).to.eql('(841359)');
                    done();

                })
              })
            })


          })

        });

      });

      it("has a wrap (details manager) which listens to pubsub.DISPLAY_DOCUMENTS and places the current bibcode in the model of the TOC Widget", function (done) {
        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          app.getWidget("PageManager").done(function(pageManager) {
            pageManager.dontKillMe = true;

            app.activate();
            pageManager.assemble(app).done(function() {
              pageManager.widgets.tocWidget.collection.get("ShowReferences").set({numFound: 40, isActive: true})

              var pubsub = app.getService('PubSub').getHardenedInstance();
              pubsub.publish(pubsub.DISPLAY_DOCUMENTS, new ApiQuery({q: "bibcode:foo"}));

              expect(pageManager.widgets.tocWidget.model.get("bibcode")).to.eql("foo");
              expect(pageManager.widgets.tocWidget.collection.get("ShowReferences").get("numFound")).to.eql(0)
              expect(pageManager.widgets.tocWidget.collection.get("ShowReferences").get("isActive")).to.eql(false);

              //now testing details manager wrap, I'm not sure if this goes here but otherwise coverage fails
              pageManager.addQuery(new ApiQuery({q: "bibcode:foo"}));
              expect(pageManager.view.model.get("query")).to.eql('q=bibcode%3Afoo');

              pageManager.getCurrentQuery = sinon.stub().returns(new ApiQuery({q: "bibcode:foo"}));

              //testing back button
              var view = pageManager.show();
              expect(view.$el.find('.s-back-button-container').html()).to.eql('<a href="#search/q=bibcode%3Afoo" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left"></i> Back to results</a>');

              //testing toc widget reset
              pageManager.widgets.tocWidget.resetActiveStates();
              expect(view.$("[data-widget-id='ShowAbstract']>div").hasClass("s-nav-selected")).to.be.true;
              expect(view.$("[data-widget-id='ShowReferences]>div']").hasClass("s-nav-selected")).to.be.false;

              pageManager.widgets.tocWidget.collection.selectOne("ShowReferences");
              expect(view.$("[data-widget-id='ShowAbstract']>div").hasClass("s-nav-selected")).to.be.false;
              expect(view.$("[data-widget-id='ShowReferences']>div").hasClass("s-nav-selected")).to.be.true;
              done();
            });  // assemble
          }); // getWidget
        }); // loadModules
      });

      it("can show multiple views from a single widget by adding data entries to the nav element in the following form: WidgetName__viewname", function (done) {

        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          // hack (normally this will not be the usage pattern)
          app._getWidget("PageManager").done(function(pageManager) {
            pageManager.dontKillMe = true;

            app.activate();
            pageManager.assemble(app).done(function() {

              var view = pageManager.show();

              expect(pageManager.widgets.tocWidget.collection.get("ShowPaperExport__default").get("category")).to.eql("export");

              var spy = sinon.spy();
              var pubsub = app.getService('PubSub').getHardenedInstance();

              pubsub.subscribe(pubsub.NAVIGATE, spy);

              pageManager.widgets.tocWidget.resetActiveStates();

              view.$("a[data-widget-id=ShowPaperExport__default]").click();

              expect(spy.args[0][0]).to.eql("ShowPaperExport");
              expect(spy.args[0][1]["idAttribute"]).to.eql("ShowPaperExport");
              expect(spy.args[0][1]["href"]).to.eql("abs//export");

              pageManager.widgets.ShowPaperExport.setSubView = sinon.spy();

              //should both set the toc nav collection properly, and tell the export widget which view to show
              pageManager.setActive("ShowPaperExport", "default");

              expect(pageManager.widgets.ShowPaperExport.setSubView.calledWith("default")).to.eql(true);
              expect(pageManager.widgets.tocWidget.collection.get("ShowPaperExport__default").get("isSelected")).to.eql(true);
              done();
            })

          })


        });

      });

      it("destroys itself properly", function(done){
        var app = new Application({debug: false});
        delete config.core.objects.Navigator;
        config.widgets.PageManager = 'js/wraps/abstract_page_manager/abstract_page_manager';

        app.loadModules(config).done(function () {

          // hack (normally this will not be the usage pattern)
          app._getWidget("PageManager").done(function(pageManager) {
            app.activate();
            pageManager.assemble(app);

            var view = pageManager.show();

            pageManager.destroy();

            expect(_.isEmpty(pageManager._listeningTo)).to.be.true;

            expect(_.isEmpty(pageManager.widgets)).to.be.true;

            expect(view.isDestroyed).to.be.true;
            done();
          })
        });

      })

    })

  });
