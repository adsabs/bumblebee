/**
 * Widget to display list of result hits - it allows to paginate through them
 * and display details
 *
 */

define([
  'js/widgets/list_of_things/widget',
  'js/widgets/abstract/widget',
  'js/mixins/add_stable_index_to_collection',
  'js/mixins/link_generator_mixin',
  'js/mixins/formatter',
  'hbs!js/widgets/results/templates/container-template',
  'js/mixins/papers_utils',
  'js/mixins/expose_metadata',
  'js/modules/orcid/extension',
  'js/mixins/dependon',
  'js/components/api_feedback',
], function(
  ListOfThingsWidget,
  AbstractWidget,
  PaginationMixin,
  LinkGenerator,
  Formatter,
  ContainerTemplate,
  PapersUtilsMixin,
  MetadataMixin,
  OrcidExtension,
  Dependon,
  ApiFeedback
) {
  var ResultsWidget = ListOfThingsWidget.extend({
    initialize: function() {
      ListOfThingsWidget.prototype.initialize.apply(this, arguments);
      // now adjusting the List Model
      this.view.template = ContainerTemplate;

      this.view.model.defaults = function() {
        return {
          mainResults: true,
          title: undefined,
          // assuming there will always be abstracts
          showAbstract: 'closed',
          showSidebars: true,
          showCheckboxes: true,
          // often they won't exist
          showHighlights: 'closed',
          pagination: true,
        };
      };
      this.model.set(this.model.defaults(), { silent: true });

      // also need to add an event listener for the "toggle all" action
      this.view.toggleAll = function(e) {
        var flag = e.target.checked ? 'add' : 'remove';
        this.trigger('toggle-all', flag);
      };

      _.extend(this.view.events, {
        'click input#select-all-docs': 'toggleAll',
      });

      this.view.resultsWidget = true;
      this.view.delegateEvents();
      // this must come after the event delegation!
      this.listenTo(this.collection, 'reset', this.checkDetails);
      // finally, listen
      // to this event on the view
      this.listenTo(this.view, 'toggle-all', this.triggerBulkAction);
      this.minAuthorsPerResult = 3;

      this.model.on(
        'change:showSidebars',
        _.bind(this._onToggleSidebars, this)
      );

      // update the default fields with whatever the abstract page needs
      var abstractFields = AbstractWidget.prototype.defaultQueryArguments.fl.split(
        ','
      );
      var resultsFields = this.defaultQueryArguments.fl.split(',');
      resultsFields = _.union(abstractFields, resultsFields);

      // remove 'aff' if in list
      const affIdx = resultsFields.indexOf('aff');
      if (affIdx > -1) {
        resultsFields.splice(affIdx, 1);
      }
      this.defaultQueryArguments.fl = resultsFields.join(',');
      this.on('page-manager-message', _.bind(this.onPageManagerMessage, this));
    },

    defaultQueryArguments: {
      fl:
        'title,abstract,bibcode,author,keyword,id,links_data,property,esources,data,citation_count,citation_count_norm,[citations],pub,email,volume,pubdate,doi,doctype,identifier',
      rows: 25,
      start: 0,
    },

    activate: function(beehive) {
      ListOfThingsWidget.prototype.activate.apply(
        this,
        [].slice.apply(arguments)
      );
      var pubsub = beehive.getService('PubSub');
      _.bindAll(
        this,
        'dispatchRequest',
        'processResponse',
        'onUserAnnouncement',
        'onStoragePaperUpdate',
        'onCustomEvent',
        'onStartSearch'
      );
      pubsub.subscribe(pubsub.INVITING_REQUEST, this.dispatchRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.onUserAnnouncement);
      pubsub.subscribe(pubsub.STORAGE_PAPER_UPDATE, this.onStoragePaperUpdate);
      pubsub.subscribe(pubsub.CUSTOM_EVENT, this.onCustomEvent);
      pubsub.subscribe(pubsub.START_SEARCH, this.onStartSearch);
      this.queryTimer = +new Date();
    },

    onPageManagerMessage: function(event, data) {
      if (event === 'side-bars-update') {
        this._onSidebarsUpdate(data);
      }
    },

    _clearResults: function() {
      this.hiddenCollection.reset();
      this.view.collection.reset();
    },

    onStartSearch: function(apiQuery) {
      // quickly check if the query changed
      try {
        var beehive = this.getBeeHive();
        var storage = beehive.getObject('AppStorage');
        var history = beehive.getService('HistoryManager');
        var recentQuery = storage.getCurrentQuery().toJSON();
        var currentQuery = apiQuery.toJSON();
        var previousNav = history.getCurrentNav();
      } catch (e) {
        return;
      }

      if (!_.isEqual(recentQuery, currentQuery)) {
        this._clearResults();
      } else if (_.isArray(previousNav) && previousNav[0] === 'ShowAbstract') {
        // clear the focus interval
        clearInterval(this.focusInterval);

        // loop for a while, in case we have to wait for the elemen to show up
        var focusInterval = setInterval(function() {
          var $link = $('a[href$="' + previousNav[1].href + '"]');
          if ($link) {
            // found it, clear the interval and scroll
            clearInterval(focusInterval);
            $(document.documentElement).animate(
              { scrollTop: $link.offset().top },
              'fast'
            );
          }
        }, 100);

        // clear it after a timeout no matter what
        setTimeout(function() {
          clearInterval(focusInterval);
        }, 10000);
        this.focusInterval = focusInterval;
      }
      this.queryTimer = +new Date();
    },

    _onToggleSidebars: function() {
      this.trigger(
        'page-manager-event',
        'side-bars-update',
        this.model.get('showSidebars')
      );
    },

    _onSidebarsUpdate: function(value) {
      this.model.set('showSidebars', value);
    },

    onUserAnnouncement: function(message, data) {
      if (message == 'user_info_change' && _.has(data, 'isOrcidModeOn')) {
        // make sure to reset orcid state of all cached records, not just currently
        // visible ones
        var collection = this.hiddenCollection.toJSON();
        var docs = _.map(collection, function(x) {
          delete x.orcid;
          return x;
        });

        if (data.isOrcidModeOn) {
          this.addOrcidInfo(docs);
        }

        this.hiddenCollection.reset(docs);
        this.view.collection.reset(this.hiddenCollection.getVisibleModels());
      }
      this.updateMinAuthorsFromUserData();
    },

    onCustomEvent: function(event) {
      if (event === 'add-all-on-page') {
        var bibs = this.collection.pluck('bibcode');
        var pubsub = this.getPubSub();
        pubsub.publish(pubsub.BULK_PAPER_SELECTION, bibs);
      }
    },

    dispatchRequest: function(apiQuery) {
      this.reset();
      this.setCurrentQuery(apiQuery);
      this.model.set('loading', true);
      ListOfThingsWidget.prototype.dispatchRequest.call(this, apiQuery);
    },

    customizeQuery: function(apiQuery) {
      var q = apiQuery.clone();
      q.unlock();

      if (this.defaultQueryArguments) {
        q = this.composeQuery(this.defaultQueryArguments, q);
      }

      return q;
    },

    checkDetails: function() {
      var hExists = false;
      for (var i = 0; i < this.collection.models.length; i++) {
        var m = this.collection.models[i];
        if (m.attributes.highlights) {
          hExists = true;
          break;
        }
      }
    },

    getUserData: function() {
      try {
        var beehive = _.isFunction(this.getBeeHive) && this.getBeeHive();
        var user = _.isFunction(beehive.getObject) && beehive.getObject('User');
        if (_.isPlainObject(user)) {
          return (
            _.isFunction(user.getUserData) && user.getUserData('USER_DATA')
          );
        }
        return {};
      } catch (e) {
        return {};
      }
    },

    updateMinAuthorsFromUserData: function() {
      var userData = this.getUserData();
      var min = _.has(userData, 'minAuthorsPerResult')
        ? userData.minAuthorsPerResult
        : this.minAuthorsPerResult;

      if (String(min).toUpperCase() === 'ALL') {
        this.minAuthorsPerResult = Number.MAX_SAFE_INTEGER;
      } else if (String(min).toUpperCase() === 'NONE') {
        this.minAuthorsPerResult = 0;
      } else {
        this.minAuthorsPerResult = Number(min);
      }
    },

    processDocs: function(apiResponse, docs, paginationInfo) {
      var params = apiResponse.get('responseHeader.params');
      var start = params.start || 0;
      var docs = PaginationMixin.addPaginationToDocs(docs, start);
      var highlights = apiResponse.has('highlighting')
        ? apiResponse.get('highlighting')
        : {};
      var self = this;
      var userData = this.getBeeHive()
        .getObject('User')
        .getUserData('USER_DATA');
      var link_server = userData.link_server;
      this.__exposeMetadata(docs);
      this.updateMinAuthorsFromUserData();

      var appStorage = null;
      if (this.hasBeeHive() && this.getBeeHive().hasObject('AppStorage')) {
        appStorage = this.getBeeHive().getObject('AppStorage');
      }

      // check for normalized citation count, this will change display of "cited:N"
      const normCiteSort = /citation_count_norm/gi.test(params.sort);

      // stash docs so other widgets can access them
      this.getBeeHive()
        .getObject('DocStashController')
        .stashDocs(docs);

      // any preprocessing before adding the resultsIndex is done here
      docs = _.map(docs, function(d) {
        d.normCiteSort = normCiteSort;

        if (normCiteSort) {
          try {
            d.citationCountNorm = d.citation_count_norm.toFixed(2);
          } catch (e) {
            d.citationCountNorm = 0;
          }
        }
        // used by link generator mixin
        d.link_server = link_server;
        d.identifier = d.bibcode ? d.bibcode : d.identifier;

        // make sure undefined doesn't become "undefined"
        d.encodedIdentifier = _.isUndefined(d.identifier)
          ? d.identifier
          : encodeURIComponent(d.identifier);
        var h = {};

        if (_.keys(highlights).length) {
          h = (function() {
            var hl = highlights[d.id];
            var finalList = [];

            // adding abstract,title, etc highlights to one big list
            _.each(_.pairs(hl), function(pair) {
              finalList = finalList.concat(pair[1]);
            });

            return {
              highlights: finalList,
            };
          })();
        }

        d.highlights = h.highlights;

        var maxAuthorNames = self.minAuthorsPerResult;
        var shownAuthors;

        if (d.author && d.author.length > maxAuthorNames) {
          d.extraAuthors = d.author.length - maxAuthorNames;
          shownAuthors = d.author.slice(0, maxAuthorNames);
        } else if (d.author) {
          shownAuthors = d.author;
        }

        if (d.author) {
          var format = function(d, i, arr) {
            var l = arr.length - 1;
            if (i === l || l === 0) {
              return d; // last one, or only one
            }
            return d + ';';
          };
          d.authorFormatted = _.map(shownAuthors, format);
          d.allAuthorFormatted = _.map(d.author, format);
        }

        d.formattedDate = d.pubdate
          ? self.formatDate(d.pubdate, {
              format: 'yy/mm',
              missing: { day: 'yy/mm', month: 'yy' },
            })
          : undefined;
        d.shortAbstract = d.abstract
          ? self.shortenAbstract(d.abstract)
          : undefined;

        if (appStorage && appStorage.isPaperSelected(d.identifier)) {
          d.chosen = true;
        }

        return d;
      });

      try {
        docs = this.parseLinksData(docs);
      } catch (e) {
        console.warn(e.message);
      }

      // if the latest request equals the total perPage, then we're done, send off event
      if (
        this.pagination &&
        this.pagination.perPage === +params.start + +params.rows
      ) {
        var pubsub = this.getPubSub();
        pubsub.publish(
          pubsub.CUSTOM_EVENT,
          'timing:results-loaded',
          +new Date() - this.queryTimer
        );
      }

      this.model.set('loading', false);
      return docs;
    },

    onStoragePaperUpdate: function() {
      var appStorage;
      if (this.hasBeeHive() && this.getBeeHive().hasObject('AppStorage')) {
        appStorage = this.getBeeHive().getObject('AppStorage');
      } else {
        console.warn('AppStorage object disapperared!');
        return;
      }
      this.collection.each(function(m) {
        if (appStorage.isPaperSelected(m.get('identifier'))) {
          m.set('chosen', true);
        } else {
          m.set('chosen', false);
        }
      });
      this.hiddenCollection.each(function(m) {
        if (appStorage.isPaperSelected(m.get('identifier'))) {
          m.set('chosen', true);
        } else {
          m.set('chosen', false);
        }
      });
      if (this.collection.where({ chosen: true }).length == 0) {
        // make sure the "selectAll" button is unchecked
        var $chk = this.view.$('input#select-all-docs');
        if ($chk.length > 0) {
          $chk[0].checked = false;
        }
      }
    },

    triggerBulkAction: function(flag) {
      var bibs = this.collection.pluck('bibcode');
      this.getPubSub().publish(
        this.getPubSub().BULK_PAPER_SELECTION,
        bibs,
        flag
      );
    },

    reset: function() {
      // persist the sidebar state through resets
      var sidebarState = this.model.get('showSidebars');
      ListOfThingsWidget.prototype.reset.apply(this, arguments);
      this.model.set('showSidebars', sidebarState);
    },
  });

  _.extend(ResultsWidget.prototype, LinkGenerator);
  _.extend(ResultsWidget.prototype, Formatter);
  _.extend(
    ResultsWidget.prototype,
    PapersUtilsMixin,
    MetadataMixin,
    Dependon.BeeHive
  );
  return OrcidExtension(ResultsWidget);
});
