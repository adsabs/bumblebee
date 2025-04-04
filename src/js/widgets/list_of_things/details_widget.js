/**
 * Helper class that extends LoT - it is used by widgets that display details
 * of a paper (one identifier search)
 * so widgets on the abstract page (references, citations, etc)
 */

define([
  'js/widgets/list_of_things/widget',
  'js/mixins/add_stable_index_to_collection',
  'js/mixins/link_generator_mixin',
  'js/mixins/papers_utils',
  'js/components/api_query',
], function(
  ListOfThings,
  PaginationMixin,
  LinkGenerator,
  PapersUtilsMixin,
  ApiQuery
) {
  var DetailsWidget = ListOfThings.extend({
    defaultQueryArguments: {
      fl:
        'title,bibcode,author,keyword,pub,volume,year,[citations],property,pubdate,abstract,esources,data',
      rows: 25,
      start: 0,
    },

    initialize: function(options) {
      ListOfThings.prototype.initialize.call(this, options);

      // other widgets can send us data through page manager
      // here it is used just to get the title of the main article page
      this.on('page-manager-message', function(event, data) {
        if (event === 'broadcast-payload') {
          // set the current title
          this.model.set({
            title: data.title,

            // hide checkboxes on abstract sub-pages
            showCheckboxes: false,
          });
          this.canLoad = false;
          this.ingestBroadcastedPayload(data);
        }

        if (
          event === 'widget-selected' &&
          data.idAttribute === this.name &&
          !this.canLoad
        ) {
          var doDispatch = _.bind(function() {
            this.canLoad = true;

            // have to delay this so the view has to time to initialize
            setTimeout(
              _.bind(function(title) {
                if (!this.model.has('title')) {
                  this.model.set('title', title);
                }
              }, this),
              0,
              this.model.get('title')
            );
            this.dispatchRequest(data.bibcode);
          }, this);

          doDispatch();
        }
      });

      // clear the collection when the model is reset with a new bibcode
      // and set the model to default values
      this.listenTo(this.model, 'change:bibcode', function() {
        this.reset();
      });
    },

    activate: function(beehive) {
      ListOfThings.prototype.activate.apply(this, [].slice.apply(arguments));
      var pubsub = beehive.getService('PubSub');
      _.bindAll(this, 'dispatchRequest', 'processResponse');

      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.dispatchRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
    },

    ingestBroadcastedPayload: _.noop,

    dispatchRequest: function(bibcodeOrQuery) {
      var apiQuery = bibcodeOrQuery;
      if (!(bibcodeOrQuery instanceof ApiQuery) && _.isString(bibcodeOrQuery)) {
        apiQuery = new ApiQuery({ q: 'identifier:' + bibcodeOrQuery });
      }

      // do not continue unless we have been selected
      if (!this.canLoad) return;

      // reset the record
      try {
        var q = apiQuery.get('q');
        if (q && q[0]) {
          const bibcode = this.parseIdentifierFromQuery(apiQuery);
          if (bibcode === 'null' || this.model.get('bibcode') === bibcode) {
            return;
          }
          this.model.set('bibcode', bibcode);
        }
      } catch (e) {
        console.error('was unable to parse the bibcode!');
        return;
      }

      // dispatch the request
      ListOfThings.prototype.dispatchRequest.call(this, apiQuery);
    },

    customizeQuery: function() {
      var q = ListOfThings.prototype.customizeQuery.apply(this, arguments);
      if (Marionette.getOption(this, 'sortOrder')) {
        q.set('sort', Marionette.getOption(this, 'sortOrder'));
      }
      if (this.model.get('queryOperator')) {
        var query =
          this.model.get('queryOperator') + '(' + q.get('q').join(' ') + ')';
        // special case for trending aka 'also read'
        if (this.model.get('queryOperator') === 'trending') {
          // remove the bibcode from the set of returned results by
          // augmenting the query
          query += '-' + q.get('q')[0];
        }
      } else {
        // toc widget
        query = q.get('q');
      }
      q.set('q', query);
      return q;
    },

    processDocs: function(apiResponse, docs, paginationInfo) {
      var self = this;
      var params = apiResponse.get('response');
      var start = params.start || paginationInfo.start || 0;

      _.each(docs, function(d, i) {
        docs[i] = self.prepareDocForViewing(d);
      });

      try {
        docs = this.parseLinksData(docs);
      } catch (e) {
        // do nothing
      }
      return PaginationMixin.addPaginationToDocs(docs, start);
    },
  });

  _.extend(DetailsWidget.prototype, LinkGenerator);
  _.extend(DetailsWidget.prototype, PapersUtilsMixin);

  return DetailsWidget;
});
