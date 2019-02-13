/**
 * Created by alex on 5/19/14.
 */
define([
  'marionette',
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
  'bootstrap'
],
function (
  Marionette,
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
  Bootstrap
) {
  var MAX_COMMENTS = 3;

  var AbstractModel = Backbone.Model.extend({
    defaults: function () {
      return {
        'abstract': undefined,
        'title': undefined,
        'authorAff': undefined,
        'page': undefined,
        'pub': undefined,
        'pubdate': undefined,
        'keywords': undefined,
        'bibcode': undefined,
        'pub_raw': undefined,
        'doi': undefined,
        'citation_count': undefined,
        'titleLink': undefined,
        'pubnote': undefined,
        'loading': true,
        'error': false
      };
    },

    parse: function (doc, maxAuthors) {
      var maxAuthors = maxAuthors || 20;

      // add doi link
      if (_.isArray(doc.doi) && _.isPlainObject(LinkGeneratorMixin)) {
        doc.doi = { doi: doc.doi, href: LinkGeneratorMixin.createUrlByType(doc.bibcode, 'doi', doc.doi) };
      }
      // "aff" is the name of the affiliations array that comes from solr
      doc.aff = doc.aff || [];

      if (doc.aff.length) {
        doc.hasAffiliation = _.without(doc.aff, '-').length;
        // joining author and aff
        doc.authorAff = _.zip(doc.author, doc.aff);
      } else if (doc.author) {
        doc.hasAffiliation = false;
        doc.authorAff = _.zip(doc.author, _.range(doc.author.length));
      }

      if (doc.page && doc.page.length) {
        doc.page = doc.page[0];
      }

      // only true if there was an author array
      // now add urls
      if (doc.authorAff) {
        _.each(doc.authorAff, function (el, index) {
          doc.authorAff[index][2] = encodeURIComponent('"' + el[0] + '"').replace(/%20/g, '+');
        });

        if (doc.authorAff.length > maxAuthors) {
          doc.authorAffExtra = doc.authorAff.slice(maxAuthors, doc.authorAff.length);
          doc.authorAff = doc.authorAff.slice(0, maxAuthors);
        }

        doc.hasMoreAuthors = doc.authorAffExtra && doc.authorAffExtra.length;
      }

      if (doc.pubdate) {
        doc.formattedDate = PapersUtils.formatDate(doc.pubdate, { format: 'MM d yy', missing: { day: 'MM yy', month: 'yy' } });
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
            text: docTitleLink[2]
          };

          if (doc.titleLink.href.match(/^\/abs/)) {
            doc.titleLink.href = '#' + doc.titleLink.href.slice(1);
          }
        }
      }

      if (doc.comment) {
        if (!_.isArray(doc.comment)) {
          doc.comment = [doc.comment];
        }

        var tmp = doc.comment;
        // attempt to parse it out
        try {
          doc.comment = doc.comment[0].split(';');
        } catch (e) {
          // do nothing
          doc.comment = tmp;
        }
        doc.hasExtraComments = doc.comment.length > MAX_COMMENTS;
        doc.commentList = _.first(doc.comment, MAX_COMMENTS);
      }

      if (doc.pubnote) {
        if (!_.isArray(doc.pubnote)) {
          doc.pubnote = [doc.pubnote];
        }

        var tmp = doc.pubnote;
        // attempt to parse it out
        try {
          doc.pubnote = doc.pubnote[0].split(';');
        } catch (e) {
          // do nothing
          doc.pubnote = tmp;
        }
        doc.hasExtraPubnotes = doc.pubnote.length > MAX_COMMENTS;
        doc.pubnoteList = _.first(doc.pubnote, MAX_COMMENTS);
      }

      return doc;
    }
  });

  var AbstractView = Marionette.ItemView.extend({

    tagName: 'article',

    className: 's-abstract-metadata',

    modelEvents: {
      change: 'render'
    },

    template: abstractTemplate,

    events: {
      'click #show-all-comments': 'showAllComments',
      'click #show-less-comments': 'showLessComments',
      'click #show-all-pubnotes': 'showAllPubnotes',
      'click #show-less-pubnotes': 'showLessPubnotes',
      'click #toggle-aff': 'toggleAffiliation',
      'click #toggle-more-authors': 'toggleMoreAuthors',
      'click a[data-target="more-authors"]': 'toggleMoreAuthors',
      'click a[target="prev"]': 'onClick',
      'click a[target="next"]': 'onClick'
    },

    showAllComments: function (e) {
      e.preventDefault();
      var m = this.model;
      m.set({
        commentList: m.get('comment'),
        showAllComments: true
      });
    },

    showLessComments: function (e) {
      e.preventDefault();
      var m = this.model;
      m.set({
        commentList: _.first(m.get('comment'), MAX_COMMENTS),
        showAllComments: false
      });
    },

    showAllPubnotes: function (e) {
      e.preventDefault();
      var m = this.model;
      m.set({
        pubnoteList: m.get('comment'),
        showAllPubnotes: true
      });
    },

    showLessPubnotes: function (e) {
      e.preventDefault();
      var m = this.model;
      m.set({
        pubnoteList: _.first(m.get('pubnote'), MAX_COMMENTS),
        showAllPubnotes: false
      });
    },

    toggleMoreAuthors: function (ev) {
      if (ev) {
        ev.stopPropagation();
      }

      this.$('.author.extra').toggleClass('hide');
      this.$('.author.extra-dots').toggleClass('hide');
      if (this.$('.author.extra').hasClass('hide')) {
        this.$('#toggle-more-authors').text('Show all authors');
      } else {
        this.$('#toggle-more-authors').text('Hide authors');
      }
    },

    toggleAffiliation: function (ev) {
      if (ev) {
        ev.preventDefault();
      }

      this.$('.affiliation').toggleClass('hide');
      if (this.$('.affiliation').hasClass('hide')) {
        this.$('#toggle-aff').text('Show affiliations');
      } else {
        this.$('#toggle-aff').text('Hide affiliations');
      }
    },

    onClick: function (ev) {
      ev.preventDefault();
      this.trigger($(ev.target).attr('target'));
    },

    handlePrerenderedContent: function ($el) {
      this.$el = $(this.tagName + '.' + this.className, $el);
      this.el = this.$el.get(0);
      this.delegateEvents();

      var _getTemplate = _.bind(this.getTemplate, this);
      // replace the template function to manually set the content
      this.getTemplate = _.bind(function () {
        if (this.model.has('bibcode')) {
          this.getTemplate = _getTemplate;
          return this.template;
        } else {
          return $el.html();
        }
      }, this);
    },

    onRender: function () {
      this.$('.icon-help').popover({ trigger: 'hover', placement: 'right', html: true });

      if (MathJax) MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.el]);

      // and set the title, maintain tags
      document.title = $('<div>' + this.model.get('title') + '</div>').text();
      if (!window.__PRERENDERED) {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        $('#app-container').scrollTop(0);
      }
    }
  });

  var AbstractWidget = BaseWidget.extend({
    initialize: function (options) {
      options = options || {};
      this.model = options.data ? new AbstractModel(options.data, { parse: true }) : new AbstractModel();
      this.view = new AbstractView({ model: this.model });

      this.listenTo(this.view, 'all', this.onAllInternalEvents);

      BaseWidget.prototype.initialize.apply(this, arguments);
      this._docs = {};
      this.maxAuthors = 20;
    },

    activate: function (beehive) {
      this.setBeeHive(beehive);
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);
      var pubsub = beehive.getService('PubSub');

      _.bindAll(this, ['onNewQuery', 'dispatchRequest', 'processResponse', 'onDisplayDocuments']);
      pubsub.subscribe(pubsub.START_SEARCH, this.onNewQuery);
      pubsub.subscribe(pubsub.INVITING_REQUEST, this.dispatchRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
    },

    onApiFeedback: function (feedback) {

      // there was an error
      if (feedback && feedback.error) {
        this.model.set({
          error: true,
          loading: false
        });
      }
    },

    defaultQueryArguments: {
      fl: '[citations],abstract,aff,author,bibcode,citation_count,comment,doi,id,keyword,page,property,pub,pub_raw,pubdate,pubnote,read_count,title,volume',
      rows: 1
    },

    mergeStashedDocs: function (docs) {
      _.each(docs, function (d) {
        if (!this._docs[d.bibcode]) {
          this._docs[d.bibcode] = this.model.parse(d);
        }
      }, this);
    },

    onNewQuery: function (apiQuery) {
      // only empty docs array if it truly is a new query
      var newQueryJSON = apiQuery.toJSON();

      var currentStreamlined = _.pick(this.getCurrentQuery().toJSON(), _.keys(newQueryJSON));
      if (JSON.stringify(newQueryJSON) != JSON.stringify(currentStreamlined)) {
        this._docs = {};
      }
    },

    dispatchRequest: function (apiQuery) {
      this.setCurrentQuery(apiQuery);
      BaseWidget.prototype.dispatchRequest.apply(this, arguments);
    },

    // bibcode is already in _docs
    displayBibcode: function (bibcode) {

      // if _docs is empty, stop here
      if (_.isEmpty(this._docs)) {
        return;
      }

      // wipe out the former values, because this new set of data
      // might not have every key
      this.model.clear({ silent: true });
      this.model.set(this._docs[bibcode]);

      this._current = bibcode;
      // let other widgets know details
      var c = this._docs[bibcode]['[citations]'] || {
        num_citations: 0,
        num_references: 0
      };
      var resolved_citations = c ? c.num_citations : 0;

      this.trigger('page-manager-event', 'broadcast-payload', {
        title: this._docs[bibcode].title,
        abstract: this._docs[bibcode].abstract,
        // this should be superfluous, widgets already subscribe to display_documents
        bibcode: bibcode,

        // used by citation list widget
        citation_discrepancy: this._docs[bibcode].citation_count - resolved_citations,
        citation_count: this._docs[bibcode].citation_count,
        references_count: c.num_references,
        read_count: this._docs[bibcode].read_count,
        property: this._docs[bibcode].property
      });
    },

    onDisplayDocuments: function (apiQuery) {
      // check to see if a query is already in progress (the way bbb is set up, it will be)
      // if so, auto fill with docs initially requested by results widget
      try {
        var stashedDocs = this.getBeeHive().getObject('DocStashController').getDocs();
      } catch (e) {
        stashedDocs = [];
      } finally {
        this.mergeStashedDocs(stashedDocs);
      }

      var bibcode = apiQuery.get('q'),
        q;

      if (bibcode.length > 0 && bibcode[0].indexOf('bibcode:') > -1) {
        // redefine bibcode
        var bibcode = bibcode[0].replace('bibcode:', '');
      }
      if (this._docs[bibcode]) { // we have already loaded it
        this.displayBibcode(bibcode);
      } else {
        if (apiQuery.has('__show')) return; // cycle protection
        q = apiQuery.clone();
        q.set('__show', bibcode);
        // this will add required fields
        this.dispatchRequest(q);
      }
    },

    onAllInternalEvents: function (ev) {
      if ((ev == 'next' || ev == 'prev') && this._current) {
        var keys = _.keys(this._docs);
        var pubsub = this.getPubSub();
        var curr = _.indexOf(keys, this._current);
        if (curr > -1) {
          if (ev == 'next' && curr + 1 < keys.length) {
            pubsub.publish(pubsub.DISPLAY_DOCUMENTS, keys[curr + 1]);
          } else if (curr - 1 > 0) {
            pubsub.publish(pubsub.DISPLAY_DOCUMENTS, keys[curr - 1]);
          }
        }
      }
    },

    processResponse: function (apiResponse) {
      var r = apiResponse.toJSON();
      var d,
        bibcode;
      if (r.response && r.response.docs) {
        _.each(r.response.docs, function (doc) {
          d = this.model.parse(doc, this.maxAuthors);
          this._docs[d.bibcode] = d;
        }, this);

        if (apiResponse.has('responseHeader.params.__show')) {
          bibcode = apiResponse.get('responseHeader.params.__show', false, '');
          this.displayBibcode(bibcode);
        }
      }

      var numFound = apiResponse.get('response.numFound', false, 0);
      this.trigger('page-manager-event', 'widget-ready', { numFound: numFound });
    }

  });

  return AbstractWidget;
});
