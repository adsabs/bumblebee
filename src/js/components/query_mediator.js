/**
 * Created by rchyla on 3/30/14.
 */

/**
 * Mediator to coordinate UI-query exchange
 */

define(['underscore',
    'jquery',
    'cache',
    'js/components/generic_module',
    'js/mixins/dependon',
    'js/components/api_request',
    'js/components/api_response',
    'js/components/api_query_updater',
    'js/components/api_feedback',
    'js/components/json_response'],
  function(
    _,
    $,
    Cache,
    GenericModule,
    Mixins,
    ApiRequest,
    ApiResponse,
    ApiQueryUpdater,
    ApiFeedback,
    JsonResponse) {


    var QueryMediator = GenericModule.extend({

      initialize: function(options) {
        options = options || {};
        this._cache = this._getNewCache(options.cache);
        this.debug = options.debug || false;
        this.queryUpdater = new ApiQueryUpdater('QueryMediator');
        this.failedRequestsCache = this._getNewCache();
        this.maxRetries = options.maxRetries || 3;
        this.recoveryDelayInMs = _.isNumber(options.recoveryDelayInMs) ? options.recoveryDelayInMs : 700;
        this.__searchCycle = {waiting:{}, inprogress: {}};
        this.shortDelayInMs = _.isNumber(options.shortDelayInMs) ? options.shortDelayInMs : 10;
        this.longDelayInMs = _.isNumber(options.longDelayInMs) ? options.longDelayInMs: 100;
        this.monitoringDelayInMs = _.isNumber(options.monitoringDelayInMs) ? options.monitoringDelayInMs : 200;
      },

      _getNewCache: function(options) {
        return new Cache(_.extend({
          'maximumSize': 100,
          'expiresAfterWrite':60*30 // 30 mins
        }, _.isObject(options) ? options : {}));
      },

      /**
       * Starts listening on the PubSub
       *
       * @param beehive - the full access instance; we excpect PubSub to be
       *    present
       */
      activate: function(beehive) {
        this.setBeeHive(beehive);
        var pubsub = beehive.Services.get('PubSub');
        this.pubSubKey = pubsub.getPubSubKey();

        pubsub.subscribe(this.pubSubKey, pubsub.START_SEARCH, _.bind(this.startSearchCycle, this));
        pubsub.subscribe(this.pubSubKey, pubsub.DELIVERING_REQUEST, _.bind(this.receiveRequests, this));
        pubsub.subscribe(this.pubSubKey, pubsub.EXECUTE_REQUEST, _.bind(this.executeRequest, this));
        pubsub.subscribe(this.pubSubKey, pubsub.GET_QTREE, _.bind(this.getQTree, this));
      },


      getQTree: function(apiQuery, senderKey) {
        var apiRequest = new ApiRequest({'query': apiQuery, 'target': 'qtree'});
        var api = this.getBeeHive().getService('Api');

        this._executeRequest(apiRequest, senderKey);
      },

      /**
       * Happens at the beginnng of the new search cycle. This is the 'race started' signal
       */
      startSearchCycle: function(apiQuery, senderKey) {
        if (this.debug)
          console.log('[QM]: received query:', apiQuery.url());

        if (apiQuery.keys().length <= 0) {
          console.warn('[QM] : received empty query (huh?!)');
          return;
        }
        var ps = this.getBeeHive().getService('PubSub');


        if (this.__searchCycle.running && this.__searchCycle.waiting && _.keys(this.__searchCycle.waiting)) {
          console.error('The previous search cycle did not finish, and there already comes the next!');
        }

        this.reset();
        this.__searchCycle.initiator = senderKey.getId();

        // we will protect the query -- in the future i can consider removing 'unlock' to really
        // cement the fact the query MUST NOT be changed (we want to receive a modified version)
        var q = apiQuery.clone();

        // since widgets are dirty bastards, we will remove the fl parameter (to avoid cross-
        // contamination)
        q.unset('fl');

        q.lock();
        ps.publish(this.pubSubKey, ps.INVITING_REQUEST, q);

        // give widgets some time to submit their requests
        var self = this;
        setTimeout(function() {
          self.startExecutingQueries();
          self.monitorExecution();
        }, this.shortDelayInMs);

      },


      startExecutingQueries: function(force) {
        if (this.__searchCycle.running) return; // safety barrier

        var self = this;
        var cycle = this.__searchCycle;

        if (_.isEmpty(cycle.waiting)) return;
        cycle.running = true;


        var data;
        var beehive = this.getBeeHive();
        var api = beehive.getService('Api');
        var ps = beehive.getService('PubSub');

        if (!(ps && api)) return; // application is gone


        if (beehive.hasObject('RuntimeConfig')) { // pick a request that will be executed first
          var runtime = beehive.getObject('RuntimeConfig');
          if (runtime.pskToExecuteFirst && cycle.waiting[runtime.pskToExecuteFirst]) {
            data = cycle.waiting[runtime.pskToExecuteFirst];
            delete cycle.waiting[runtime.pskToExecuteFirst];
          }
        }
        if (!data && cycle.waiting[cycle.initiator]) { // grab the query/request which started the cycle
          data = cycle.waiting[cycle.initiator];
          delete cycle.waiting[cycle.initiator];
        }
        if (!data) {
          console.warn('RuntimeConfig does not tell us which request to execute first (grabbing random one).');
          var kx;
          data = cycle.waiting[(kx=_.keys(cycle.waiting)[0])];
          delete cycle.waiting[kx]
        }

        // execute the first search (if it succeeds, fire the rest)
        var requestKey = this._getCacheKey(data.request);
        cycle.inprogress[data.key.getId()] = data;

        this._executeRequest(data.request, data.key)
          .done(function(response, textStatus, jqXHR) {
            ps.publish(self.pubSubKey, ps.FEEDBACK, new ApiFeedback({code: ApiFeedback.CODES.SEARCH_CYCLE_STARTED}));

            // after we are done with the first query, start executing other queries
            var f = function() {
              _.each(_.keys(cycle.waiting), function (k) {
                data = cycle.waiting[k];
                delete cycle.waiting[k];
                cycle.inprogress[k] = data;
                self._executeRequest.call(self, data.request, data.key);
              });
            };

            // for the display experience, it is better to introduce delays
            if (self.longDelayInMs && self.longDelayInMs > 0) {
              setTimeout(function() {
                f();
              }, self.longDelayInMs);
            }
            else {
              f();
            }
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            self.__searchCycle.error = true;
            ps.publish(self.pubSubKey, ps.FEEDBACK, new ApiFeedback({code: ApiFeedback.CODES.SEARCH_CYCLE_FAILED_TO_START,
              request: this.request}));
          });
      },

      monitorExecution: function() {
        var self = this;
        var ps = this.getBeeHive().getService('PubSub');
        if (!ps) return; // application is gone

        this.__searchCycle.monitor += 1;

        if (this.__searchCycle.monitor > 100) {
          console.warn('Stopping monitoring of queries, it is running too long');
          ps.publish(self.pubSubKey, ps.FEEDBACK, new ApiFeedback({code: ApiFeedback.CODES.SEARCH_CYCLE_STOP_MONITORING}));
          return;
        }

        if (this.__searchCycle.waiting && _.isEmpty(this.__searchCycle.waiting)) {
          ps.publish(self.pubSubKey, ps.FEEDBACK, new ApiFeedback({code: ApiFeedback.CODES.SEARCH_CYCLE_FINISHED}));
          return;
        }

        var lenToDo = _.keys(this.__searchCycle.waiting).length;
        var lenDone = _.keys(this.__searchCycle.inprogress).length; // TODO: this is not exactly correct
        var total = lenToDo + lenDone;

        ps.publish(self.pubSubKey, ps.FEEDBACK, new ApiFeedback({code: ApiFeedback.CODES.SEARCH_CYCLE_PROGRESS,
          msg: (lenToDo / total), total: total, todo: lenToDo}));

        setTimeout(function() {
          self.monitorExecution();
        }, self.monitoringDelayInMs);
      },

      /**
       * This method harvest requests from the PubSub and stores them inside internal
       * datastruct
       *
       * @param apiRequest
       * @param senderKey
       */
      receiveRequests: function(apiRequest, senderKey) {
        if (this.debug)
          console.log('[QM]: received request:', apiRequest.url(), senderKey.getId());
        this.__searchCycle.waiting[senderKey.getId()] = {request: apiRequest, key: senderKey};
      },

      /**
       * This method executes a request, we check
       * the local cache and also prepare context for the done/fail callbacks
       *
       * @param apiRequest
       * @param senderKey
       */
      executeRequest: function(apiRequest, senderKey) {
        if (!(apiRequest instanceof ApiRequest)) {
          throw new Error('Sir, I belive you forgot to send me a valid ApiRequest!');
        }
        return this._executeRequest(apiRequest, senderKey);
      },

      _executeRequest: function(apiRequest, senderKey) {
        var ps = this.getBeeHive().Services.get('PubSub');
        var api = this.getBeeHive().Services.get('Api');

        var requestKey = this._getCacheKey(apiRequest);
        var maxTry = this.failedRequestsCache.getSync(requestKey) || 0;

        if (maxTry >= this.maxRetries) {
          this.onApiRequestFailure.apply({request:apiRequest, key: senderKey, requestKey:requestKey, qm: this},
            [{status: ApiFeedback.CODES.TOO_MANY_FAILURES}, 'Error', 'This request has reached maximum number of failures (wait before retrying)']);
          return;
        }


        if (this._cache) {

          var resp = this._cache.getSync(requestKey);
          var self = this;

          if (resp && resp.promise) { // we have already created ajax request

            resp.done(function() {
              self._cache.put(requestKey, arguments);
              self.onApiResponse.apply(
                {request:apiRequest, key: senderKey, requestKey:requestKey, qm: self }, arguments);
            });
            resp.fail(function() {
              self._cache.invalidate(requestKey);
              self.onApiRequestFailure.apply(
                {request:apiRequest, pubsub: ps, key: senderKey, requestKey:requestKey,
                  qm: self }, arguments);
            });
            return resp;
          }
          else if (resp) { // we already have data (in the cache)
            var defer = $.Deferred();
            defer.done(function() {
              self.onApiResponse.apply(
                {request: apiRequest, key: senderKey, requestKey: requestKey, qm: self}, resp)
            });
            defer.resolve();
            return defer.promise();
          }
          else { // create a new query

            var promise = api.request(apiRequest, {
              done: function() {
                self._cache.put(requestKey, arguments);
                self.onApiResponse.apply(this, arguments);
              },
              fail: function() {
                self._cache.invalidate(requestKey);
                self.onApiRequestFailure.apply(this, arguments);
              },
              context: {request:apiRequest, key: senderKey, requestKey:requestKey, qm: self }
            });
            this._cache.put(requestKey, promise);
            return promise;
          }
        }
        else {
          return api.request(apiRequest, {
            done: this.onApiResponse,
            fail: this.onApiRequestFailure,
            context: {request:apiRequest, key: senderKey, requestKey:requestKey, qm: this }
          });
        }

      },


      onApiResponse: function(data, textStatus, jqXHR ) {
        var qm = this.qm;
        if (qm.debug)
          console.log('[QM]: received response:', JSON.stringify(data).substring(0, 1000));

        // TODO: check the status responses

        var response = (data.responseHeader && data.responseHeader.QTime) ? new ApiResponse(data) : new JsonResponse(data);

        response.setApiQuery(this.request.get('query'));

        if (qm.debug)
          console.log('[QM]: sending response:', this.key.getId());

        var pubsub = qm.getBeeHive().Services.get('PubSub');

        if (pubsub)
          pubsub.publish(this.key, pubsub.DELIVERING_RESPONSE+this.key.getId(), response);

        if (qm.failedRequestsCache.getIfPresent(this.requestKey)) {
          qm.failedRequestsCache.invalidate(this.requestKey);
        }

      },

      onApiRequestFailure: function( jqXHR, textStatus, errorThrown ) {
        var qm = this.qm;
        var query = this.request.get('query');
        if (qm.debug) {
          console.warn('[QM]: request failed', jqXHR, textStatus, errorThrown);
        }

        var errCount = qm.failedRequestsCache.getSync(this.requestKey) || 0;
        qm.failedRequestsCache.put(this.requestKey, errCount+1);

        if (qm.tryToRecover.apply(this, arguments)) {
          console.warn("[QM]: attempting recovery");
          return true; // means we are trying to recover
        }

        var feedback = new ApiFeedback({code:jqXHR.status, msg:textStatus});
        try {
          feedback.setCode(jqXHR.status);
        }
        catch(e) {
          console.error(e.stack);
        }

        if (this.request) {
          feedback.setApiRequest(this.request);
        }
        feedback.setSenderKey(this.key);

        var pubsub = qm.getBeeHive().Services.get('PubSub');
        if (pubsub)
          pubsub.publish(this.key, pubsub.FEEDBACK, feedback);

        return false; // means: we gave up
      },

      /**
       * Method that receives the same arguments as the error callback. It can try to
       * recover (re-issue) the request. Note: it doesn't need to check whether the
       * recovery is needed - if we are here, it means 'do what you can to recover'
       *
       * This method MUST return 'true' when the request was resent. If it doesn't
       * return 'true' the sender will be notified about the error.
       *
       * If it returns a Feedback object, the sender will be notified using it
       *
       * @param jqXHR
       * @param textStatus
       * @param errorThrown
       */
      tryToRecover: function(jqXHR, textStatus, errorThrown) {
        var qm = this.qm; // QueryMediator
        var senderKey = this.key;
        var request = this.request;
        var requestKey = this.requestKey;

        var status = jqXHR.status;
        if (status) {
          switch(status) {
            case 408: // proxy timeout
            case 504: // gateway timeout
            case 503: // service unavailable
              setTimeout(function() {
                // we can remove the entry from the cache, because
                // if they eventually succeed, sender will receive
                // its data (because the promise object inside the
                // cache contains the function to call delivery
                if (qm._cache) {
                  var resp = qm._cache.getSync(requestKey);
                  if (resp && resp.promise) {
                    qm._cache.invalidate(requestKey);
                  }
                  else if (resp) {
                    // it must have succeeded, good!
                    return;
                  }
                }
                // re-send the query
                qm._executeRequest.call(qm, request, senderKey);
              }, qm.recoveryDelayInMs);
              return true;
              break;

            default:
            //TBD
          }
        }
      },

      /**
       * Creates a unique, cleaned key from the request and the apiQuery
       * @param apiRequest
       */
      _getCacheKey: function(apiRequest) {
        var oldQ = apiRequest.get('query');
        var newQ = this.queryUpdater.clean(oldQ);
        apiRequest.set('query', newQ);
        var key = apiRequest.url();
        apiRequest.set('query', oldQ);
        return key;
      },

      reset: function() {
        this.__searchCycle = {waiting:{}, inprogress: {}}; //reset the datastruct
        if (this._cache) {
          this._cache.invalidateAll();
        }
      }

    });

    _.extend(QueryMediator.prototype, Mixins.BeeHive);
    return QueryMediator;
  });