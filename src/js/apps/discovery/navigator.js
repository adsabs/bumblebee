/**
 * The main 'navigation' endpoints (the part executed inside
 * the applicaiton) - this is a companion to the 'router'
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'js/components/navigator',
    'js/components/api_feedback',
    'js/components/api_query_updater',
    'js/components/json_response',
    'js/components/api_query',
    'js/components/api_request',
    'js/components/api_targets',
    'hbs!/404'
  ],

  function (
    $,
    Backbone,
    _,
    Navigator,
    ApiFeedback,
    ApiQueryUpdater,
    JsonResponse,
    ApiQuery,
    ApiRequest,
    ApiTargets,
    ErrorTemplate

    ) {

    "use strict";

    var NavigatorService = Navigator.extend({

      start: function(app) {
        /**
         * These 'transitions' are what happens inside 'discovery' application
         *
         * As a convention, navigation events are all lowercase, and widgets/page managers
         * are CamelCase (for example the table of contents menu on the left side of the
         * abstract/detail page is triggering navigation events using just the name of
         * the widget, e.g. ShowReferences - when References tab was selected)
         *
         */

        var self = this;
        var queryUpdater = new ApiQueryUpdater('navigator');

        var publishFeedback = function(data) {
          self.getPubSub().publish(self.getPubSub().FEEDBACK, new ApiFeedback(data))
        };

        //right now, user navbar widget depends on this to show the correct highlighted pill
        var publishPageChange = function(pageName){
          self.getPubSub().publish(self.getPubSub().PAGE_CHANGE, pageName);
        };

        var searchPageAlwaysVisible = [
          'Results', 'QueryInfo','AuthorFacet', 'DatabaseFacet', 'RefereedFacet',
          'KeywordFacet', 'BibstemFacet', 'BibgroupFacet', 'DataFacet',
          'VizierFacet', 'GrantsFacet', 'GraphTabs', 'QueryDebugInfo',
          'ExportDropdown', 'VisualizationDropdown', 'SearchWidget',
          'Sort', 'BreadcrumbsWidget'
        ];

        var detailsPageAlwaysVisible = [
          'TOCWidget', 'SearchWidget', 'ShowResources', 'ShowRecommender', 'ShowGraphicsSidebar'
        ];

        function redirectIfNotSignedIn(){
          var loggedIn = app.getBeeHive().getObject("User").isLoggedIn();
          if (!loggedIn){
            //redirect to authentication page
            app.getService("Navigator").navigate("authentication-page", {subView : "login"});
            return true;
          }
          else {
            return false;
          }
        };

        this.set('index-page', function() {

          app.getObject('MasterPageManager').show('LandingPage', ["SearchWidget"]);
          this.route = "";
          //order is important
          app.getWidget("LandingPage").done(function(widget) {
            widget.setActive("SearchWidget");
          });

        });

        this.set('SearchWidget', function() {
          self.get('index-page').execute();
        });


        this.set("404", function(){
          $("#body-template-container").html(ErrorTemplate());
          this.route = '#404';
        });


        this.set('ClassicSearchForm', function() {
          app.getObject('MasterPageManager').show('LandingPage', ["ClassicSearchForm"]);
          app.getWidget("LandingPage").done(function(widget){widget.setActive("ClassicSearchForm")});
          this.route = "#classic-form";

        });

        this.set('PaperSearchForm', function() {
          app.getObject('MasterPageManager').show('LandingPage', ['PaperSearchForm']);
          app.getWidget("LandingPage").done(function(widget){widget.setActive("PaperSearchForm");});
          this.route = "#paper-form";
        });


        //request for the widget
        this.set("UserSettings", function(page, data){
          if (redirectIfNotSignedIn())
            return;
          var subView = data.subView || "token";
          //set left hand nav panel correctly and tell the view what to show
          app.getObject('MasterPageManager').show("SettingsPage",
            ['UserSettings', "UserNavbarWidget"]);
          app.getWidget("SettingsPage")
           .done(function(widget) {
             widget.setActive("UserSettings",  subView);
           });

          this.route = "#user/settings/"+subView;
          publishPageChange("settings-page");

        });

        //request for the widget
        this.set("UserPreferences", function(page, data){
          if (redirectIfNotSignedIn())
            return;
          //set left hand nav panel correctly and tell the view what to show
          app.getObject('MasterPageManager').show("SettingsPage",
            ['UserPreferences', "UserNavbarWidget"]);
          app.getWidget("SettingsPage").done(function(widget) {
              widget.setActive("UserPreferences");
            });

          this.route = "#user/settings/preferences";
          publishPageChange("settings-page");

        });

        this.set("AllLibrariesWidget", function(widget, subView){

          var subView = subView || "libraries";
          app.getObject('MasterPageManager').show("LibrariesPage",
            ["AllLibrariesWidget", "UserNavbarWidget"]);
          app.getWidget("AllLibrariesWidget").done(function(widget) {
            widget.setSubView(subView);
          });

          this.route = "#user/libraries/";
          publishPageChange("libraries-page");

        });

        this.set("IndividualLibraryWidget", function(widget, data) {

          var sub = data.sub, id = data.id, publicView = data.publicView || false;
          if (!_.contains(["library", "admin", "metrics", "export", "visualization"], sub)){
            throw new Error("no valid subview provided to individual library widget");
          }

          if ( publicView ){
            app.getWidget("IndividualLibraryWidget").done(function(widget) {
              setSubView({id: id, view: "library", publicView: true});
              //then, show library page manager
              app.getObject('MasterPageManager').show("PublicLibrariesPage",
                ["IndividualLibraryWidget"]);
            });
            this.route = "#/public-libraries/" + id ;
          }
          else {

            app.getWidget("IndividualLibraryWidget").done(function(widget) {
              setSubView({view: sub, id: id});
              app.getObject('MasterPageManager').show("LibrariesPage",
                ["IndividualLibraryWidget", "UserNavbarWidget"]);
              publishPageChange("libraries-page");
            });

            this.route = "#user/libraries/" + id;
          }
        });



        this.set("library-export", function(widget, data){

          if (!(data.bibcodes && data.bibcodes.length || data.id)) {
            throw new Error("neither an identifying id for library nor the bibcodes themselves were provided to export widget");
          }

          app.getWidget("ExportWidget").done(function(exportWidget) {

            //classic is a special case, it opens in a new tab
            if (data.sub == "classic") {
              if (data.bibcodes && data.bibcodes.length) {
                exportWidget.openClassicExports({bibcodes: data.bibcodes});
              }
              else if (data.id) {
                app.getObject("LibraryController").getLibraryData(data.id).done(function (bibcodes) {
                  exportWidget.openClassicExports({currentQuery: bibcodes});
                });
              }
              //show library list view (since there is nothing else to show in this tab
              self.navigate("IndividualLibraryWidget", {sub: "library", id: data.id});
              return;
            }
            // if it was a regular export:

            //first, tell export widget what to show
            if (data.bibcodes && data.bibcodes.length) {

              exportWidget.exportRecords(data.sub, data.bibcodes);
              //then, set library tab to proper field
              app.getWidget("IndividualLibraryWidget").done(function(ilWidget) {
                ilWidget.setSubView({view: "export", publicView: data.publicView});
              });

            }
            //no bibcodes provided (coming from router)
            else if (data.id) {
              app.getObject("LibraryController").getLibraryData(data.id).done(function (bibcodes) {
                bibcodes = bibcodes.documents;
                exportWidget.exportRecords(data.sub, bibcodes);
                //then, set library tab to proper field
                app.getWidget("IndividualLibraryWidget").done(function(ilWidget) {
                  ilWidget.setSubView({
                    view: "export",
                    id: data.id,
                    publicView: data.publicView
                  });
                });
              });
            }

            if (data.publicView) {
              app.getObject('MasterPageManager').show("PublicLibrariesPage",
                ["IndividualLibraryWidget", "ExportWidget"]);
            }
            else {
              //then, show library page manager
              app.getObject('MasterPageManager').show("LibrariesPage",
                ["IndividualLibraryWidget", "UserNavbarWidget", "ExportWidget"]);
              publishPageChange("libraries-page");
            }
          });
        });


        this.set("library-metrics", function(widget, data){

            //first, tell export widget what to show
            if (data.bibcodes && data.bibcodes.length) {

              app.getWidget("Metrics").showMetricsForListOfBibcodes(data.bibcodes);
              //then, set library tab to proper field
              app.getWidget("IndividualLibraryWidget").setSubView({ view : "metrics", publicView : data.publicView });
            }

            else if (data.id){
              app.getObject("LibraryController").getLibraryData(data.id).done(function(bibcodes){
                bibcodes = bibcodes.documents;
                app.getWidget("Metrics").showMetricsForListOfBibcodes(bibcodes);
                //then, set library tab to proper field
                app.getWidget("IndividualLibraryWidget").setSubView({ view : "metrics", id : data.id, publicView : data.publicView });
              });
            }

            else {
              throw new Error("neither an identifying id for library nor the bibcodes themselves were provided to export widget");
              return
            }

            if (data.publicView){
              app.getObject('MasterPageManager').show("PublicLibrariesPage",
                ["IndividualLibraryWidget", "Metrics"]);
            }

            else {
              //then, show library page manager
              app.getObject('MasterPageManager').show("LibrariesPage",
                ["IndividualLibraryWidget", "UserNavbarWidget", "Metrics"]);

              publishPageChange("libraries-page");
            }
        });

        this.set("home-page", function(){
          app.getObject('MasterPageManager').show("HomePage",
            []);
          publishPageChange("home-page");

        });

        this.set('authentication-page', function(page, data){
          var data = data || {},
              subView = data.subView || "login",
              loggedIn = app.getBeeHive().getObject("User").isLoggedIn();

          if (loggedIn){
            //redirect to index
            self.get('index-page').execute();
          }
          else {
            this.route = "#user/account/" + subView;
            app.getObject('MasterPageManager').show("AuthenticationPage",
              ['Authentication']);
            app.getWidget("Authentication").done(function(w) {
              w.setSubView(subView);
            });
          }
        });

        this.set('results-page', function() {

          app.getObject('MasterPageManager').show('SearchPage',
            searchPageAlwaysVisible);
          var q = app.getObject('AppStorage').getCurrentQuery();
          this.route = '#search/' + queryUpdater.clean(q).url();
          publishFeedback({code: ApiFeedback.CODES.UNMAKE_SPACE});
        });

        this.set('export', function(nav, options) {

          var format = options.format || 'bibtex';
          var storage = app.getObject('AppStorage');

          app.getObject('MasterPageManager').show('SearchPage',
            ['ExportWidget'].concat(searchPageAlwaysVisible.slice(1)));

          app.getWidget('ExportWidget').done(function(widget) {

            //classic is a special case, it opens in a new tab
            if (format == "classic") {
              if (options.onlySelected && storage.hasSelectedPapers()) {
                widget.openClassicExports({bibcodes: storage.getSelectedPapers()});
              }
              else {
                widget.openClassicExports({currentQuery: storage.getCurrentQuery()});
              }
              return;
            }

            //first, open central panel
            publishFeedback({code: ApiFeedback.CODES.MAKE_SPACE});

            // is a special case, it opens in a new tab
            if (options.onlySelected && storage.hasSelectedPapers()) {
              widget.exportRecords(format, storage.getSelectedPapers());
            }
            //all records specifically requested
            else if (options.onlySelected === false && storage.hasCurrentQuery()) {
              widget.exportQuery({
                format: format,
                currentQuery: storage.getCurrentQuery(),
                numFound: storage.get("numFound")
              });
            }
            // no request for selected or not selected, show selected
            else if (options.onlySelected === undefined && storage.hasSelectedPapers()) {
              widget.exportRecords(format, storage.getSelectedPapers());
            }
            //no selected, show all papers
            else if (storage.hasCurrentQuery()) {
              widget.exportQuery({
                format: format,
                currentQuery: storage.getCurrentQuery(),
                numFound: storage.get("numFound")
              });
            }
            else {
              var alerts = app.getController('AlertsController');
              alerts.alert({msg: 'There are no records to export yet (please search or select some)'});
              this.get('results-page')();
              return;
            }
          });

        });

        this.set('export-query', function() {
          var api = app.getService('Api');
          var q = app.getObject('AppStorage').getCurrentQuery();
          var alerter = app.getController('AlertsController');

          // TODO: modify filters (move them to the main q)
          q = new ApiQuery({query: q.url()});

          //save the query / obtain query id
          api.request(new ApiRequest({
            query: q,
            target: ApiTargets.MYADS_STORAGE + '/query',
            options: {
              done: function(){},
              type: 'POST',
              xhrFields: {
                withCredentials: false
              }
            }
          }))
            .done(function(data) {
              alerter.alert(new ApiFeedback({
                code: ApiFeedback.CODES.ALERT,
                msg: 'The query has been saved. You can insert the following snippet in a webpage: <br/>' + '<img src="' + ApiTargets.MYADS_STORAGE + '/query2svg/' + data.qid + '"></img><br/>' +
                  '<br/><textarea rows="10" cols="50">' +
                  '<a href="' + location.protocol + '//' + location.host + location.pathname +
                  '#execute-query/' + data.qid + '"><img src="' + ApiTargets.MYADS_STORAGE + '/query2svg/' + data.qid + '"></img>' +
                  '</a>' +
                  '</textarea>'
                ,
                modal: true
              }));
            });
        });

        this.set('execute-query', function(endPoint, queryId) {
          var api = app.getService('Api');
          api.request(new ApiRequest({
            target: ApiTargets.MYADS_STORAGE + '/query/' + queryId,
            options: {
              done: function(data){
                var q = new ApiQuery().load(JSON.parse(data.query).query);
                self.pubsub.publish(self.pubSubKey, self.pubsub.START_SEARCH, q);
              },
              fail: function() {
                var alerter = app.getController('AlertsController');
                alerter.alert(new ApiFeedback({
                  code: ApiFeedback.CODES.ERROR,
                  msg: 'The query with the given UUID cannot be found'
                }));
                self.get('index-page').execute();
              },
              type: 'GET',
              xhrFields: {
                withCredentials: false
              }
            }
          }))
        });

        this.set('orcid-page', function(view, targetRoute) {

          var orcidApi = app.getService('OrcidApi');
          // traffic from Orcid - user has authorized our access
          if (orcidApi.hasExchangeCode() && !orcidApi.hasAccess()) {
            orcidApi.getAccessData(orcidApi.getExchangeCode())
              .done(function(data) {
                orcidApi.saveAccessData(data);
                self.pubsub.publish(self.pubSubKey, self.pubsub.APP_EXIT, {url: window.location.pathname +
                  ((targetRoute && _.isString(targetRoute)) ? targetRoute : window.location.hash)});
              })
              .fail(function() {
                console.warn('Unsuccessful login to ORCID');
                self.get('index-page').execute();
                var alerter = app.getController('AlertsController');
                alerter.alert(new ApiFeedback({
                  code: ApiFeedback.CODES.ALERT,
                  msg: 'Error getting OAuth code to access ORCID',
                  modal: true
                }));
              });
            return;
          }

          this.route = '#user/orcid';

          if (app.hasWidget('OrcidBigWidget')) {
            app.getWidget('OrcidBigWidget').done(function (orcidWidget) {
              app.getObject('MasterPageManager').show('SearchPage',
                ['OrcidBigWidget', 'SearchWidget']);
            });
          }
          else {
            self.pubsub.publish(self.pubSubKey, self.pubsub.NAVIGATE, 'index-page');
          }
        });

        this.set('show-author-network', function() {
          publishFeedback({code: ApiFeedback.CODES.MAKE_SPACE});
          app.getObject('MasterPageManager').show('SearchPage',
            ['AuthorNetwork'].concat(searchPageAlwaysVisible.slice(1)));
        });
        this.set('show-wordcloud', function() {
          publishFeedback({code: ApiFeedback.CODES.MAKE_SPACE});
          app.getObject('MasterPageManager').show('SearchPage',
            ['WordCloud'].concat(searchPageAlwaysVisible.slice(1)));

        });
        this.set('show-paper-network', function() {
          publishFeedback({code: ApiFeedback.CODES.MAKE_SPACE});
          app.getObject('MasterPageManager').show('SearchPage',
            ['PaperNetwork'].concat(searchPageAlwaysVisible.slice(1)));
        });

        this.set('show-bubble-chart', function() {
          publishFeedback({code: ApiFeedback.CODES.MAKE_SPACE});
          app.getObject('MasterPageManager').show('SearchPage',
            ['BubbleChart'].concat(searchPageAlwaysVisible.slice(1)));
        });
        this.set('show-metrics', function() {
          publishFeedback({code: ApiFeedback.CODES.MAKE_SPACE});

          app.getObject('MasterPageManager').show('SearchPage',
            ['Metrics'].concat(searchPageAlwaysVisible.slice(1)));
          app.getWidget("Metrics").done(function(w) {
            w.showMetricsForCurrentQuery();
          });

        });
        this.set("visualization-closed", this.get("results-page"));


        var showDetail = function(pages, toActivate) {
          app.getObject('MasterPageManager').show('DetailsPage',
            pages);
          app.getWidget("DetailsPage").done(function(w) {
            w.setActive(toActivate);
          });
        };

        this.set('ShowAbstract', function(id, data){
          showDetail([id].concat(detailsPageAlwaysVisible), id);
          this.route = data.href;
        });
        this.set('ShowCitations', function(id, data) {
          showDetail([id].concat(detailsPageAlwaysVisible), id);
          this.route = data.href;
        });
        this.set('ShowReferences', function(id, data ) {
          showDetail([id].concat(detailsPageAlwaysVisible), id);
          this.route = data.href;
        });
        this.set('ShowCoreads', function(id, data) {
          showDetail([id].concat(detailsPageAlwaysVisible), id);
          this.route = data.href;
        });
        this.set('ShowTableOfContents', function(id, data) {
          showDetail([id].concat(detailsPageAlwaysVisible), id);
          this.route = data.href;
        });
        this.set('ShowSimilar', function(id, data) {
          showDetail([id].concat(detailsPageAlwaysVisible), id);
          this.route = data.href;
        });
        this.set('ShowPaperMetrics', function(id, data) {
          showDetail([id].concat(detailsPageAlwaysVisible), id);
        });
        this.set("ShowPaperExport", function(id, data){
          var format = data.subView;
          app.getObject('MasterPageManager').show('DetailsPage',
            [id].concat(detailsPageAlwaysVisible));
          app.getWidget("DetailsPage").done(function(w) {
            w.setActive(id, format);
          });
        });
        this.set('ShowGraphics', function(id, data) {
          showDetail([id].concat(detailsPageAlwaysVisible), id);
        });
      }


    });

    return NavigatorService;

  });
