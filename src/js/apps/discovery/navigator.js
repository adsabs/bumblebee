/**
* The main 'navigation' endpoints (the part executed inside
* the application) - this is a companion to the 'router'
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
  'hbs!404',
  'hbs!js/apps/discovery/templates/orcid-modal-template'
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
  ErrorTemplate,
  OrcidModalTemplate

) {
  var NavigatorService = Navigator.extend({

    start: function (app) {
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

      var publishFeedback = function (data) {
        self.getPubSub().publish(self.getPubSub().FEEDBACK, new ApiFeedback(data));
      };

        // right now, user navbar widget depends on this to show the correct highlighted pill
      var publishPageChange = function (pageName) {
        self.getPubSub().publish(self.getPubSub().PAGE_CHANGE, pageName);
      };

      var searchPageAlwaysVisible = [
        'Results', 'QueryInfo', 'AffiliationFacet', 'AuthorFacet', 'DatabaseFacet', 'RefereedFacet',
        'KeywordFacet', 'BibstemFacet', 'BibgroupFacet', 'DataFacet', 'ObjectFacet',
        'NedObjectFacet', 'VizierFacet', 'GraphTabs', 'QueryDebugInfo',
        'ExportDropdown', 'VisualizationDropdown', 'SearchWidget',
        'Sort', 'BreadcrumbsWidget', 'PubtypeFacet', 'OrcidSelector'
      ];

      var detailsPageAlwaysVisible = [
        'TOCWidget', 'SearchWidget', 'ShowResources', 'ShowAssociated', 'ShowGraphicsSidebar', 'ShowLibraryAdd',
        'MetaTagsWidget'
      ];

      function redirectIfNotSignedIn() {
        var loggedIn = app.getBeeHive().getObject('User').isLoggedIn();
        if (!loggedIn) {
          // redirect to authentication page
          app.getService('Navigator').navigate('authentication-page', { subView: 'login' });
          return true;
        }
        return false;
      }

      this.set('index-page', async function () {
        var self = this;
        app.getObject('MasterPageManager').show('LandingPage', ['SearchWidget']).then(
          function() {
            return app.getWidget('LandingPage').then(function (widget) {
              widget.setActive('SearchWidget');
              self.route = '';
            });
          }
        )
      });

      this.set('SearchWidget', async function () {
        // you must set a route within the function, even if you are calling
        // another function that sets a route
        this.route = '';
        return self.get('index-page').execute();
      });

      this.set('404', async function () {
        return app.getObject('MasterPageManager').show('ErrorPage');
      });


      this.set('ClassicSearchForm', async function () {
        app.getObject('MasterPageManager').show('LandingPage', ['ClassicSearchForm']).then(function() {
          app.getWidget('LandingPage').done(function (widget) { widget.setActive('ClassicSearchForm'); });
          self.route = '#classic-form';
        })
      });

      this.set('PaperSearchForm', async function () {
        app.getObject('MasterPageManager').show('LandingPage', ['PaperSearchForm']).then(function() {
          app.getWidget('LandingPage').done(function (widget) { widget.setActive('PaperSearchForm'); });
          self.route = '#paper-form';
        })
      });

      this.set('LibraryImport', async function (page, data) {
        if (redirectIfNotSignedIn()) return;
        await app.getObject('MasterPageManager').show('SettingsPage',
          ['LibraryImport', 'UserNavbarWidget']);

        app.getWidget('SettingsPage')
          .done(function (widget) {
            widget.setActive('LibraryImport');
          });

        self.route = '#user/settings/libraryimport';
        publishPageChange('settings-page');
      });


      function settingsPreferencesView(widgetName, defaultView) {
        return async function (page, data) {
          if (redirectIfNotSignedIn()) return;

          var subView = data.subView || defaultView;
          if (!subView) {
            console.error('no subview or default view provided /'
                + 'to the navigator function!');
          }

          await app.getObject('MasterPageManager').show('SettingsPage',
            [widgetName, 'UserNavbarWidget']);

          app.getWidget('SettingsPage').done(function (widget) {
            widget.setActive(widgetName, subView);
          });

          self.route = '#user/settings/' + subView;
          publishPageChange('settings-page');
        };
      }

      // request for the widget
      this.set('UserSettings', settingsPreferencesView('UserSettings', undefined));

      // request for the widget
      this.set('UserPreferences', settingsPreferencesView('UserPreferences', 'librarylink'));

      this.set('AllLibrariesWidget', async function (widget, subView) {
        if (redirectIfNotSignedIn()) return;

        var subView = subView || 'libraries';
        await app.getObject('MasterPageManager').show('LibrariesPage',
          ['AllLibrariesWidget', 'UserNavbarWidget']);
        app.getWidget('AllLibrariesWidget').done(function (widget) {
          widget.setSubView({ view: subView });
          self.route = '#user/libraries/';
          publishPageChange('libraries-page');
        });

      });

      this.set('LibraryAdminView', async function (widget) {
        // this is NOT navigable from outside, so library already has data
        // only setting a nav event to hide previous widgets
        app.getWidget('IndividualLibraryWidget').done(async function (widget) {
          widget.setSubView({ subView: 'admin' });
          await app.getObject('MasterPageManager').show('LibrariesPage',
            ['IndividualLibraryWidget', 'UserNavbarWidget']);
          publishPageChange('libraries-page');
        });
      });

      this.set('IndividualLibraryWidget', async function (widget, data) {
        // where view is an object in the form
        // {subView: subView, id: id, publicView : false}

        data.publicView = data.publicView ? data.publicView : false;

        self.route = data.publicView ? '#/public-libraries/' + data.id : '#user/libraries/' + data.id;

        app.getObject('LibraryController').getLibraryMetadata(data.id).done(function (metadata) {
          data.editRecords = _.contains(['write', 'admin', 'owner'], metadata.permission)
                                  && !data.publicView;
          // inform library list widget about the data
          app.getWidget('LibraryListWidget').done(function (widget) {
            widget.setData(data);

            if (data.publicView) {
              app.getWidget('IndividualLibraryWidget').done(async function (widget) {
                widget.setSubView(data);
                // then, show library page manager
                await app.getObject('MasterPageManager').show('PublicLibrariesPage',
                  ['IndividualLibraryWidget', 'LibraryListWidget']);
              });
            }
            // make sure user is signed in
            else if (!redirectIfNotSignedIn()) {
              app.getWidget('IndividualLibraryWidget').done(async function (widget) {
                widget.setSubView(data);
                await app.getObject('MasterPageManager').show('LibrariesPage',
                  ['IndividualLibraryWidget', 'LibraryListWidget', 'UserNavbarWidget']);
                publishPageChange('libraries-page');
              });
            }
          });
        });
      });

      // for external widgets shown by library
      async function navToLibrarySubView(widget, data) {
        var that = this;

        // actual name of widget to be shown in main area
        var widgetName = data.widgetName;
        // additional info that the renderWidgetForListOfBibcodes function might need (only used by export right now)
        var additional = data.additional;
        var format = additional.format || 'bibtex';
        // tab description for library widget
        var subView = data.subView;
        // id of library being shown
        var id = data.id;
        var publicView = data.publicView;
        // Author-affiliation has a specific widget
        if (widgetName === 'ExportWidget' && format === 'authoraff') {
          widgetName = 'AuthorAffiliationTool';
        }

        // clear current data
        await app.getWidget(widgetName).done(function (widget) {
          if (widget.reset) widget.reset();
          else if (widget.resetWidget) widget.resetWidget();
        });

        // just stick the empty views in there, otherwise the interface lags as the lib controller
        // paginates through the library bibcodes
        if (!(widgetName === 'ExportWidget' && format === 'classic')) { // export to classic opens a new tab, nothing to update here
          if (publicView) {
            await app.getObject('MasterPageManager').show('PublicLibrariesPage',
              ['IndividualLibraryWidget', widgetName]);
            self.route = '#/public-libraries/' + data.id;
          } else {
            await app.getObject('MasterPageManager').show('LibrariesPage',
              ['IndividualLibraryWidget', 'UserNavbarWidget', widgetName]);
            self.route = '#user/libraries/' + data.id;
            publishPageChange('libraries-page');
          }
        }

        function renderLibrarySub(id) {
          app.getObject('LibraryController')
            .getLibraryBibcodes(id)
            .done(function (bibcodes) {
              if (widgetName === 'ExportWidget' && format === 'classic') {
                app.getWidget(widgetName).done(function (widget) {
                  widget.openClassicExports({ bibcodes: bibcodes, libid: data.id });
                });
              } else {
                app.getWidget(widgetName).done(function (widget) {
                  widget.renderWidgetForListOfBibcodes(bibcodes, additional);
                });
                app.getWidget('IndividualLibraryWidget').done(function (widget) {
                  widget.setSubView({ subView: subView, publicView: publicView, id: id });
                });
              }
            });
        }

        renderLibrarySub(id);
      } // end navToLibrarySubview


      this.set('library-export', navToLibrarySubView);
      this.set('library-visualization', navToLibrarySubView);
      this.set('library-metrics', navToLibrarySubView);
      this.set('library-citation_helper', navToLibrarySubView);

      this.set('home-page', async function () {
        await app.getObject('MasterPageManager').show('HomePage',
          []);
        publishPageChange('home-page');
      });

      this.set('authentication-page', async function (page, data) {
        var data = data || {},
          subView = data.subView || 'login',
          loggedIn = app.getBeeHive().getObject('User').isLoggedIn();

        if (loggedIn) {
          // redirect to index
          await self.get('index-page').execute();
        } else {
          this.route = '#user/account/' + subView;
          await app.getObject('MasterPageManager').show('AuthenticationPage',
            ['Authentication']);
          app.getWidget('Authentication').done(function (w) {
            w.setSubView(subView);
          });
        }
      });

      this.set('results-page', function (widget, args) {
        var self = this;
        var defer = $.Deferred();

        app.getObject('MasterPageManager').show('SearchPage',
          searchPageAlwaysVisible).done(function() {
            // allowing widgets to override appstorage query (so far only used for orcid redirect)
            // XXX:rca - not sure I understand why
            var q = app.getObject('AppStorage').getCurrentQuery();
            if (q && q.get('__original_url')) {
              var route = '#search/' + q.get('__original_url');
              q.unset('__original_url');
            } else {
              var route = '#search/' + queryUpdater.clean(q).url();
            }

            // XXX:rca why here and not inside mediator???
            // update the pagination of the results widget
            if (q instanceof ApiQuery) {
              var update = {};
              var par = function (str) {
                if (_.isString(str)) {
                  try {
                    return parseInt(str);
                  } catch (e) {
                    // do nothing
                  }
                }
                return false;
              };

              if (q.has('p_')) {
                var page = par(q.get('p_')[0]);
                update.page = page;
              } else {
                route += '&p_=0';
              }

              if (!_.isEmpty(update)) {
                app.getWidget('Results').then(function (w) {
                  if (_.isFunction(w.updatePagination)) {
                    w.updatePagination(update);
                  }
                });
              }
            }

            // taking care of inserting bigquery key here, not sure if right place
            // clean(q) above got rid of qid key, reinsert it
            if (q && q.get('__qid')) {
              route += ('&__qid=' + q.get('__qid')[0]);
            }

            self.route = route;
            publishFeedback({ code: ApiFeedback.CODES.UNMAKE_SPACE });
            defer.resolve();
          })
          return defer.promise();
      });

      this.set('export', function (nav, options) {
        var format = options.format || 'bibtex';
        var storage = app.getObject('AppStorage');

        app.getObject('MasterPageManager').show('SearchPage',
          ['ExportWidget'].concat(searchPageAlwaysVisible.slice(1)));

        app.getWidget('ExportWidget').done(function (widget) {
          // classic is a special case, it opens in a new tab
          if (format === 'classic') {
            if (options.onlySelected && storage.hasSelectedPapers()) {
              widget.openClassicExports({ bibcodes: storage.getSelectedPapers() });
            } else {
              widget.openClassicExports({ currentQuery: storage.getCurrentQuery() });
            }
            return;
          } if (format === 'authoraff') {
            if (options.onlySelected && storage.hasSelectedPapers()) {
              widget.getAuthorAffForm({ bibcodes: storage.getSelectedPapers() });
            } else {
              widget.getAuthorAffForm({ currentQuery: storage.getCurrentQuery() });
            }
            return;
          }

          // first, open central panel
          publishFeedback({ code: ApiFeedback.CODES.MAKE_SPACE });

          // is a special case, it opens in a new tab
          if (options.onlySelected && storage.hasSelectedPapers()) {
            widget.renderWidgetForListOfBibcodes(storage.getSelectedPapers(), { format: format });
          }
          // all records specifically requested
          else if (options.onlySelected === false && storage.hasCurrentQuery()) {
            widget.renderWidgetForCurrentQuery({
              format: format,
              currentQuery: storage.getCurrentQuery(),
              numFound: storage.get('numFound')
            });
          }
          // no request for selected or not selected, show selected
          else if (options.onlySelected === undefined && storage.hasSelectedPapers()) {
            widget.renderWidgetForListOfBibcodes(storage.getSelectedPapers(), { format: format });
          }
          // no selected, show all papers
          else if (storage.hasCurrentQuery()) {
            widget.exportQuery({
              format: format,
              currentQuery: storage.getCurrentQuery(),
              numFound: storage.get('numFound')
            });
          } else {
            var alerts = app.getController('AlertsController');
            alerts.alert({ msg: 'There are no records to export yet (please search or select some)' });
            this.get('results-page')();
          }
        });
      });

      this.set('export-query', function () {
        var api = app.getService('Api');
        var q = app.getObject('AppStorage').getCurrentQuery();
        var alerter = app.getController('AlertsController');

        // TODO: modify filters (move them to the main q)
        q = new ApiQuery({ query: q.url() });

        // save the query / obtain query id
        api.request(new ApiRequest({
          query: q,
          target: ApiTargets.MYADS_STORAGE + '/query',
          options: {
            done: function () {},
            type: 'POST',
            xhrFields: {
              withCredentials: false
            }
          }
        }))
          .done(function (data) {
            alerter.alert(new ApiFeedback({
              code: ApiFeedback.CODES.ALERT,
              msg: 'The query has been saved. You can insert the following snippet in a webpage: <br/>' + '<img src="' + ApiTargets.MYADS_STORAGE + '/query2svg/' + data.qid + '"></img><br/>'
                  + '<br/><textarea rows="10" cols="50">'
                  + '<a href="' + location.protocol + '//' + location.host + location.pathname
                  + '#execute-query/' + data.qid + '"><img src="' + ApiTargets.MYADS_STORAGE + '/query2svg/' + data.qid + '"></img>'
                  + '</a>'
                  + '</textarea>',
              modal: true
            }));
          });
      });

      this.set('search-page', function (endPoint, data) {
        
        var possibleSearchSubPages = ['Metrics', 'AuthorNetwork', 'PaperNetwork',
        'ConceptCloud', 'BubbleChart'];

        var widgetName, pages;

        // convention is that a navigate command for search page widget starts with "show-"
        // waits for the navigate to results page emitted by the discovery_mediator
        // once the solr search has been received
        if (data.page)
          widgetName = _.map(data.page.split('-').slice(1), function (w) { return w[0].toUpperCase() + w.slice(1); }).join('');
        

        if (widgetName && possibleSearchSubPages.indexOf(widgetName) > -1) {
          pages = [widgetName].concat(searchPageAlwaysVisible.slice(1));
        }
        else {
          console.error('Results page subpage not recognized:', widgetName);
          pages = searchPageAlwaysVisible;
        }


        showResultsPage(pages).then(function() {
          self.getPubSub().publish(self.getPubSub().START_SEARCH, data.q);
        })
        
      });

      this.set('execute-query', function (endPoint, queryId) {
        var api = app.getService('Api');
        api.request(new ApiRequest({
          target: ApiTargets.MYADS_STORAGE + '/query/' + queryId,
          options: {
            done: function (data) {
              var q = new ApiQuery().load(JSON.parse(data.query).query);
              self.getPubSub().publish(self.getPubSub().START_SEARCH, q);
            },
            fail: function () {
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
        }));
      });

      this.set('user-action', async function(subRoute, data) {
        var failMessage,
        failTitle,
        route,
        done;
      
        function fail(jqXHR, status, errorThrown) {
          self.get('index-page').execute().then(function() {
            var error = (jqXHR.responseJSON && jqXHR.responseJSON.error) ? jqXHR.responseJSON.error : 'error unknown';
            // call alerts widget
            this.getPubSub().publish(this.getPubSub().ALERT, new ApiFeedback({
              code: 0, title: failTitle, msg: ' <b>' + error + '</b> <br/>' + failMessage, modal: true, type: 'danger'
            }));
          })
        }
        

        if (data.subView === 'register') {
          failTitle = 'Registration failed.';
          failMessage = '<p>Please try again, or contact <b> adshelp@cfa.harvard.edu for support </b></p>';
          route = ApiTargets.VERIFY + '/' + token;

          done = function (reply) {
            // user has been logged in already by server
            // request bootstrap
            self.getApiAccess({ reconnect: true }).done(function () {
              self.get('index-page').execute().then(function() {
                var msg = '<p>You have been successfully registered with the username</p> <p><b>' + reply.email + '</b></p>';
                self.getPubSub().publish(self.getPubSub().ALERT, new ApiFeedback({
                  code: 0, title: 'Welcome to ADS', msg: msg, modal: true, type: 'success'
                }));
              })
            }).fail(function() {
              this.apply(fail, arguments);
            });
          };
        } else if (subView === 'change-email') {
          failTitle = 'Attempt to change email failed';
          failMessage = 'Please try again, or contact adshelp@cfa.harvard.edu for support';
          route = ApiTargets.VERIFY + '/' + token;

          done = function (reply) {
            // user has been logged in already
            // request bootstrap
            this.getApiAccess({ reconnect: true }).done(function () {
                self.get('index-page').execute().then(function() {
                var msg = 'Your new ADS email is <b>' + reply.email + '</b>';
                self.getPubSub().publish(self.getPubSub().ALERT, new ApiFeedback({
                  code: 0, title: 'Email has been changed.', msg: msg, modal: true, type: 'success'
                }));
              })
            }).fail(function () {
              this.apply(fail, arguments);
            });
          };
        } else if (subView === 'reset-password') {
          done = function () {
            // route to reset-password-2 form
            // set the token so that session can use it in the put request with the new password
            self.getBeeHive().getObject('Session').setChangeToken(token);
            self.getPubSub().publish(self.getPubSub().NAVIGATE, 'authentication-page', { subView: 'reset-password-2' });
          };

          failMessage = 'Reset password token was invalid.';
          route = ApiTargets.RESET_PASSWORD + '/' + token;
          type = 'GET';
        }
        

        var request = new ApiRequest({
          target: route,
          options: {
            type: type || 'GET',
            context: self,
            done: done,
            fail: fail
          }
        });

        self.getBeeHive().getService('Api').request(request);
        
      });

      this.set('orcid-instructions', function () {
        this.route = '#orcid-instructions';
        app.getObject('MasterPageManager').show('OrcidInstructionsPage');
      });

      this.set('orcid-page', function (view, targetRoute) {
        var orcidApi = app.getService('OrcidApi');
        var persistentStorage = app.getService('PersistentStorage');
        var appStorage = app.getObject('AppStorage');
        var user = app.getObject('User');

        // traffic from Orcid - user has authorized our access
        if (!orcidApi.hasAccess() && orcidApi.hasExchangeCode()) {
          // since app will exit, store the information that we're authenticating
          if (persistentStorage) {
            persistentStorage.set('orcidAuthenticating', true);
          } else {
            console.warn('no persistent storage service available');
          }
          orcidApi.getAccessData(orcidApi.getExchangeCode())
            .done(function (data) {
              orcidApi.saveAccessData(data);
              user.setOrcidMode(true);
              self.getPubSub().publish(self.getPubSub().APP_EXIT, {
                url: window.location.pathname
                    + ((targetRoute && _.isString(targetRoute)) ? targetRoute : window.location.hash)
              });
            })
            .fail(function () {
              user.setOrcidMode(false);
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

        if (orcidApi.hasAccess()) {
          if (persistentStorage.get('orcidAuthenticating')) {
            persistentStorage.remove('orcidAuthenticating');
            // check if we need to trigger modal alert to ask user to fill in necessary data
            // we only want to show this immediately after user has authenticated with orcid
            orcidApi.getADSUserData().done(function (data) {
              // don't show modal if we're just going to redirect to the ads-orcid form anyway
              if (!data.hasOwnProperty('authorizedUser') && JSON.stringify(appStorage.get('stashedNav')) !== '["UserPreferences",{"subView":"orcid"}]') {
                // the form has yet to be filled out by the user
                // now tailor the message depending on whether they are signed in to ADS or not
                var alerter = app.getController('AlertsController');
                alerter.alert(new ApiFeedback({
                  code: ApiFeedback.CODES.ALERT,
                  msg: OrcidModalTemplate({ adsLoggedIn: app.getObject('User').isLoggedIn() }),
                  type: 'success',
                  title: 'You are now logged in to ORCID',
                  modal: true
                }));
              }// end check if user has already provided data
            })
              .fail(function (error) {
                console.warn(error);
              });
          }

          // go to the orcidbigwidget
          this.route = '#user/orcid';
          app.getObject('MasterPageManager').show('OrcidPage',
            ['OrcidBigWidget', 'SearchWidget']);
        } else {
          // just redirect to index page, no orcid access
          this.route = '';
          self.get('index-page').execute();
        }
      });

      /*
        * functions for showing "explore" widgets on results page
        * */

      function showResultsPageWidgetWithUniqueUrl(command, options) {
        var q = app.getObject('AppStorage').getCurrentQuery();
        publishFeedback({ code: ApiFeedback.CODES.MAKE_SPACE });
        var widgetName = _.map(command.split('-').slice(1), function (w) { return w[0].toUpperCase() + w.slice(1); }).join('');
        app.getObject('MasterPageManager').show('SearchPage',
          [widgetName].concat(searchPageAlwaysVisible.slice(1)));
        this.route = '#search/' + queryUpdater.clean(q.clone()).url()
                        + '/' + command.split('-').slice(1).join('-');

        // show selected, need to explicitly tell widget to show bibcodes
        if (options && options.onlySelected) {
          app.getWidget(widgetName).done(function (w) {
            var selected = app.getObject('AppStorage').getSelectedPapers();
            w.renderWidgetForListOfBibcodes(selected);
          });
        } else {
          app.getWidget(widgetName).done(function (w) {
            w.renderWidgetForCurrentQuery({
              currentQuery: q
            });
          });
        }
      }

      this.set('show-author-network', function (command, options) {
        showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });

      this.set('show-concept-cloud', function (command, options) {
        showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });

      this.set('show-paper-network', function (command, options) {
        showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });

      this.set('show-bubble-chart', function (command, options) {
        showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });
      this.set('show-metrics', function (command, options) {
        showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });

      this.set('visualization-closed', this.get('results-page'));

      var showResultsPage = async function (pages, toActivate) {
        return app.getObject('MasterPageManager').show('SearchPage',
          pages)
      };

      /*
        * Below are functions for abstract pages
        */

      var showDetail = async function (pages, toActivate) {
        return app.getObject('MasterPageManager').show('DetailsPage',
          pages).then(function() {
            return app.getWidget('DetailsPage').then(function (w) {
              w.setActive(toActivate);
            });
          })
      };
      
      this.set('verify-abstract', async function() {
        // check we are using the canonical bibcode and redirect to it if necessary
          var q,
          req,
          self;
        self = this;
        q = new ApiQuery({ q: 'identifier:' + this.queryUpdater.quoteIfNecessary(bibcode), fl: 'bibcode' });
        req = new ApiRequest({
          query: q,
          target: ApiTargets.SEARCH,
          options: {
            done: function (resp) {
              var navigateString,
                href;

              if (!subPage) {
                navigateString = 'ShowAbstract';
              } else {
                navigateString = 'Show' + subPage[0].toUpperCase() + subPage.slice(1);
                href = '#abs/' + bibcode + '/' + subPage;
              }
              self.routerNavigate(navigateString, { href: href });

              if (resp.response && resp.response.docs && resp.response.docs[0]) {
                bibcode = resp.response.docs[0].bibcode;
                self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + bibcode }));
              } else if (resp.response && resp.response.docs && !resp.response.docs.length) {
                console.error('the query  ' + q.get('q')[0] + '  did not return any bibcodes');
              }
            },
            fail: function () {
              console.log('Cannot identify page to load, bibcode: ' + bibcode);
              self.getPubSub().publish(this.getPubSub().NAVIGATE, 'index-page');
            }
          }
        });

        this.getPubSub().publish(this.getPubSub().EXECUTE_REQUEST, req);
      });

      this.set('ShowAbstract', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('ShowCitations', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('ShowReferences', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('ShowCoreads', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('ShowTableofcontents', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('ShowSimilar', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('ShowMetrics', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('ShowPaperExport', async function (id, data) {
        var format = data.subView;
        app.getObject('MasterPageManager').show('DetailsPage',
          [id].concat(detailsPageAlwaysVisible)).done(function() {
            app.getWidget('DetailsPage').done(function (w) {
              w.setActive(id, format);
            });
          })
      });
      this.set('ShowGraphics', async function (id, data) {
        await showDetail([id].concat(detailsPageAlwaysVisible), id);
        if (data.bibcode) // new search
          self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({ q: 'bibcode:' + data.bibcode }))
        this.route = data.href;
      });
      this.set('show-author-affiliation-tool', async function (id, options) {
        var q = app.getObject('AppStorage').getCurrentQuery();
        app.getObject('MasterPageManager').show('SearchPage', [
          'AuthorAffiliationTool'
        ].concat(searchPageAlwaysVisible.slice(1)));
        this.route = '#search/' + queryUpdater.clean(q).url();
        app.getWidget('AuthorAffiliationTool').done(function (w) {
          if (options && options.onlySelected) {
            var selected = app.getObject('AppStorage').getSelectedPapers();
            w.renderWidgetForListOfBibcodes(selected);
          } else {
            w.renderWidgetForCurrentQuery({ currentQuery: q });
          }
        });
        publishFeedback({ code: ApiFeedback.CODES.MAKE_SPACE });
      });
    }
  });

  return NavigatorService;
});
