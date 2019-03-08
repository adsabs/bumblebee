/**
 * Helper class that extends LoT - it is used by widgets that display details
 * of a paper (one identifier search)
 * so widgets on the abstract page (references, citations, etc)
 */

define([
  './widget',
  'js/mixins/add_stable_index_to_collection',
  'js/mixins/link_generator_mixin',
  'js/mixins/papers_utils',
  'js/components/api_query'
],
function (
  ListOfThings,
  PaginationMixin,
  LinkGenerator,
  PapersUtilsMixin,
  ApiQuery
) {
  var DetailsWidget = ListOfThings.extend({
    defaultQueryArguments: {
      fl: 'title,bibcode,author,keyword,pub,aff,volume,year,[citations],property,pubdate,abstract,esources,data',
      rows: 25,
      start: 0
    },

    initialize: function (options) {
      ListOfThings.prototype.initialize.call(this, options);
      var title = '';
      // other widgets can send us data through page manager
      // here it is used just to get the title of the main article page
      this.on('page-manager-message', function (event, data) {
        if (event === 'broadcast-payload') {
          this.canLoad = false;
          title = data.title;
          this.ingestBroadcastedPayload(data);
        }

        if (event === 'widget-selected' && data.idAttribute === this.name && !this.canLoad) {
          this.canLoad = true;
          var self = this;

          // update title here, with delay to account for issues with rendering
          setTimeout(function () {
            self.model.set('title', title);
          }, 0);
          this.dispatchRequest(data.bibcode);
        }
      });

      // clear the collection when the model is reset with a new bibcode
      // and set the model to default values
      this.listenTo(this.model, 'change:bibcode', function () {
        this.reset();
      });
    },

    activate: function (beehive) {
      ListOfThings.prototype.activate.apply(this, [].slice.apply(arguments));
      var pubsub = beehive.getService('PubSub');
      _.bindAll(this, 'dispatchRequest', 'processResponse');

      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.dispatchRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
    },


    ingestBroadcastedPayload: _.noop,

    dispatchRequest: function (bibcodeOrQuery) {

      var apiQuery = bibcodeOrQuery;
      if (!(bibcodeOrQuery instanceof ApiQuery) && _.isString(bibcodeOrQuery)) {
        apiQuery = new ApiQuery({ q: 'bibcode:' + bibcodeOrQuery });
      }

      // do not continue unless we have been selected
      if (!this.canLoad) return;

      // reset the record
      try {
        var q = apiQuery.get('q');
        if (q && q[0]) {
          this.model.set('bibcode', q[0].match(/bibcode:(.*)/)[1]);
        }
      } catch (e) {
        console.error('was unable to parse the bibcode!');
        return;
      }

      // dispatch the request
      ListOfThings.prototype.dispatchRequest.call(this, apiQuery);
    },

    customizeQuery: function () {
      var q = ListOfThings.prototype.customizeQuery.apply(this, arguments);
      if (Marionette.getOption(this, 'sortOrder')) {
        q.set('sort', Marionette.getOption(this, 'sortOrder'));
      }
      if (this.model.get('queryOperator')) {
        var query = this.model.get('queryOperator') + '(' + q.get('q').join(' ') + ')';
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

    extractValueFromQuery: function (apiQuery, key, indexName) {
      if (apiQuery.has(key)) {
        var v = apiQuery.get(key);
        for (var i = 0; i < v.length; i++) {
          if (v[i].indexOf(indexName + ':') > -1) {
            var w = v[i].replace(new RegExp(indexName + ':', 'g'), '');
            return w.replace(/\\?\"/g, '');
          }
        }
      }
    },

    processDocs: function (apiResponse, docs, paginationInfo) {
      var self = this;
      var params = apiResponse.get('response');
      var start = params.start || (paginationInfo.start || 0);

      _.each(docs, function (d, i) {
        docs[i] = self.prepareDocForViewing(d);
      });

      try {
        docs = this.parseLinksData(docs);
      } catch (e) {
        // do nothing
      }
      return PaginationMixin.addPaginationToDocs(docs, start);
    }
  });

  _.extend(DetailsWidget.prototype, LinkGenerator);
  _.extend(DetailsWidget.prototype, PapersUtilsMixin);

  return DetailsWidget;
});
