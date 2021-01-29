/**
 * This widget can paginate through a list of results. It can easily be inherited
 * by results widget ,table of contents widget, etc. It either listens to INVITING_REQUEST
 * in the case of the results widget, or the loadBibcode method (currently all other widgets).
 *
 * This widget consists of the following components:
 *
 * 1. a pagination view (you can choose from expanding view or paginated view [default])
 * 2. an associated pagination model (all pagination info is kept here and only here)
 * 3. a list view that listens to the visible records and renders them
 * 4. an item view for each record rendered repeatedly by the list view
 * 5. a controller that handles requesting and recieving data from pubsub and initializing everything
 *
 */

define([
  'marionette',
  'backbone',
  'utils',
  'js/components/api_request',
  'js/components/api_query',
  'js/components/api_feedback',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/list_of_things/templates/item-template',
  'hbs!js/widgets/list_of_things/templates/results-container-template',
  'js/mixins/add_stable_index_to_collection',
  './model',
  './paginated_view',
], function(
  Marionette,
  Backbone,
  utils,
  ApiRequest,
  ApiQuery,
  ApiFeedback,
  BaseWidget,
  ItemTemplate,
  ResultsContainerTemplate,
  PaginationMixin,
  PaginatedCollection,
  PaginatedView
) {
  var ListOfThingsWidget = BaseWidget.extend({
    initialize: function(options) {
      options = options || {};

      _.defaults(
        options,
        _.pick(this, [
          'view',
          'collection',
          'pagination',
          'model',
          'description',
          'childView',
        ])
      );

      // widget.reset will restore these default pagination settings
      // for now, it doesn't make sense to pass them as options
      // since localStorage perPage will override it anyway

      // this functions as model.defaults while allowing the inheriting
      // widgets to provide their own models with their own defaults
      this.pagination = {
        pagination: true,
        // default per page : 25
        perPage: 25,
        numFound: undefined,
        currentQuery: undefined,
        start: 0,
        pageData: undefined,
        focusedIndex: -1,
      };

      options.collection = options.collection || new PaginatedCollection();

      if (!options.view) {
        // operator instructs view to show a link that has citations:(bibcode) or something similar
        options.view = new PaginatedView({
          collection: options.collection,
          model: options.model,
          childView: options.childView,
        });
      }

      options.view.model.set(this.pagination, {
        silent: true,
      });
      options.view.model.set(
        {
          // for the template button that opens search in search results page
          sortOrder: options.sortOrder,
          removeSelf: options.removeSelf,
          queryOperator: options.queryOperator,
          description: options.description,
        },
        {
          silent: true,
        }
      );

      _.extend(this, {
        model: options.view.model,
        view: options.view,
      });

      // this is the hidden collection (just to hold data)
      this.hiddenCollection = new PaginatedCollection();

      // XXX:rca - start using modelEvents, instead of all....
      this.listenTo(this.hiddenCollection, 'all', this.onAllInternalEvents);
      this.listenTo(this.view, 'all', this.onAllInternalEvents);
      this.on('all', this.onAllInternalEvents);
      this.model.on('change:page', () => {
        this.model.set('focusedIndex', -1, {
          silent: true,
        });
      });

      this.changePage = _.debounce(this.changePage.bind(this), 500);
      BaseWidget.prototype.initialize.call(this, options);
    },

    // this must be extended by inheriting widgets to listen to display events
    activate: function(beehive) {
      this.setBeeHive(beehive);
      _.bindAll(this, ['updatePaginationPreferences']);
      const ps = this.getPubSub();

      if (
        this.getBeeHive().getObject('User') &&
        this.getBeeHive().getObject('User').getLocalStorage
      ) {
        var perPage = this.getBeeHive()
          .getObject('User')
          .getLocalStorage().perPage;
        if (perPage) {
          // set the pagination perPage value to whatever is in local storage,
          // otherwise it will be the default val from the initialize function
          this.pagination.perPage = perPage;
          this.model.set(this.pagination);
        }
      }
      ps.subscribe(ps.INVITING_REQUEST, () => {
        this.updateState(this.STATES.LOADING);
      });
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);
      ps.subscribe(ps.USER_ANNOUNCEMENT, this.updatePaginationPreferences);
      ps.subscribe(ps.CUSTOM_EVENT, (event) => {
        if (event === 'hotkey/next') {
          this.changePage(1);
        } else if (event === 'hotkey/prev') {
          this.changePage(-1);
        } else if (event === 'hotkey/item-next') {
          this.changeItemFocus(1);
        } else if (event === 'hotkey/item-prev') {
          this.changeItemFocus(-1);
        } else if (event === 'hotkey/item-select') {
          this.selectItem();
        }
      });
    },

    selectItem() {
      const idx = this.model.get('focusedIndex');
      if (idx >= 0) {
        const view = this.view.children.findByIndex(idx);
        if (view && view.toggleSelect) {
          view.toggleSelect();
        }
      }
    },

    changeItemFocus(change) {
      const len = this.view.children.length;
      let focusedIndex = this.model.get('focusedIndex');
      if (focusedIndex <= 0 && change === -1) {
        focusedIndex = len - 1;
      } else if (focusedIndex === len - 1 && change === 1) {
        focusedIndex = 0;
      } else {
        focusedIndex += change;
      }
      this.model.set('focusedIndex', focusedIndex, {
        silent: true,
      });
      const view = this.view.children.findByIndex(focusedIndex);
      if (view && view.el) {
        $('>', view.el).focus();
      }
    },

    changePage(change) {
      this.updatePagination({
        page: (this.model.get('page') || 0) + change,
      });
    },

    onApiFeedback: function(feedback) {
      if (feedback.error) {
        this.view.model.set('error', feedback.error);
        this.updateState(this.STATES.ERRORED);
      }
    },

    updatePaginationPreferences: function(event, data) {
      if (
        event == 'user_info_change' &&
        data.perPage &&
        data.perPage !== this.pagination.perPage
      ) {
        // update per-page value
        this.updatePagination({
          perPage: data.perPage,
        });
      }
    },

    /**
     * Get the current query from either our own apiResponse or from
     * the application local storage
     *
     * @param {ApiResponse} apiResponse - the response from the api
     * @returns {string} - the query string
     * @private
     */
    _getCurrentQueryString: function(apiResponse) {
      var q = '';
      var res =
        apiResponse ||
        this.getBeeHive()
          .getObject('AppStorage')
          .getCurrentQuery();

      // check for simbids
      if (!_.isUndefined(res)) {
        q = res.getApiQuery().get('q');

        // if there is a simbid, look to see if there is a translated string
        if (_.isEmpty(q) || q[0].indexOf('simbid') > -1) {
          try {
            q = [res.get('responseHeader.params.__original_query')];
          } catch (err) {
            // No original query present in responseHeader, this may be a biblib and not a solr request
            q = '';
          }
        }
      }

      return q;
    },

    processResponse: function(apiResponse) {
      var docs = this.extractDocs(apiResponse);
      var numFound = apiResponse.has('response.numFound')
        ? apiResponse.get('response.numFound')
        : this.hiddenCollection.length;
      var start = apiResponse.has('response.start')
        ? apiResponse.get('response.start')
        : this.model.get('start');
      var pagination = this.getPaginationInfo(apiResponse, docs);
      docs = this.processDocs(apiResponse, docs, pagination);
      var self = this;

      if (docs && docs.length) {
        // make sure the new docs close highlights if they aren't there
        var newDocs = _.map(docs, function(d) {
          return _.extend(d, {
            showHighlights: typeof d.highlights !== 'undefined',
            showCheckbox: !!self.model.get('showCheckboxes'),
          });
        });

        this.hiddenCollection.add(newDocs, {
          merge: true,
        });

        // finally, if there aren't any highlights, close the button
        var hasHighlights = this.hiddenCollection.filter(function(m) {
          return m.get('highlights');
        });
        if (hasHighlights.length === 0) {
          this.view.model.set('showHighlights', 'closed');
        }

        if (pagination.showRange) {
          // we must update the model before updating collection because the showRange
          // can automatically start fetching documents
          this.model.set(pagination);
          this.hiddenCollection.showRange(
            pagination.showRange[0],
            pagination.showRange[1]
          );
        }
        this.view.collection.reset(this.hiddenCollection.getVisibleModels());
        this.view.model.set('query', false);
      } else {
        var params = apiResponse.get('responseHeader.params');
        this.view.model.set({
          isTugboat: !!params.__tb,
          query: this._getCurrentQueryString(apiResponse),
          currentQuery: apiResponse.getApiQuery(),
        });
      }

      // XXX:rca - hack, to be solved later
      this.trigger('page-manager-event', 'widget-ready', {
        numFound: numFound,
      });

      var allLoaded =
        this.model.has('perPage') &&
        this.model.get('perPage') === this.collection.length;
      var isLastPage =
        this.model.has('pageData') &&
        this.model.get('pageData').nextPossible === false;
      var noItems = this.view.collection.length === 0;

      // finally, loading view (from pagination template) can be removed or added
      if (
        noItems ||
        allLoaded ||
        (isLastPage && numFound <= start + docs.length)
      ) {
        this.model.set('loading', false);
        this.updateState(this.STATES.IDLE);
      } else {
        this.model.set('loading', true);
      }
    },

    extractDocs: function(apiResponse) {
      var docs = apiResponse.get('response.docs');
      docs = _.map(docs, function(d) {
        d.all_ids = d.identifier;
        if (d.bibcode) {
          d.original_identifier = d.identifier;
          d.identifier = d.bibcode ? d.bibcode : d.identifier;
        }
        return d;
      });
      return docs;
    },

    getPaginationInfo: function(apiResponse, docs) {
      var q = apiResponse.getApiQuery();

      // this information is important for calculation of pages
      var numFound = apiResponse.get('response.numFound') || 0;
      var perPage =
        this.model.get('perPage') || (q.has('rows') ? q.get('rows')[0] : 10);
      var start = this.model.get('start') || 0;

      // compute the page number of this request
      var page = PaginationMixin.getPageVal(start, perPage);

      // compute which documents should be made visible
      var showRange = [page * perPage, (page + 1) * perPage - 1];

      // means that we were fetching the missing documents (to fill gaps in the collection)
      var fillingGaps = q.has('__fetch_missing');
      if (fillingGaps) {
        return {
          start: start,
          showRange: showRange,
        };
      }

      var pageData = this._getPaginationData(page, perPage, numFound);

      return {
        numFound: numFound,
        perPage: perPage,
        start: start,
        page: page,
        showRange: showRange,
        pageData: pageData,
        currentQuery: q,
      };
    },

    /*
     * data for the page numbers template at the bottom
     * */
    _getPaginationData: function(page, perPage, numFound) {
      // page is zero indexed
      return {
        // copying this here for convenience
        perPage: perPage,
        totalPages: Math.ceil(numFound / perPage),
        currentPage: page + 1,
        previousPossible: page > 0,
        nextPossible: (page + 1) * perPage < numFound,
      };
    },

    processDocs: function(apiResponse, docs, paginationInfo) {
      if (!apiResponse.has('response')) return [];
      var params = apiResponse.get('response');
      var start = params.start || paginationInfo.start || 0;
      docs = PaginationMixin.addPaginationToDocs(docs, start);
      return docs;
    },

    defaultQueryArguments: {
      fl: 'id',
      start: 0,
    },

    /*
     * right now only perPage value can be updated by list of things
     * */

    updateLocalStorage: function(options) {
      // if someone has selected perPage, save it in to localStorage
      if (
        options.hasOwnProperty('perPage') &&
        _.contains([25, 50, 100, 200, 500], options.perPage)
      ) {
        this.getBeeHive()
          .getObject('User')
          .setLocalStorage({
            perPage: options.perPage,
          });
        console.log(
          "set user's page preferences in localStorage: " + options.perPage
        );
      }
      // updatePagination will be called after localStorage triggers an event
    },

    updatePagination: function(options) {
      // update the current model based on the data passed in
      var opts = _.defaults({}, options, {
        silentIndexUpdate: false,
        updateHash: true,
      });
      var currentPageData = this.model.get('pageData');
      var start = this.model.get('start');
      var update = {};
      var currentQuery = this.model.get('currentQuery') || new ApiQuery();
      var pageParam = currentQuery.get('p_');

      // add numFound
      if (_.isNumber(opts.numFound)) {
        update.numFound = opts.numFound;
      }

      // add perPage
      if (_.isNumber(opts.perPage)) {
        update.perPage = opts.perPage;

        // update the pagination object
        this.pagination.perPage = opts.perPage;
      }

      // if page isn't specified, check the location hash
      if (_.isArray(pageParam) && _.isUndefined(opts.page)) {
        try {
          opts.page = parseInt(pageParam[0]);
        } catch (e) {
          // do nothing
        }
      }

      // check to make sure this page update is valid, and add to update
      if (_.isNumber(opts.page)) {
        var max = (currentPageData && currentPageData.totalPages - 1) || 1;
        var min = 0;

        // check if page is within our set boundaries
        if (opts.page > max) {
          update.page = max;
        } else if (opts.page < min) {
          update.page = min;
        } else {
          update.page = opts.page;
        }
      } else {
        // otherwise compute the page using the start and perPage value
        if (
          _.isEmpty(this.collection.models) &&
          _.isNumber(start) &&
          _.isNumber(opts.perPage)
        ) {
          update.page = PaginationMixin.getPageVal(start, opts.perPage);
        } else if (_.isNumber(start) && _.isNumber(opts.perPage)) {
          var resIdx = this.collection.models[0].get('resultsIndex');
          update.page = PaginationMixin.getPageVal(resIdx, opts.perPage);
        }
      }

      var page = _.isNumber(update.page) ? update.page : this.model.get('page');
      var perPage = _.isNumber(update.perPage)
        ? update.perPage
        : this.model.get('perPage');
      var numFound = _.isNumber(update.numFound)
        ? update.numFound
        : this.model.get('numFound');

      // once the hash is updated, this is called again, return here so we don't recompute, and only on results page
      const frag =
        Backbone.history &&
        Backbone.history.getFragment &&
        Backbone.history.getFragment();
      if (
        '' + page !== (_.isArray(pageParam) && pageParam[0]) &&
        opts.updateHash &&
        /search/.test(frag) &&
        utils.qs('p_', frag) !== '' + page
      ) {
        Backbone.history &&
          Backbone.history.navigate &&
          Backbone.history.navigate(utils.updateHash('p_', page, frag));
      }

      // compute the new start and pageData values
      update.start = this.getPageStart(page, perPage, numFound);
      update.pageData = this._getPaginationData(page, perPage, numFound);
      update.showRange = [page * perPage, page * perPage + perPage - 1];

      // start updating
      this.model.set(update);
      this.view.render();
      this.hiddenCollection.showRange(
        update.showRange[0],
        update.showRange[1],
        {
          silent: !!opts.silentIndexUpdate,
        }
      );
      this.collection.reset(this.hiddenCollection.getVisibleModels());

      // finally, scroll back to the top
      $(document.documentElement).scrollTop(0);
    },

    onAllInternalEvents: function(ev, arg1, arg2) {
      // for testing, allow widget to not have been activated
      try {
        var pubsub = this.getPubSub();
      } catch (e) {}

      if (ev === 'pagination:changePerPage') {
        this.updateLocalStorage({
          perPage: arg1,
        });
        this.updatePagination({
          page: 0,
          perPage: arg1,
        });
        this.view.model.set('showHighlights', 'closed');
      } else if (ev === 'pagination:select') {
        this.view.model.set('showHighlights', 'closed');
        return this.updatePagination({
          page: arg1,
        });
      } else if (ev === 'show:missing') {
        _.each(
          arg1,
          function(gap) {
            var numFound = this.model.get('numFound');
            var start = gap.start;
            var perPage = this.model.get('perPage');
            var currStart = this.model.get('start');

            if (
              !numFound ||
              start >= numFound ||
              (start !== currStart && currStart > 0)
            )
              return; // ignore this

            var q = this.model.get('currentQuery').clone();
            q.unset('hl');
            q.unset('hl.fl');
            q.unset('hl.maxAnalyzedChars');
            q.unset('hl.requireFieldMatch');
            q.unset('hl.usePhraseHighlighter');
            q.set('__fetch_missing', 'true');
            q.set('start', start);
            q.set('rows', perPage - start <= 0 ? perPage : perPage - start);
            var req = this.composeRequest(q);

            // allows widgets to override if necessary
            this.executeRequest(req);
          },
          this
        );
      } else if (ev == 'childview:toggleSelect') {
        pubsub.publish(pubsub.PAPER_SELECTION, arg2.data.identifier);
      } else if (ev === 'toggle-highlights') {
        var perPage = this.model.get('perPage');
        if (this.hiddenCollection.length < perPage) {
          perPage = this.hiddenCollection.length;
        }
        var pageStart = this.model.get('start');

        // how many requests to make, based on size of set
        var divisor = perPage > 300 ? 5 : perPage <= 50 ? 1 : 2;

        // request runner
        var runRequest = _.bind(function(start, rows) {
          var q = this.model.get('currentQuery').clone();
          q.set({
            hl: 'true',
            'hl.fl': 'title,abstract,body,ack,*',
            'hl.maxAnalyzedChars': '150000',
            'hl.requireFieldMatch': 'true',
            'hl.usePhraseHighlighter': 'true',
            start: pageStart + start,
            rows: rows,
          });
          var req = this.composeRequest(q);

          // allows widgets to override if necessary
          this.executeRequest(req);
        }, this);

        var chunkRequests = _.debounce(
          _.bind(function() {
            // batch requests, spacing them out by 300ms
            var withHighlights = this.hiddenCollection.filter(function(m) {
              return m.get('highlights');
            });

            var start = withHighlights.length;
            var batchSize = Math.ceil((perPage - start) / divisor);
            for (var i = start, j = 1; i < perPage; i += batchSize, j++) {
              if (i === start) {
                runRequest(i, batchSize);
              } else {
                setTimeout(runRequest, 500 * j, i, batchSize);
              }
            }
          }, this),
          3000
        );

        chunkRequests();
      }
    },

    executeRequest: function(req) {
      this.getPubSub().publish(this.getPubSub().EXECUTE_REQUEST, req);
    },

    reset: function() {
      this.collection.reset();
      this.hiddenCollection.reset();
      // reset the model, favoring values in this.pagination
      this.model.set(
        _.defaults(
          {
            currentQuery: this.getCurrentQuery(),
            query: false,
          },
          this.pagination,
          this.model.defaults()
        )
      );
    },
  });

  _.extend(ListOfThingsWidget.prototype, PaginationMixin);

  return ListOfThingsWidget;
});
