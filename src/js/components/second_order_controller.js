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
        this.transformCurrentQuery(field);
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
     * Wrap the current query and pull together all filter queries into
     * the selected field.
     *
     * This will navigate to the search page when done
     */
    transformCurrentQuery: function (field) {
      const ps = this.getPubSub();
      const query = this.getCurrentQuery().clone();
      let q = [];

      q.push(`(${ query.get('q') })`);
      _.forEach(query.toJSON(), (val, key) => {
        if (key.startsWith('fq_')) {
          q.push(query.get(key));
        }
      });

      const newQuery = new ApiQuery({
        q: `${ field }(${ q.join(' AND ') })`,
        sort: query.get('sort') || 'score desc'
      });
      ps.publish(ps.NAVIGATE, 'search-page', { q: newQuery });
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
        const newQuery = new ApiQuery({
          q: `${ field }(docs(${ qid }))`,
          sort: 'score desc'
        });
        ps.publish(ps.NAVIGATE, 'search-page', { q: newQuery });

        this.submitAnalyticsEvent(field);
      }).fail(this.handleError);
    }
  });

  SecondOrderController.FIELDS = {
    USEFUL: 'useful',
    SIMILAR: 'similar',
    TRENDING: 'trending',
    REVIEWS: 'reviews'
  };

  _.extend(SecondOrderController.prototype, Dependon.BeeHive);

  return SecondOrderController;
});
