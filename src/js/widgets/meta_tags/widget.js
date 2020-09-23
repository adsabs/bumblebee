define([
  'jquery',
  'backbone',
  'underscore',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/meta_tags/template/metatags',
  'js/mixins/link_generator_mixin',
], function($, Backbone, _, BaseWidget, metatagsTemplate, LinkGenerator) {
  var View = Backbone.View.extend({
    destroy: function() {
      this.remove();
    },
  });

  var Widget = BaseWidget.extend({
    initialize: function(options) {
      this.options = options || {};
      this.view = new View();
      this._bibcode = null;
    },
    activate: function(beehive) {
      this.setBeeHive(beehive);
      var pubsub = beehive.getService('PubSub');
      _.bindAll(this, ['onDisplayDocuments', 'processResponse']);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
    },
    processResponse: function(apiResponse) {
      var data = apiResponse.get('response.docs[0]', false, {});
      this.updateMetaTags(data);
    },
    getCachedDoc: function(bibcode) {
      const fields = this.defaultQueryArguments.fl.split(',');

      // Attempt to shortcut the request by using stashed docs
      const docs = this.getBeeHive()
        .getObject('DocStashController')
        .getDocs();

      const found = docs.find((doc) => doc.bibcode === bibcode);

      if (found) {
        // Most will have DOIs, but account for other identifier formats
        // These are optional
        const finalDoc = {
          issn: undefined,
          isbn: undefined,
          ...found,
        };

        const keys = Object.keys(finalDoc);
        const hasRequiredKeys = fields.every((f) => keys.includes(f));
        return hasRequiredKeys ? finalDoc : null;
      }
      return null;
    },
    onDisplayDocuments: function(apiQuery) {
      var currentQuery = this.getCurrentQuery();
      if (_.isEqual(currentQuery.toJSON(), apiQuery.toJSON())) {
        return;
      }
      this.setCurrentQuery(apiQuery);
      const bibcode = this.parseIdentifierFromQuery(apiQuery);

      if (bibcode === 'null') {
        return;
      }

      var doc = this.getCachedDoc(bibcode);

      if (doc) {
        this.updateMetaTags(doc);
        return;
      }

      this.dispatchRequest(apiQuery.clone());
    },
    updateMetaTags: function(data) {
      data.url = Backbone.history.location.href;

      var sources = {};
      try {
        sources = this.parseResourcesData(data);
      } catch (e) {
        // do nothing
      }

      // Look for `PDF` in title of the source
      if (
        _.isArray(sources.fullTextSources) &&
        sources.fullTextSources.length > 0
      ) {
        var found = _.find(sources.fullTextSources, function(source) {
          return /PDF/.test(source.name);
        });
        if (found) {
          data.pdfUrl = found.url;
        }
      }

      if (_.isArray(data.doi) && data.doi.length > 0) {
        data.doi = data.doi[0];
      }

      if (data.aff && data.author) {
        data.author = _.map(data.author, function(author, n) {
          return {
            name: author,
            aff: data.aff[n],
          };
        });
      }

      // Update the <head> with the meta tags
      $('head').append(function() {
        return $(metatagsTemplate(data)).filter(function() {
          var name = $(this).attr('name');
          if (name) {
            // check to see if the tag already exists
            return !$('head>meta[name="' + name + '"]').length;
          }
          return true;
        });
      });

      // fire off dom events
      this.emitDOMEvents();
    },
    /**
     * Emit DOM events following render of metatags
     * this helps third-party extensions/applications which rely on events for
     * performing actions on the page
     */
    emitDOMEvents: function() {
      _.forEach(['ZoteroItemUpdated', 'ADSPageLoaded'], function(ev) {
        window.document.dispatchEvent(new Event(ev), {
          bubbles: true,
          cancelable: true,
        });
      });
    },
    defaultQueryArguments: {
      fl:
        'links_data,[citations],keyword,property,first_author,year,issn,isbn,title,aff,abstract,bibcode,pub,pub_raw,volume,author,issue,pubdate,doi,page,esources,data',
      rows: 1,
    },
  });

  _.extend(Widget.prototype, LinkGenerator);
  return Widget;
});
