/**
 * Created by alex on 5/19/14.
 */
define([
  'marionette',
  'js/components/api_request',
  'js/components/api_targets',
  'clipboard',
  'backbone',
  'jquery',
  'underscore',
  'cache',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/abstract/templates/abstract_template',
  'js/components/api_query',
  'js/mixins/link_generator_mixin',
  'js/mixins/papers_utils',
  'mathjax',
  'bootstrap',
  'utils',
  'analytics',
], function(
  Marionette,
  ApiRequest,
  ApiTargets,
  Clipboard,
  Backbone,
  $,
  _,
  Cache,
  BaseWidget,
  abstractTemplate,
  ApiQuery,
  LinkGeneratorMixin,
  PapersUtils,
  MathJax,
  Bootstrap,
  utils,
  analytics
) {
  const MAX_AUTHORS = 20;

  var AbstractModel = Backbone.Model.extend({
    defaults: function() {
      return {
        abstract: undefined,
        title: undefined,
        authorAff: undefined,
        page: undefined,
        pub: undefined,
        pubdate: undefined,
        keywords: undefined,
        bibcode: undefined,
        pub_raw: undefined,
        doi: undefined,
        citation_count: undefined,
        titleLink: undefined,
        pubnote: undefined,
        loading: true,
        error: false,
      };
    },

    parse: function(doc, maxAuthors = MAX_AUTHORS) {
      const getDOIUrl = (doi) =>
        LinkGeneratorMixin.createUrlByType(doc.bibcode, 'doi', doi);

      // generate URLs for each doi
      doc.doi = Array.isArray(doc.doi)
        ? doc.doi.map((doi) => ({ doi, href: getDOIUrl(doi) }))
        : doc.doi
        ? [{ doi: doc.doi, href: getDOIUrl(doc.doi) }]
        : doc.doi;

      // "aff" is the name of the affiliations array that comes from solr
      doc.aff = Array.isArray(doc.aff) ? doc.aff : [];
      doc.author = Array.isArray(doc.author) ? doc.author : [];

      // remove html-encoding from affiliations
      doc.aff = doc.aff.map(_.unescape);

      const numAuthors = doc.author.length;
      
      // Check if we have truncated data (fewer affiliations than authors might indicate limited field data)
      const hasTruncatedData = doc.aff.length > 0 && doc.aff.length < numAuthors;
      
      // Create default lists, but only for the length we actually have data for
      const createDefaultList = (length) => _.range(length).map(() => '-');
      const defaultList = createDefaultList(numAuthors);
      
      if (doc.aff.length) {
        doc.hasAffiliation = _.without(doc.aff, '-').length;

        // If we have truncated data, don't create placeholders for missing affiliations
        if (hasTruncatedData) {
          // Only create authorAff entries for authors that have affiliation data
          const availableAuthors = doc.author.slice(0, doc.aff.length);
          const availableOrcidPub = doc.orcid_pub ? doc.orcid_pub.slice(0, doc.aff.length) : createDefaultList(doc.aff.length);
          const availableOrcidUser = doc.orcid_user ? doc.orcid_user.slice(0, doc.aff.length) : createDefaultList(doc.aff.length);
          const availableOrcidOther = doc.orcid_other ? doc.orcid_other.slice(0, doc.aff.length) : createDefaultList(doc.aff.length);
          
          doc.authorAff = _.zip(
            availableAuthors,
            doc.aff,
            availableOrcidPub,
            availableOrcidUser,
            availableOrcidOther
          );
          
          // Store the remaining authors separately for potential lazy loading
          if (numAuthors > doc.aff.length) {
            doc.truncatedAuthorCount = numAuthors - doc.aff.length;
            doc.remainingAuthors = doc.author.slice(doc.aff.length);
          } else {
            doc.truncatedAuthorCount = 0;
            doc.remainingAuthors = [];
          }
        } else {
          // Normal case - we have complete data
          doc.authorAff = _.zip(
            doc.author,
            doc.aff,
            doc.orcid_pub ? doc.orcid_pub : defaultList,
            doc.orcid_user ? doc.orcid_user : defaultList,
            doc.orcid_other ? doc.orcid_other : defaultList
          );
          doc.truncatedAuthorCount = 0;
          doc.remainingAuthors = [];
        }
      } else if (doc.author) {
        doc.hasAffiliation = false;
        doc.authorAff = _.zip(
          doc.author,
          _.range(doc.author.length),
          doc.orcid_pub ? doc.orcid_pub : defaultList,
          doc.orcid_user ? doc.orcid_user : defaultList,
          doc.orcid_other ? doc.orcid_other : defaultList
        );
      }

      if (doc.page && doc.page.length) {
        doc.page = doc.page[0];
      }

      // only true if there was an author array
      // now add urls
      if (doc.authorAff) {
        _.each(doc.authorAff, function(el, index) {
          doc.authorAff[index][5] = encodeURIComponent(
            '"' + el[0] + '"'
          ).replace(/%20/g, '+');
        });

        if (doc.authorAff.length > maxAuthors) {
          doc.authorAffExtra = doc.authorAff.slice(
            maxAuthors,
            doc.authorAff.length
          );
          doc.authorAff = doc.authorAff.slice(0, maxAuthors);
        }

        doc.hasMoreAuthors = doc.authorAffExtra && doc.authorAffExtra.length;
      }

      if (doc.pubdate) {
        doc.formattedDate = PapersUtils.formatDate(doc.pubdate, {
          format: 'MMMM DD YYYY',
          missing: { day: 'MMMM YYYY', month: 'YYYY' },
        });
      }

      if (doc.title && doc.title.length) {
        doc.title = doc.title[0];
        var docTitleLink = doc.title.match(/<a.*href="(.*?)".*?>(.*)<\/a>/i);

        // Find any links that are buried in the text of the title
        // Parse it out and convert to BBB hash links, if necessary
        if (docTitleLink) {
          doc.title = doc.title.replace(docTitleLink[0], '').trim();
          doc.titleLink = {
            href: docTitleLink[1],
            text: docTitleLink[2],
          };

          if (doc.titleLink.href.match(/^\/abs/)) {
            doc.titleLink.href = '#' + doc.titleLink.href.slice(1);
          }
        }
      }

      if (doc.comment) {
        doc.comment = _.unescape(doc.comment);
      }

      if (doc.pubnote) {
        doc.pubnote = _.unescape(doc.pubnote);
      }

      // handle book_author field
      if (
        doc.book_author &&
        Array.isArray(doc.book_author) &&
        doc.book_author.length > 0
      ) {
        doc.book_author = doc.book_author.map((name, i) => ({
          name,
          href: `#search?q=book_author:"${name}"&sort=date%20desc,%20bibcode%20desc`,
          delim: i < doc.book_author.length - 1 ? '; ' : '',
        }));
      }

      const ids = Array.isArray(doc.identifier)
        ? doc.identifier
        : doc.original_identifier;
      const id = (ids || []).find((v) => v.match(/^arxiv/i));
      if (id) {
        doc.arxiv = {
          id: id,
          href: LinkGeneratorMixin.createUrlByType(
            doc.bibcode,
            'arxiv',
            id.split(':')[1]
          ),
        };
      }

      return doc;
    },
  });

  var AbstractView = Marionette.ItemView.extend({
    tagName: 'article',

    className: 's-abstract-metadata',

    modelEvents: {
      change: 'render',
    },

    template: abstractTemplate,

    events: {
      'click #toggle-aff': 'toggleAffiliation',
      'click #toggle-more-authors': 'toggleMoreAuthors',
      'click a[data-target="more-authors"]': 'toggleMoreAuthors',
      'click a[target="prev"]': 'onClick',
      'click a[target="next"]': 'onClick',
      'click a[data-target="DOI"]': 'emitAnalytics',
      'click a[data-target="arXiv"]': 'emitAnalytics',
      'mouseenter .orcid-author': 'highlightOrcidAuthor',
      'mouseleave .orcid-author': 'unhighlightOrcidAuthor',
    },

    highlightOrcidAuthor: function(e) {
      const $target = $(e.currentTarget);
      const $active = $target.find('.active');
      if ($active.hasClass('hidden')) {
        $active.removeClass('hidden');
        $target.find('.inactive').addClass('hidden');
      }
    },

    unhighlightOrcidAuthor: function(e) {
      const $target = $(e.currentTarget);
      const $inactive = $target.find('.inactive');
      if ($inactive.hasClass('hidden')) {
        $inactive.removeClass('hidden');
        $target.find('.active').addClass('hidden');
      }
    },

    toggleMoreAuthors: function() {
      this.$('.author.extra').toggleClass('hide');
      this.$('.author .extra-dots').toggleClass('hide');
      if (this.$('.author.extra').hasClass('hide')) {
        this.$('#toggle-more-authors').text('Show all authors');
      } else {
        this.$('#toggle-more-authors').text('Hide authors');
      }
      return false;
    },

    toggleAffiliation: function() {
      this.$('fail-aff').hide();
      this.$('#pending-aff').show();
      this.trigger('fetchAffiliations', (err) => {
        this.$('#pending-aff').hide();
        if (err) {
          this.$('#fail-aff').show();
          setTimeout(() => {
            this.$('#fail-aff').hide();
          }, 3000);
          return;
        }
        this.$('.affiliation').toggleClass('hide');
        if (this.$('.affiliation').hasClass('hide')) {
          this.$('#toggle-aff').text('Show affiliations');
        } else {
          this.$('#toggle-aff').text('Hide affiliations');
        }
      });
      return false;
    },

    onClick: function(ev) {
      this.trigger($(ev.target).attr('target'));
      return false;
    },

    emitAnalytics: function (e) {
    },

    copyBibcode() {
      if (!this.bibcodeClipboard) {
        this.bibcodeClipboard = new Clipboard('#abs-bibcode-copy');
        this.bibcodeClipboard.on('success', () => {
          $('#abs-bibcode-copy-msg')
            .show()
            .fadeOut(1000);
        });
      }
    },

    onRender: function() {
      this.$('.icon-help').popover({
        trigger: 'hover',
        placement: 'right',
        html: true,
        container: 'body',
      });

      if (MathJax) {
        MathJax.Hub.Queue([
          'Typeset',
          MathJax.Hub,
          this.$('.s-abstract-title', this.el).get(0),
        ]);
        MathJax.Hub.Queue([
          'Typeset',
          MathJax.Hub,
          this.$('.s-abstract-text', this.el).get(0),
        ]);
      }
      this.copyBibcode();
    },
  });

  var AbstractWidget = BaseWidget.extend({
    initialize: function(options) {
      options = options || {};
      this.model = options.data
        ? new AbstractModel(options.data, { parse: true })
        : new AbstractModel();
      this.view = utils.withPrerenderedContent(
        new AbstractView({ model: this.model })
      );
      this.listenTo(this.view, 'all', this.onAllInternalEvents);

      BaseWidget.prototype.initialize.apply(this, arguments);
      this._docs = {};
      this.maxAuthors = MAX_AUTHORS;
      this.isFetchingAff = false;
      this.listenTo(this.model, 'change:bibcode', this._onAbstractLoaded);
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);
      var pubsub = beehive.getService('PubSub');

      _.bindAll(this, [
        'onNewQuery',
        'dispatchRequest',
        'processResponse',
        'onDisplayDocuments',
      ]);
      pubsub.subscribe(pubsub.START_SEARCH, this.onNewQuery);
      pubsub.subscribe(pubsub.INVITING_REQUEST, this.dispatchRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
    },

    onApiFeedback: function(feedback) {
      // there was an error
      if (feedback && feedback.error) {
        this.showError();
        this.updateState(this.STATES.ERRORED);
      }
    },

    defaultQueryArguments: {
      fl:
        'identifier,[citations],abstract,author,book_author,orcid_pub,publisher,orcid_user,orcid_other,bibcode,citation_count,comment,doi,id,keyword,page,property,pub,pub_raw,pubdate,pubnote,read_count,title,volume,database',
      rows: 1,
    },

    mergeStashedDocs: function(docs) {
      _.each(
        docs,
        function(d) {
          if (!this._docs[d.bibcode]) {
            this._docs[d.bibcode] = this.model.parse(d);
          }
        },
        this
      );
    },

    onNewQuery: function(apiQuery) {
      // only empty docs array if it truly is a new query
      var newQueryJSON = apiQuery.toJSON();

      var currentStreamlined = _.pick(
        this.getCurrentQuery().toJSON(),
        _.keys(newQueryJSON)
      );
      if (JSON.stringify(newQueryJSON) !== JSON.stringify(currentStreamlined)) {
        this._docs = {};
      }
    },

    dispatchRequest: function(apiQuery) {
      this.setCurrentQuery(apiQuery);
      BaseWidget.prototype.dispatchRequest.apply(this, arguments);
    },

    // bibcode is already in _docs
    displayBibcode: function(bibcode) {
      // if _docs is empty, stop here
      if (_.isEmpty(this._docs)) {
        return;
      }

      // wipe out the former values, because this new set of data
      // might not have every key
      this.model.clear({ silent: true });
      this.model.set(this._docs[bibcode]);

      // Check if we need to fetch complete author data
      if (this.needsCompleteAuthorData(this._docs[bibcode])) {
        this.fetchAffiliations(() => {
          // Data has been refreshed, re-render will happen automatically
        });
      }

      this._current = bibcode;
      // let other widgets know details
      var c = this._docs[bibcode]['[citations]'] || {
        num_citations: 0,
        num_references: 0,
      };
      var resolvedCitations = c ? c.num_citations : 0;

      this.trigger('page-manager-event', 'broadcast-payload', {
        title: this._docs[bibcode].title,
        abstract: this._docs[bibcode].abstract,
        // this should be superfluous, widgets already subscribe to display_documents
        bibcode: bibcode,

        // used by citation list widget
        citation_discrepancy:
          this._docs[bibcode].citation_count - resolvedCitations,
        citation_count: this._docs[bibcode].citation_count,
        references_count: c.num_references,
        read_count: this._docs[bibcode].read_count,
        property: this._docs[bibcode].property,
      });

      if (this.hasPubSub()) {
        var ps = this.getPubSub();
        ps.publish(
          ps.CUSTOM_EVENT,
          'update-document-title',
          this._docs[bibcode].title
        );
      }
      this.updateState(this.STATES.IDLE);
    },

    onAbstractPage: function() {
      // hacky way of confirming the page we're on
      return /\/abstract$/.test(Backbone.history.getFragment());
    },

    onDisplayDocuments: function(apiQuery) {
      this.updateState(this.STATES.LOADING);
      let stashedDocs = [];
      // check to see if a query is already in progress (the way bbb is set up, it will be)
      // if so, auto fill with docs initially requested by results widget
      try {
        stashedDocs = this.getBeeHive()
          .getObject('DocStashController')
          .getDocs();
      } catch (e) {
        stashedDocs = [];
      } finally {
        this.mergeStashedDocs(stashedDocs);
      }

      const bibcode = this.parseIdentifierFromQuery(apiQuery);

      if (bibcode === 'null') {
        var msg = { numFound: 0, noDocs: true };
        this.showError({ noDocs: true });
        this.trigger('page-manager-event', 'widget-ready', msg);
        return;
      }

      if (this._docs[bibcode]) {
        // we have already loaded it
        this.displayBibcode(bibcode);
      } else {
        if (apiQuery.has('__show')) return; // cycle protection
        const q = apiQuery.clone();
        q.set('__show', bibcode);
        // this will add required fields
        this.dispatchRequest(q);
      }
    },

    onAllInternalEvents: function(ev, arg1) {
      if ((ev === 'next' || ev === 'prev') && this._current) {
        var keys = _.keys(this._docs);
        var pubsub = this.getPubSub();
        var curr = _.indexOf(keys, this._current);
        if (curr > -1) {
          if (ev === 'next' && curr + 1 < keys.length) {
            pubsub.publish(pubsub.DISPLAY_DOCUMENTS, keys[curr + 1]);
          } else if (curr - 1 > 0) {
            pubsub.publish(pubsub.DISPLAY_DOCUMENTS, keys[curr - 1]);
          }
        }
      }

      if (ev === 'fetchAffiliations') {
        this.fetchAffiliations(arg1);
      }
    },

    fetchAffiliations: function(cb) {
      const currentData = this.model.toJSON();
      const needsCompleteData = this.needsCompleteAuthorData(currentData);
      
      if (
        ((!this.model.has('aff') || this.model.get('aff').length === 0) || needsCompleteData) &&
        !this.isFetchingAff
      ) {
        this.isFetchingAff = true;
        const ps = this.getPubSub();
        const query = this.getCurrentQuery().clone();
        query.unlock();
        const { bibcode, } = currentData;
        query.set('q', `identifier:${bibcode}`);
        query.set('fl', this.defaultQueryArguments.fl);
        query.set('rows', 1);
        ps.publish(
          ps.EXECUTE_REQUEST,
          new ApiRequest({
            target: ApiTargets.SEARCH,
            query: query,
            options: {
              always: () => {
                this.isFetchingAff = false;
              },
              done: (resp) => {
                if (
                  resp &&
                  resp.response &&
                  resp.response.docs &&
                  resp.response.docs.length > 0
                ) {
                  const freshDoc = resp.response.docs[0];
                  const newEntries = this.model.parse(freshDoc);
                  this._docs[bibcode] = {
                    ...this._docs[bibcode],
                    ...newEntries,
                  };
                  this.model.set(newEntries);
                }
                cb();
              },
              fail: (err) => {
                cb(err);
              },
            },
          })
        );
      } else {
        cb();
      }
    },

    needsCompleteAuthorData: function(doc) {
      // If we have truncatedAuthorCount, we definitely need complete data
      if (doc.truncatedAuthorCount && doc.truncatedAuthorCount > 0) {
        return true;
      }
      
      // If we have authors but no affiliations, we might need complete data
      if (doc.author && doc.author.length > 0 && (!doc.aff || doc.aff.length === 0)) {
        return true;
      }
      
      // If we have significantly fewer affiliations than authors, we likely have truncated data
      if (doc.author && doc.aff && doc.author.length > doc.aff.length + 2) {
        return true;
      }
      
      return false;
    },

    _onAbstractLoaded: function() {
      const doc = this.model.toJSON();
      const ps = this.getPubSub();
      if (ps && doc) {
        ps.publish(ps.CUSTOM_EVENT, 'latest-abstract-data', doc);
      }
    },

    processResponse: function(apiResponse) {
      var r = apiResponse.toJSON();
      var self = this;
      if (r.response && r.response.docs) {
        var docs = r.response.docs;
        var __show = apiResponse.get('responseHeader.params.__show', false, '');
        _.each(docs, function(doc) {
          var d = self.model.parse(doc, self.maxAuthors);
          var ids = d.identifier;

          // if __show is defined and it is found in the list of identifiers or only a single document
          // was provided - then set the __show value to the bibcode of the document
          if (
            __show &&
            ((ids && ids.length > 0 && _.contains(ids, __show)) ||
              docs.length === 1)
          ) {
            __show = d.bibcode;
          }
          self._docs[d.bibcode] = d;
        });

        if (__show) {
          this.displayBibcode(__show);
        }
      }

      var msg = {};
      msg.numFound = apiResponse.get('response.numFound', false, 0);
      if (msg.numFound === 0) {
        this.showError({ noDocs: true });
        msg.noDocs = true;
      }
      this.trigger('page-manager-event', 'widget-ready', msg);
    },

    showError: function(opts) {
      const options = opts || {};

      // if noDocs, do not set error
      this.model.set({
        error: !options.noDocs,
        loading: false,
      });
    },
  });

  return AbstractWidget;
});
