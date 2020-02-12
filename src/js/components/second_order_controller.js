define([
  'js/components/generic_module',
  'js/mixins/dependon',
  'js/components/api_query',
  'js/components/api_request',
  'js/components/api_targets',
  'analytics',
], function(
  GenericModule,
  Dependon,
  ApiQuery,
  ApiRequest,
  ApiTargets,
  analytics
) {
  /**
   * Triggered via pubsub event, this will take a set of identifiers
   * and generate a bigquery id, then replace the current query
   * with a specified field
   *
   * example query: `similar(docs(99999))`
   */
  const SecondOrderController = GenericModule.extend({
    initialize: function(options) {
      this.options = _.defaults({}, options, {
        maxQueryRows: 6000,
        transformDebounce: 1000,
      });

      // set up debounced transform
      if (this.options.transformDebounce) {
        this.transform = _.debounce(
          this.transform,
          this.options.transformDebounce
        );
      }
    },

    activate: function(beehive) {
      this.setBeeHive(beehive.getHardenedInstance());
      const ps = this.getBeeHive().getService('PubSub');
      ps.subscribe(ps.CUSTOM_EVENT, _.bind(this.onCustomEvent, this));
    },

    /**
     * Expecting an event in the following format
     * `second-order-search/{ field }`
     * then call the transform method
     */
    onCustomEvent: function(event) {
      if (event.startsWith('second-order-search/')) {
        this.transform.apply(
          this,
          [event.split('/')[1]].concat(_.rest(arguments))
        );
      }
    },

    /**
     * Grab the list of currently selected papers from app storage
     */
    getSelectedIds: function() {
      const storage = this.getBeeHive().getObject('AppStorage');
      if (storage && storage.getSelectedPapers) {
        return storage.getSelectedPapers() || [];
      }
      return [];
    },

    /**
     * get the current query from local storage
     */
    getCurrentQuery: function() {
      const storage = this.getBeeHive().getObject('AppStorage');
      if (
        storage &&
        storage.getCurrentQuery &&
        storage.getCurrentQuery() instanceof ApiQuery
      ) {
        return storage.getCurrentQuery();
      }
    },

    /**
     * Grab the qid from vault by sending our list of bibcodes
     * returning a promise
     */
    getBigQueryResponse: function(ids) {
      const ps = this.getPubSub();
      const $dd = $.Deferred();

      // create vault-style bigquery query
      const bigQuery = new ApiQuery({
        bigquery: `bibcode\n${ids.join('\n')}`,
        q: '*:*',
        fq: '{!bitset}',
        sort: 'date desc',
      });

      // create request
      const request = new ApiRequest({
        target: ApiTargets.MYADS_STORAGE + '/query',
        query: bigQuery,
        options: {
          type: 'POST',
          done: ({ qid }) => $dd.resolve(qid),
          fail: (ev) => $dd.reject(ev),
        },
      });
      ps.publish(ps.EXECUTE_REQUEST, request);

      return $dd.promise();
    },

    /**
     * send a *normal* query outside of search cycle
     */
    sendQuery: function(query) {
      const ps = this.getPubSub();
      const $dd = $.Deferred();

      // create request
      const request = new ApiRequest({
        target: ApiTargets.SEARCH,
        query: query,
        options: {
          type: 'GET',
          done: (res) => $dd.resolve(res),
          fail: (ev) => $dd.reject(ev),
        },
      });
      ps.publish(ps.EXECUTE_REQUEST, request);

      return $dd.promise();
    },

    /**
     * Checks if the passed in field is one of our defined FIELDS
     */
    validField: function(field) {
      return _.contains(_.values(SecondOrderController.FIELDS), field);
    },

    /**
     * send analytics event
     */
    submitAnalyticsEvent: function(field) {
      analytics(
        'send',
        'event',
        'interaction',
        'second-order-operation',
        field
      );
    },

    /**
     * Check field, get selected ids, get qid from vault, and finally send
     * navigate to the search page, starting the search cycle
     */
    transform: function(field, opts) {
      if (!field || !this.validField(field)) {
        throw 'must pass in a valid field';
      }

      const options = _.defaults({}, opts, {
        onlySelected: false,
        libraryId: null,
        ids: [],
        query: null,
      });

      // get the selected records from appStorage
      const selectedIds =
        options.ids.length > 0 ? options.ids : this.getSelectedIds();

      // if field is 'limit' it should generate qid from selection
      if (
        (selectedIds.length === 0 || !options.onlySelected) &&
        field !== SecondOrderController.FIELDS.LIMIT &&
        field !== SecondOrderController.FIELDS.LIBRARY
      ) {
        this.transformCurrentQuery(field, options.query);
      } else if (field === SecondOrderController.FIELDS.LIBRARY) {
        // if field is library, no need to make the request to vault, just start search
        this.startSearch(field, options.libraryId);
      } else {
        this.getQidAndStartSearch(field, selectedIds);
      }
    },

    /**
     * General error handler
     */
    handleError: function(ev) {
      let msg = 'Error occurred';
      if (ev.responseJSON && ev.responseJSON.error) {
        msg = ev.responseJSON.error;
      }
      const ps = this.getPubSub();
      ps.publish(ps.CUSTOM_EVENT, 'second-order-search/error', {
        message: msg,
      });
      throw msg;
    },

    /**
     * Wrap the current query and pull together all filter queries into
     * the selected field.
     *
     * This will navigate to the search page when done
     */
    transformCurrentQuery: function(field, _query) {
      const ps = this.getPubSub();
      const currentQuery =
        _query instanceof ApiQuery ? _query : this.getCurrentQuery();

      if (!currentQuery) {
        return;
      }
      const query = currentQuery.clone();
      const q = [];

      q.push(query.get('q'));
      _.forEach(Object.keys(query.toJSON()), (key) => {
        if (key.startsWith('fq_')) {
          q.push(query.get(key));
        }
      });

      const newQuery = new ApiQuery({
        q: `${field}(${q.join(' AND ')})`,
        sort: 'score desc',
      });
      ps.publish(ps.NAVIGATE, 'search-page', { q: newQuery });
    },

    /**
     * Send the ids to vault get a qid, which we then use to generate
     * the final query.
     *
     * This will navigate to the search page when done
     */
    getQidAndStartSearch: function(field, ids) {
      // get the big query response from vault
      this.getBigQueryResponse(ids)
        .then((qid) => {
          this.startSearch(field, qid);
        })
        .fail((...args) => this.handleError(...args));
    },

    startSearch: function(field, id) {
      if (!id) {
        throw 'no id';
      }

      let newQuery;
      if (field === SecondOrderController.FIELDS.LIMIT) {
        const currentQuery = this.getCurrentQuery() || new ApiQuery();

        // if field is limit, only do docs and retain the current sort
        newQuery = new ApiQuery({
          q: `docs(${id})`,
          sort: currentQuery.get('sort') || 'score desc',
        });
      } else if (field === SecondOrderController.FIELDS.LIBRARY) {
        // if library id, use the library/ prefix with the passed in ID
        newQuery = new ApiQuery({
          q: `docs(library/${id})`,
          sort: 'date desc',
        });
      } else {
        // replace the current query with our operator
        newQuery = new ApiQuery({
          q: `${field}(docs(${id}))`,
          sort: 'score desc',
        });
      }

      const ps = this.getPubSub();
      ps.publish(ps.NAVIGATE, 'search-page', { q: newQuery });

      this.submitAnalyticsEvent(field);
    },
  });

  SecondOrderController.FIELDS = {
    USEFUL: 'useful',
    SIMILAR: 'similar',
    TRENDING: 'trending',
    REVIEWS: 'reviews',
    LIMIT: 'limit',
    LIBRARY: 'library',
  };

  _.extend(SecondOrderController.prototype, Dependon.BeeHive);

  return SecondOrderController;
});
