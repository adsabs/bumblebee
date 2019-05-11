define([
  'js/components/generic_module',
  'js/mixins/dependon',
  'js/components/api_query',
  'js/components/api_request',
  'js/components/api_targets',
  'analytics'
],
function (
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
    initialize: function (options) {
      this.options = _.defaults({}, options, {
        maxQueryRows: 6000,
        transformDebounce: 1000
      });

      // set up debounced transform
      if (this.options.transformDebounce) {
        this.transform = _.debounce(this.transform, this.options.transformDebounce);
      }
    },

    activate: function (beehive) {
      this.setBeeHive(beehive.getHardenedInstance());
      const ps = this.getBeeHive().getService('PubSub');
      ps.subscribe(ps.CUSTOM_EVENT, _.bind(this.onCustomEvent, this));
    },

    /**
     * Expecting an event in the following format
     * `second-order-search/{ field }`
     * then call the transform method
     */
    onCustomEvent: function (event) {
      if (event.startsWith('second-order-search/')) {
        this.transform.apply(this, [event.split('/')[1]].concat(_.rest(arguments)));
      }
    },

    /**
     * Grab the list of currently selected papers from app storage
     */
    getSelectedIds: function () {
      const storage = this.getBeeHive().getObject('AppStorage');
      if (storage && storage.getSelectedPapers) {
        return storage.getSelectedPapers() || [];
      }
    },

    /**
     * get the current query from local storage
     */
    getCurrentQuery: function () {
      const storage = this.getBeeHive().getObject('AppStorage');
      if (storage && storage.getCurrentQuery) {
        return storage.getCurrentQuery();
      }
    },

    /**
     * Grab the qid from vault by sending our list of bibcodes
     * returning a promise
     */
    getBigQueryResponse: function (ids) {
      const ps = this.getPubSub();
      const $dd = $.Deferred();

      // create vault-style bigquery query
      const bigQuery = new ApiQuery({
        bigquery: `bibcode\n${ ids.join('\n') }`,
        q: '*:*',
        fq: '{!bitset}',
        sort: 'date desc'
      });

      // create request
      const request = new ApiRequest({
        target: ApiTargets.MYADS_STORAGE + '/query',
        query: bigQuery,
        options: {
          type: 'POST',
          done: ({ qid }) => $dd.resolve(qid),
          fail: (ev) => $dd.reject(ev)
        }
      });
      ps.publish(ps.EXECUTE_REQUEST, request);

      return $dd.promise();
    },

    /**
     * send a *normal* query outside of search cycle
     */
    sendQuery: function (query) {
      const ps = this.getPubSub();
      const $dd = $.Deferred();

      // create request
      const request = new ApiRequest({
        target: ApiTargets.SEARCH,
        query: query,
        options: {
          type: 'GET',
          done: (res) => $dd.resolve(res),
          fail: (ev) => $dd.reject(ev)
        }
      });
      ps.publish(ps.EXECUTE_REQUEST, request);

      return $dd.promise();
    },

    /**
     * Checks if the passed in field is one of our defined FIELDS
     */
    validField: function (field) {
      return _.contains(_.values(SecondOrderController.FIELDS), field);
    },

    /**
     * send analytics event
     */
    submitAnalyticsEvent: function (field) {
      analytics('send', 'event', 'interaction', 'second-order-operation', field);
    },

    /**
     * Check field, get selected ids, get qid from vault, and finally send
     * navigate to the search page, starting the search cycle
     */
    transform: function (field, opts) {
      if (!field || !this.validField(field)) {
        throw 'must pass in a valid field';
      }

      const options = _.defaults({}, opts, {
        onlySelected: false
      });

      // get the selected records from appStorage
      const selectedIds = this.getSelectedIds();

      if (selectedIds.length === 0 || !options.onlySelected) {
        this.getIdsFromCurrentQuery()
          .then((ids) => this.getQidAndStartSearch(field, ids))
          .fail(this.handleError);
      } else {
        this.getQidAndStartSearch(field, selectedIds);
      }
    },

    /**
     * General error handler 
     */
    handleError: function (ev) {
      if (ev.responseJSON && ev.responseJSON.error) {
        throw ev.responseJSON.error;
      } else {
        throw 'error occurred';
      }
    },

    /**
     * Get the current query and then request additional rows
     * until the MAX_QUERY_ROWS are reached.
     */
    getIdsFromCurrentQuery: function () {
      const $dd = $.Deferred();
      const query = this.getCurrentQuery().clone();
      const promises = [];
      const getIds = ({ response }) => {
        return response.docs.map((r) => r.bibcode);
      }
      let max = this.options.maxQueryRows;
      
      // send an initial query to get the total results, and begin paging
      query.set({ fl: 'bibcode', start: 0, rows: 1000 });
      this.sendQuery(query).then((res) => {

        // get the numfound and update our max
        const totalRecords = res.response.numFound;
        if (totalRecords < max && totalRecords > 0) {
          max = totalRecords;
        } else if (totalRecords === 0) {
          return $dd.reject({
            responseJSON: { error: 'no records found' }
          });
        }

        // set max as our stopping point, and start at the end of our initial request (1000)
        for(let i = 1000; i < max; i+= 1000) {
          let q = query.clone();
          q.set({ fl: 'bibcode', start: i, rows: 1000 });
          promises.push(this.sendQuery(q));
        }

        // if we don't have any promises to wait for, then just use what we received already
        if (promises.length > 0) {
          $.when.apply($, promises).then((...responses) => {
            $dd.resolve(_.flatten([
              ...getIds(res), 
              ...responses.map(getIds)
            ]));
          }, (err) => {
            $dd.reject(err);
          });
        } else {
          $dd.resolve(getIds(res));
        }
        
      }).fail((err) => {
        $dd.reject(err);
      });
      return $dd.promise();
    },

    /**
     * Send the ids to vault get a qid, which we then use to generate 
     * the final query.
     * 
     * This will navigate to the search page when done
     */
    getQidAndStartSearch: function (field, ids) {
      const ps = this.getPubSub();

      // get the big query response from vault
      this.getBigQueryResponse(ids).then((qid) => {
        if (!qid) {
          throw 'no qid from vault';
        }

        // replace the current query with our operator
        const newQuery = new ApiQuery({ q: `${ field }(docs(${ qid }))` });
        ps.publish(ps.NAVIGATE, 'search-page', { q: newQuery });

        this.submitAnalyticsEvent(field);
      }).fail(this.handleError);
    }
  });

  SecondOrderController.FIELDS = {
    REFERENCES: 'references',
    SIMILAR: 'similar',
    TRENDING: 'trending',
    CITATIONS: 'citations'
  };

  _.extend(SecondOrderController.prototype, Dependon.BeeHive);

  return SecondOrderController;
});
