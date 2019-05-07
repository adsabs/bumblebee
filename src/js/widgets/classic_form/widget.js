define([
  'js/widgets/base/base_widget',
  'js/components/api_query',
  'js/components/api_query_updater',
  'hbs!js/widgets/classic_form/form',
  'jquery-ui',
  'js/widgets/paper_search_form/topterms',
  'analytics'
], function (
  BaseWidget,
  ApiQuery,
  ApiQueryUpdater,
  FormTemplate,
  JQueryUI,
  AutocompleteData,
  analytics) {

  // for autocomplete
  function split(val) {
    return val.split(/,\s*/);
  }

  function extractLast(term) {
    return split(term).pop();
  }

  var BOOLEAN = {
    'AND': ' ',
    'OR': ' OR ',
    'BOOLEAN': ' '
  };

  var MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  var _year = (new Date()).getFullYear();
  var YEARS = _.map(_.range(_year - 100, _year + 1).reverse(), function (y) { return '' + y; });

  var FormModel = Backbone.Model.extend({
    initialize: function () {
      this.listenTo(this, 'change', _.bind(this.serialize, this));
      this.updater = new ApiQueryUpdater(' ');
      this.serialize();
    },
    defaults: {
      'author-logic': 'AND',
      'object-logic': 'AND',
      'title-logic': 'AND',
      'abstract-logic': 'AND',
      'author-names': [],
      'object-names': [],
      'collections': {
        'astronomy': true,
        'physics': false
      },
      'property': {
        'refereed': false,
        'article': false
      },
      pubdate: {
        month_from: '01',
        year_from: '0000',
        month_to: '12',
        year_to: '9999'
      },
      title: '',
      abs: '',
      bibstem: '',
      query: null
    },
    _makeFqStr: function (data) {
      var trues = _(data).pick(_.identity).keys().value();
      if (trues.length > 1) {
        return '(' + _.keys(data).join(' OR ') + ')';
      }
      return trues[0];
    },
    _movePrefix: function (lines) {
      var updater = this.updater;
      return _.map(lines, function (l) {
        var prefix = '';
        if (/^[=\-+]/.test(l)) {
          prefix = l.substr(0, 1);
          l = l.substr(1);
        }
        return prefix + updater.quoteIfNecessary(l);
      });
    },
    serialize: _.debounce(function () {

      /*
       * Matches on:
       * `gamma-ray burst` -> hyphenated and non-hyphenated tokens
       * `-test +test =test` -> operator-prefixed without quotes
       * `-"test" +"test" ="test" -> operator-prefixed with quotes
       */
      var genericMatcher = /[=+-]?(\w+-\w+|"[^"]+"|\w+)/g;
      var updater = this.updater;
      var data = this.toJSON();
      var query = {
        q: [],
        fq: []
      };

      // collections
      var str = this._makeFqStr(data.collections);
      if (str) {
        query.__fq_database = ['AND', str];
        query.fq.push('{!type=aqp v=$fq_database}');
        query.fq_database = 'database: ' + str;
      }

      // refereed/article
      var str = this._makeFqStr(data.property);
      if (str) {
        query.__fq_property = ['AND', str];
        query.fq.push('{!type=aqp v=$fq_property}');
        query.fq_property = 'property: ' + str;
      }

      // pubdate
      var pd = data.pubdate;
      var date = [
        '[', pd.year_from, '-', pd.month_from, ' TO ', pd.year_to, '-', pd.month_to, ']'
      ].join('');
      if (!_.isEqual(pd, this.defaults.pubdate)) {
        query.q.push('pubdate:' + date);
      }

      // authors
      var authorLogic = BOOLEAN[data['author-logic']];
      var restrictAuthors = false;
      var authors = _.map(data['author-names'], function (name) {
        var prefix = '';
        if (/^[=\-+]/.test(name)) {
          prefix = name.substr(0, 1);
          name = name.substr(1);
        }
        if (/[\$]$/.test(name)) {
          restrictAuthors = true;
          name = name.substr(0, name.length - 1);
        }
        return prefix + '"' + name + '"';
      });
      var result = 'author:(' + authors.join(authorLogic) + ')';
      if (restrictAuthors) {
        result += ' ' + 'author_count:1'
      }
      if (authors.length) {
        query.q.push(result);
      }

      // objects
      var objectLogic = BOOLEAN[data['object-logic']];
      var objects = this._movePrefix(data['object-names']);
      var result = 'object:(' + objects.join(objectLogic) + ')';
      if (objects.length) {
        query.q.push(result);
      }

      // title
      var titleLogic = BOOLEAN[data['title-logic']];
      var titles = this._movePrefix(data.title.match(genericMatcher));
      if (titles.length) {
        query.q.push('title:(' + titles.join(titleLogic) + ')');
      }

      // abs
      var absLogic = BOOLEAN[data['abstract-logic']];
      var abs = this._movePrefix(data.abs.match(genericMatcher));
      var result = 'abs:(' + abs.join(absLogic) + ')';
      if (abs.length) {
        query.q.push(result);
      }

      // bibstem
      var groups = _.reduce(data.bibstem.match(/[^,^\s]+/g), function (acc, p) {
        /^\-/.test(p)
          ? acc.neg.push(updater.quoteIfNecessary(p.replace(/^\-/, '')))
          : acc.pos.push(updater.quoteIfNecessary(p));
        return acc;
      }, { neg: [], pos: [] });
      if (groups.neg.length) {
        query.q.push('-bibstem:(' + groups.neg.join(' OR ') + ')');
      }
      if (groups.pos.length) {
        query.q.push('bibstem:(' + groups.pos.join(' OR ') + ')');
      }

      // do not allow query to be empty
      if (_.isEmpty(query.q)) {
        query.q.push('*');
      }

      // make sure that each item in query is an array and is not empty
      this.set('query', _.reduce(query, function (acc, val, key) {
        if (_.isEmpty(val)) {
          return acc;
        }
        acc[key] = _.isArray(val) ? val : [val];
        return acc;
      }, {}));
    }, 50)
  });

  var FormView = Marionette.ItemView.extend({

    template: FormTemplate,

    className: 'classic-form',

    events: {
      'click button[type=submit]': 'submitForm',
      'change input[name$="-logic"]': 'updateLogic',
      'input textarea': 'textareaUpdate',
      'change div[data-field="database"] input': 'updateCollection',
      'change div[data-field="property"] input': 'updateProperty',
      'input input[name="title"],input[name="abs"],input[name="bibstem"]': 'inputUpdate',
      'input input[name^="month"],input[name^="year"]': 'dateUpdate'
    },

    updateLogic: function (e) {
      var $el = this.$(e.currentTarget);
      this.model.set($el.attr('name'), $el.val().trim());
    },

    textareaUpdate: function (e) {
      var $el = this.$(e.currentTarget);
      var vals = _.filter($el.val().split(/\n/), function (v) {
         return !_.isEmpty(v);
      });
      vals = vals.map(Function.prototype.call, String.prototype.trim);
      this.model.set($el.attr('name'), vals);
    },

    updateCollection: function (e) {
      var $el = this.$(e.currentTarget);
      var data = {};
      data[$el.attr('name')] = $el.prop('checked');
      this.model.set('collections', _.extend({}, this.model.get('collections'), data));
    },

    updateProperty: function (e) {
      var $el = this.$(e.currentTarget);
      var data = {};
      data[$el.attr('name')] = $el.prop('checked');
      this.model.set('property', _.extend({}, this.model.get('property'), data));
    },

    inputUpdate: function (e) {
      var $el = this.$(e.currentTarget);
      this.model.set($el.attr('name'), $el.val().trim());
    },

    dateUpdate: function (e) {
      var $el = this.$(e.currentTarget);
      var name = $el.attr('name');
      var val = $el.val().trim();
      var data = {};
      val = val === '' ? this.model.defaults.pubdate[name] : val;
      data[name] = val;
      this.model.set('pubdate', _.extend({}, this.model.get('pubdate'), data));
    },

    submitForm: function (e) {
      e.preventDefault();
      this.trigger('submit', this.model.get('query'));
      this.$('button[type=submit]').each(function () {
        var $el = $(this);
        var currHtml = $el.html();
        $el.html('<i class="icon-loading"/>  Loading...');
        setTimeout(function () {
          $el.html(currHtml);
        }, 3000);
      });
      return false;
    },

    onRender: function () {
      var self = this;

      var showOnFocus = function () {
        $(this).autocomplete('search', '');
      };

      var getLastTerm = function (term) {
        var t = _.last(term.split(/(,\s|;\s|[,;])/));

        // ignore any leading `-`
        return t.replace(/^\-/, '');
      };
      this.$('input[name=bibstem]').autocomplete({
        minLength: 1,
        autoFocus: true,
        source: function (request, response) {
          var matches = $.map(AutocompleteData, function (item) {
            if (_.isString(request.term)) {
              var term = getLastTerm(request.term).toUpperCase();
              var bibstem = item.value.toUpperCase();
              var label = item.label.toUpperCase();
              if (
                bibstem.indexOf(term) === 0
                || label.indexOf(term) === 0
                || label.replace(/^THE\s/, '').indexOf(term) === 0
              ) {
                return item;
              }
            }
          });
          return response(matches);
        },
        focus: function () {
          // prevent value inserted on focus
          return false;
        },
        select: function (event, ui) {
          var terms = split(this.value);

          // remove the current input
          var t = terms.pop();

          // add the selected item
          terms.push((t.startsWith('-') ? '-' : '') + ui.item.value);

          // add placeholder to get the comma-and-space at the end
          terms.push('');
          this.value = terms.join(', ');
          self.model.set('bibstem', this.value);

          event.preventDefault(); // necessary to stop hash change from #classic-form to #
          return false;
        }
      })
      .data('ui-autocomplete')._renderItem = function (ul, item) {
        var term = getLastTerm(this.term).toUpperCase().trim();
        var re = new RegExp('(' + term + ')', 'i');
        var label = item.label;
        if (term.length > 0) {
          label = label.replace(re,
            '<span class="ui-state-highlight">$1</span>'
          );
        }
        var $li = $('<li/>').appendTo(ul);
        $('<a/>').attr('href', 'javascript:void(0)')
          .html(label).appendTo($li).on('click', function (e) {
            e.preventDefault();
          });
        return $li;
      };
    }
  });

  var FormWidget = BaseWidget.extend({

    initialize: function (options) {
      options = options || {};
      this.model = new FormModel();
      this.view = new FormView({ model: this.model });
      this.listenTo(this.view, 'submit', this.submitForm);
    },

    activate: function (beehive) {
      this.setBeeHive(beehive);
      var ps = this.getPubSub();
      var self = this;
      ps.subscribe(ps.CUSTOM_EVENT, function (ev) {
        if (ev === 'start-new-search') {
          self.onNewSearch();
        }
      });
    },

    onNewSearch: function () {
      this.model.set(this.model.defaults);
      this.view.$('input,textarea').val('');
    },

    /**
     * quick loop that waits for the element to be actually visible before
     * setting the focus
     * @param {string} selector
     */
    setFocus: function (selector) {
      var $_ = _.bind(this.view.$, this.view);
      (function check(c) {
        var $el = $_(selector);
        if ($el.is(':visible') || c <= 0) return $el.focus();
        setTimeout(check, 100, --c);
      })(10);
    },

    onShow: function () {
      // clear the loading button
      this.view.$('button[type=submit]').each(function () {
        $(this).html('<i class="fa fa-search"></i> Search');
      });
      // set focus to author field
      this.setFocus('#classic-author');
    },

    submitForm: function (queryDict) {
      var newQuery = _.assign({}, queryDict, {
        q: queryDict.q.join(' '),
        sort: 'date desc'
      });
      newQuery = new ApiQuery(newQuery);
      var ps = this.getPubSub();
      var options = {
        q: newQuery,
        context: {
          referrer: 'ClassicSearchForm'
        }
      };
      ps.publish(ps.NAVIGATE, 'search-page', options);
      analytics('send', 'event', 'interaction', 'classic-form-submit', JSON.stringify(queryDict));
    },

    // notify application to keep me around in memory indefinitely
    // this is so the form and anything the user has entered into it can stay around
    dontKillMe: true

  });

  return FormWidget;
});
