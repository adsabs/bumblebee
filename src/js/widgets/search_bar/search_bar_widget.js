define([
  'underscore',
  'marionette',
  'bowser',
  'js/components/api_query',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/search_bar/templates/search_bar_template',
  'hbs!js/widgets/search_bar/templates/search_form_template',
  'hbs!js/widgets/search_bar/templates/option-dropdown',
  'js/components/api_request',
  'js/components/api_targets',
  'js/components/api_feedback',
  'js/mixins/formatter',
  'js/widgets/search_bar/autocomplete',
  'js/widgets/search_bar/quick-field-desc',
  'bootstrap', // if bootstrap is missing, jQuery events get propagated
  'jquery-ui',
  'js/mixins/dependon',
  'analytics',
  'js/components/query_validator',
  'select2',
  'libs/select2/matcher',
], function(
  _,
  Marionette,
  bowser,
  ApiQuery,
  BaseWidget,
  SearchBarTemplate,
  SearchFormTemplate,
  OptionDropdownTemplate,
  ApiRequest,
  ApiTargets,
  ApiFeedback,
  FormatMixin,
  { render: renderAutocomplete, autocompleteSource: autocompleteArray },
  quickFieldDesc,
  bootstrap,
  jqueryUI,
  Dependon,
  analytics,
  QueryValidator,
  select2,
  oldMatcher
) {
  /**
   * The default databases to filter by if the user has not set any in their preferences
   * @type {string[]}
   */
  const DEFAULT_DATABASES = ['Astronomy', 'Physics'];

  var SearchBarModel = Backbone.Model.extend({
    defaults: function() {
      return {
        citationCount: undefined,
        numFound: undefined,
        bigquery: false,
        bigquerySource: undefined,
      };
    },
  });

  // get what is currently selected in the window
  function getSelectedText(el) {
    var text = '';
    if (window.getSelection) {
      // can't just get substring because of firefox bug
      text = el.value.substring(el.selectionStart, el.selectionEnd);
    } else if (document.selection && document.selection.type != 'Control') {
      text = document.selection.createRange().text;
    }
    return text;
  }

  var SearchBarView = Marionette.ItemView.extend({
    template: SearchBarTemplate,

    className: 's-search-bar-widget',

    initialize: function(options) {
      _.bindAll(this, 'fieldInsert');
      this.queryValidator = new QueryValidator();
      this.defaultDatabases = [];
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      var that = this;
    },

    modelEvents: {
      change: 'render',
    },

    onRender: function() {
      var that = this;
      const $container = this.$('#option-dropdown-container');
      /*
              select
             */
      $container.append(OptionDropdownTemplate);

      function matchStart(term, text) {
        if (text.toUpperCase().indexOf(term.toUpperCase()) === 0) {
          return true;
        }
        return false;
      }

      var $select = this.$('.quick-add-dropdown');

      $select
        .select2({
          placeholder: 'All Search Terms',
          matcher: oldMatcher(matchStart),
        })
        .on('change', function(e) {
          var val = e.target.value;
          // prevent infinite loop!
          if (!val) return;
          var $option = $(this).find('option[value="' + e.target.value + '"]');

          // Grab any default value that is present on the element
          var defaultValue = $option.data('defaultValue');
          var label = $option.closest('optgroup').attr('label');
          $select.val(null).trigger('change');
          setTimeout(function() {
            that.selectFieldInsert(val, label, defaultValue);
            // not entirely sure why this timeout is necessary...
            // without it, focus is moved from the main query bar
          }, 100);
        })
        // this seems to be necessary to show the placeholder on initial render
        .val(null)
        .trigger('change');

      const $select2Instance = $select.data('select2');

      const closeAllPopovers = () => {
        $('.select2-dropdown').popover('destroy');
      };

      // on close, move focus to search bar.  If we change page layout, may have to change this
      // delayed to handle user click on a link in the description before closing
      $select2Instance.on('close', () => {
        document.getElementById('query-search-input').focus();
        setTimeout(() => {
          try {
            document.getElementsByClassName('search-term-popover')[0].remove();
          } catch (e) {
            // do nothing
          }
        }, 10);
      });

      const platform = bowser.parse(window.navigator.userAgent).platform.type;
      if (platform !== 'mobile' && platform !== 'tablet') {
        // hide popovers one open and close, focusing will re-open them after this
        $select2Instance.on('open', closeAllPopovers);

        $select2Instance.on('results:focus', ({ data: { id } }) => {
          // hide any opened popovers
          closeAllPopovers();
          // grab the title/body from our list
          const data = quickFieldDesc[id];
          if (typeof data !== 'object') {
            // if not found, do nothing
            return;
          }
          // create the popover
          const syntax = data.syntax.map((s) => `<code>${s}</code>`).join(', ');
          const example = data.example
            .map((e) => `<code>${e}</code>`)
            .join(', ');
          $('.select2-dropdown')
            .popover({
              title: `<strong>${data.title}</strong>`,
              content: `${data.description}<br/><br/>Syntax: <br/>${syntax}<br/><br/>Example: </br>${example}`,
              html: true,
              placement: 'top right',
              trigger: 'manual',
              container: 'body',
              animation: false,
            })
            .data('bs.popover')
            .tip()
            .attr('class', 'search-term-popover popover right in');

          $('.select2-dropdown').popover('show');
        });
      }

      /*
      end code for select
      */

      const $input = this.$('input.q');
      this.$input = $input;
      renderAutocomplete($input);

      this.$('[data-toggle="tooltip"]').tooltip();
    },

    events: {
      'click #field-options button': 'fieldInsert',
      'keyup .q': 'toggleClear',
      'click .show-form': 'onShowForm',
      'submit form[name=main-query]': 'submitQuery',
      'click .icon-clear': 'clearInput',
      'keyup .q': 'storeCursorInfo',
      'select .q': 'storeCursorInfo',
      'click .q': 'storeCursorInfo',
      'click .bigquery-close': 'clearBigquery',
    },

    toggleClear: function() {
      this.$('.icon-clear').toggleClass('hidden', !this.$input.val());
    },

    clearInput: function() {
      this.$input.val('').focus();
      this.toggleClear();
    },

    getFormVal: function() {
      return this.$input.val();
    },

    setFormVal: function(v) {
      /*
              bigquery special case: don't show the confusing *:*, just empty bar
             */
      if (this.model.get('bigquery') && v === '*:*') {
        this.$('.q').val('');
      } else {
        this.$('.q').val(v);
      }
      this.toggleClear();
    },

    serializeData: function() {
      var j = this.model.toJSON();
      j.numFound = j.numFound ? this.formatNum(j.numFound) : 0;
      j.citationCount = j.citationCount
        ? this.formatNum(j.citationCount)
        : false;
      if (this.model.get('bigquerySource')) {
        if (this.model.get('bigquerySource').match(/library/i)) {
          this.model.set({
            libraryName: this.model
              .get('bigquerySource')
              .match(/library:(.*)/i)[1],
          });
        }
      }
      return j;
    },

    onShowForm: function() {
      // show the form
      this.specifyFormWidth();
    },

    toggleFormSection: function(e) {
      var $p = $(e.target).parent();
      $p.next().toggleClass('hide');
      $p.toggleClass('search-form-header-active');
    },

    // used for the "field insert" function
    _cursorInfo: {
      selected: '',
      startIndex: 0,
    },

    storeCursorInfo: function(e) {
      var selected = getSelectedText(e.currentTarget);
      var startIndex = this.$input.getCursorPosition();
      this._cursorInfo = {
        selected: selected,
        startIndex: startIndex,
      };
      this.toggleClear();
    },

    selectFieldInsert: function(val, label, initialValue) {
      var newVal;
      var specialCharacter;
      var highlightedText = this._cursorInfo.selected;
      var startIndex = this._cursorInfo.startIndex;
      var currentVal = this.getFormVal();

      // By default, selected will be the highlighted text surrounded by double qoutes
      var selected = '"' + highlightedText + '"';

      // If there was no highlighted text and an initial value was passed, use the initial value
      if (highlightedText.length === 0 && initialValue) {
        selected = initialValue;
      }

      // selected will be "" if user didn't highlight any text
      // newVal = df + ":\"" + selected + "\"";
      //
      switch (label) {
        case 'fields':
          {
            if (val === 'first-author') {
              val = 'first_author';
              // selected = selected.replace(/"/, '"^');
            } else if (val === 'year') {
              selected = selected.replace(/"/g, '');
            }
            newVal = val + ':' + selected;
          }
          break;
        case 'operators':
          newVal = val + '(' + (selected === '""' ? '' : selected) + ')';
          break;
        case 'special characters':
          if (val === '=') {
            newVal = val + selected;
          } else {
            newVal = selected + val;
          }
          specialCharacter = true;
          break;
      }

      if (highlightedText.length) {
        this.setFormVal(
          currentVal.substr(0, startIndex) +
            newVal +
            currentVal.substr(startIndex + selected.length)
        );
      } else {
        // append to the end
        var newString = currentVal ? currentVal + ' ' + newVal : newVal;
        this.setFormVal(newString);
        if (specialCharacter) {
          this.$input.selectRange(newString.length);
        } else {
          this.$input.selectRange(newString.length - 1);
        }
      }
      analytics(
        'send',
        'event',
        'interaction',
        'field-insert-dropdown-selected',
        val
      );
    },

    fieldInsert: function(e) {
      var newVal;
      var operator;
      var currentVal = this.getFormVal();
      var $target = $(e.target);
      var df = $target.attr('data-field');
      var punc = $target.attr('data-punc');

      var startIndex = this._cursorInfo.startIndex;
      var selected = this._cursorInfo.selected;
      // selected will be "" if user didn't highlight any text

      if (df.indexOf('operator-') > -1) {
        operator = df.split('-').reverse()[0];
        punc = '(';
        if (selected) {
          newVal = operator + '(' + selected + ')';
        } else {
          // enclose the full query, set it in and return
          newVal = operator + '(' + currentVal + ')';
          currentVal = '';
          this.setFormVal(newVal);
          return;
        }
      } else if (df == 'first-author') {
        newVal = ' first_author:"' + selected + '"';
      } else if (punc == '"') {
        newVal = df + ':"' + selected + '"';
      } else if (punc == '(') {
        newVal = df + ':(' + selected + ')';
      } else if (!punc) {
        // year
        newVal = df + ':' + selected;
      }

      if (selected) {
        this.setFormVal(
          currentVal.substr(0, startIndex) +
            newVal +
            currentVal.substr(startIndex + selected.length)
        );
      } else {
        // append to the end
        var newString = currentVal + ' ' + newVal;
        this.setFormVal(newString);

        if (punc) {
          this.$input.selectRange(newString.length - 1);
        } else {
          this.$input.selectRange(newString.length);
        }
      }

      analytics(
        'send',
        'event',
        'interaction',
        'field-insert-button-pressed',
        df
      );
      return false;
    },

    submitQuery: function(e) {
      var fields;
      var fielded;
      var query;

      query = this.getFormVal();

      var $input = $('input', e.currentTarget);
      if (
        _.isString(query) &&
        _.isEmpty(query) &&
        !this.model.get('bigquery')
      ) {
        // show a popup to tell the user to type in a query
        $input
          .popover({
            placement: 'bottom',
            title: 'Empty Search!',
            content: 'Please enter a query to search.',
            animation: true,
            trigger: 'manual',
          })
          .popover('show');

        $input.on('input change blur', function() {
          $(this).popover('hide');
        });
        return false;
      }

      if (typeof $input.popover === 'function') {
        $input.popover('hide');
      }

      // replace uppercased fields with lowercase
      query = query.replace(/([A-Z])\w+:/g, function(letter) {
        return letter.toLowerCase();
      });
      // store the query in case it gets changed (which happens when there is an object query)
      this.original_query = query;

      // if we're within a bigquery, translate an empty query to "*:*"
      if (!query && this.model.get('bigquery')) {
        query = '*:*';
      }

      var newQuery = new ApiQuery({
        q: query,
      });

      // Perform a quick validation on the query
      var validated = this.queryValidator.validate(newQuery);
      if (!validated.result) {
        var tokens = _.pluck(validated.tests, 'token');
        tokens = tokens.length > 1 ? tokens.join(', ') : tokens[0];
        var pubsub = this.getPubSub();
        pubsub.publish(
          pubsub.ALERT,
          new ApiFeedback({
            code: 0,
            msg:
              '<p><i class="fa fa-exclamation-triangle fa-2x" aria-hidden="true"></i> ' +
              "Sorry! We aren't able to understand: <strong><i>" +
              tokens +
              '</i></strong></p>' +
              '<p><strong><a href="/">Try looking at the search examples on the home page</a></strong> or ' +
              '<strong><a href="/help/search/search-syntax">reading our help page.</a></strong></p>',
            type: 'info',
            fade: true,
          })
        );
        return false;
      }
      this.trigger('start_search', newQuery);

      // let analytics know what type of query it was
      fields = _.chain(autocompleteArray)
        .pluck('value')
        .map(function(b) {
          var m = b.match(/\w+:|\w+\(/);
          if (m && m.length) return m[0];
        })
        .unique()
        .value();

      fielded = false;

      _.each(fields, function(f) {
        if (query.indexOf(f) > -1) {
          fielded = true;
        }
      });

      analytics(
        'send',
        'event',
        'interaction',
        `search-bar-${fielded ? 'fielded' : 'unfielded'}-query-submitted`,
        query
      );
      return false;
    },

    clearBigquery: function() {
      this.trigger('clear_big_query');
    },
  });

  _.extend(SearchBarView.prototype, FormatMixin, Dependon.BeeHive);

  var SearchBarWidget = BaseWidget.extend({
    initialize: function(options) {
      this.model = new SearchBarModel();

      this.view = new SearchBarView({
        model: this.model,
      });

      this.listenTo(this.view, 'start_search', function(query) {
        this.changeDefaultSort(query);
        this.navigate(query);
        this.updateState('loading');
        this.view.setFormVal(query.get('q'));
      });

      this.listenTo(this.view, 'clear_big_query', function(query) {
        var query = this._currentQuery.clone();
        // awkward but need to remove qid + provide __clearBigQuery
        // for querymediator to do the correct thing
        query.unset('__qid');
        query.unset('__bigquerySource');
        query.set('__clearBigQuery', 'true');

        // unload the bigquery from the model
        this.clearBigQueryPill();
        this.navigate(query);
      });

      this.listenTo(this.view, 'render', function() {
        var newQueryString = '';
        var query = this.getCurrentQuery();
        var oldQueryString = query.get('q');

        if (oldQueryString) {
          // Grab the original (no simbid refs) query string for the view
          // This is re-run here in case the view is not updated and
          // simbid refs show up
          newQueryString = query.get('__original_query')
            ? query.get('__original_query')[0]
            : oldQueryString.join(' ');
        }

        if (newQueryString) {
          this.view.setFormVal(newQueryString);
        }
        this.view.toggleClear();
      });

      BaseWidget.prototype.initialize.call(this, options);
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      this.activateWidget();
      var pubsub = this.getPubSub();
      _.bindAll(this, 'processResponse');

      // search widget doesn't need to execute queries (but it needs to listen to them)
      pubsub.subscribe(pubsub.FEEDBACK, _.bind(this.handleFeedback, this));
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.onNavigate, this));
      this.view.activate(beehive.getHardenedInstance());
      pubsub.subscribe(
        pubsub.INVITING_REQUEST,
        _.bind(this.dispatchRequest, this)
      );
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(
        pubsub.USER_ANNOUNCEMENT,
        _.bind(this.updateFromUserData, this)
      );
      pubsub.subscribe(pubsub.CUSTOM_EVENT, _.bind(this.onCustomEvent, this));
      pubsub.subscribe(pubsub.START_SEARCH, _.bind(this.onStartSearch, this));
      this.updateFromUserData();
    },

    getUserData: function() {
      try {
        var beehive = _.isFunction(this.getBeeHive) && this.getBeeHive();
        var user = _.isFunction(beehive.getObject) && beehive.getObject('User');
        if (_.isPlainObject(user)) {
          return (
            _.isFunction(user.getUserData) && user.getUserData('USER_DATA')
          );
        }
        return {};
      } catch (e) {
        return {};
      }
    },

    onStartSearch: function() {
      this.model.unset('timing');
    },

    onCustomEvent: function(event, arg) {
      if (event === 'timing:results-loaded') {
        this.model.set('timing', arg / 1000);
      } else if (event === 'hotkey/search') {
        const $input = $('input[name=q]', this.getEl());
        if (!$input.is(':focus')) {
          arg.preventDefault();
          $input.select();
          $(document.documentElement).scrollTop(0);
        }
      } else if (event === 'recommender/update-search-text') {
        const value = arg.text;
        if (value) {
          this.view.setFormVal(`${this.view.getFormVal()} ${value}`);
          this.view.$input.focus();
        }
      }
    },

    updateFromUserData: function() {
      var userData = this.getUserData();
      this.defaultDatabases = _.has(userData, 'defaultDatabase')
        ? _.map(
            _.filter(userData.defaultDatabase, {
              value: true,
            }),
            'name'
          )
        : this.defaultDatabases;
    },

    applyDefaultFilters: function(apiQuery) {
      const dbfilters =
        Array.isArray(this.defaultDatabases) && this.defaultDatabases.length > 0
          ? this.defaultDatabases
          : DEFAULT_DATABASES;

      // if the user has selected all databases, don't apply ANY filter
      if (dbfilters.length > 0 && dbfilters.includes('All')) {
        return apiQuery;
      }

      if (dbfilters.length > 0) {
        var fqString = '{!type=aqp v=$fq_database}';

        // check for presence of database fq
        var fq = apiQuery.get('fq');
        fq = _.isArray(fq) ? fq : [fq];
        var match = _.indexOf(fqString);
        if (match < 0) {
          fq.push(fqString);
          apiQuery.set('fq', fq);
        }

        // check for presence of fq_database
        if (!apiQuery.has('fq_database')) {
          var fq_database_string = _.reduce(
            dbfilters,
            function(res, db, i) {
              var d = db.toLowerCase();
              return res.replace(
                /(\(.*)(\))/,
                i === 0
                  ? '$1database:' + d + '$2'
                  : '$1 OR database:' + d + '$2'
              );
            },
            '()'
          );
          apiQuery.set('fq_database', fq_database_string);
        }

        // finally add the filters
        if (!apiQuery.has('__filter_database_fq_database')) {
          var fq_database_filters = _.map(dbfilters, function(db) {
            return 'database:' + db.toLowerCase();
          });
          apiQuery.set(
            '__filter_database_fq_database',
            ['OR'].concat(fq_database_filters)
          );
        }
      }

      return apiQuery;
    },

    processResponse: function(apiResponse) {
      var res = apiResponse.toJSON();
      var sort = res.responseHeader.params.sort;
      if (res.stats && /citation.*/.test(sort)) {
        var type = _.keys(res.stats.stats_fields)[0];
        var sum = res.stats.stats_fields[type].sum;
        if (type === 'citation_count_norm') {
          this.model.set({
            citationCount: sum.toFixed(2),
            citationLabel: 'normalized citations',
          });
        } else if (type === 'citation_count') {
          this.model.set({
            citationCount: sum,
            citationLabel: 'citations',
          });
        }
      } else {
        this.model.unset('citationCount');
        this.model.unset('citationLabel');
      }
    },

    defaultQueryArguments: {
      fl: 'id',
    },

    dispatchRequest: function(apiQuery) {
      var sort = apiQuery.get('sort');
      if (/citation_count_norm/i.test(sort)) {
        this.defaultQueryArguments = _.extend(this.defaultQueryArguments, {
          stats: 'true',
          'stats.field': 'citation_count_norm',
        });
      } else if (/citation_count/i.test(sort)) {
        this.defaultQueryArguments = _.extend(this.defaultQueryArguments, {
          stats: 'true',
          'stats.field': 'citation_count',
        });
      } else {
        this.model.unset('citationCount');
        this.model.unset('citationLabel');

        // don't bother sending request
        return;
      }
      BaseWidget.prototype.dispatchRequest.call(this, apiQuery);
    },

    /*
     * when users return to index page, we should re-focus on the search bar
     * */

    focusInput: function() {
      if (this._onIndexPage()) {
        this.clearBigQueryPill();
        this.view.clearInput();
      }
    },

    clearBigQueryPill: function() {
      this.model.unset('bigquerySource');
      this.model.unset('bigquery');
    },

    onNavigate: function(page) {
      this.currentPage = page;
      this.focusInput(page);
    },

    handleFeedback: function(feedback) {
      if (
        feedback.code === ApiFeedback.CODES.SEARCH_CYCLE_STARTED ||
        feedback.code === ApiFeedback.CODES.SEARCH_CYCLE_FAILED_TO_START
      ) {
        var query = feedback.query
          ? feedback.query
          : feedback.request.get('query');

        // Grab the original (no simbid refs) query string for the view
        var newq = query.get('__original_query')
          ? query.get('__original_query')[0]
          : query.get('q').join(' ');

        this.setCurrentQuery(query);

        this.model.set({
          bigquerySource: query.get('__bigquerySource')
            ? query.get('__bigquerySource')[0]
            : 'Bulk query',
          bigquery: !!query.get('__qid'),
          numFound: feedback.numFound,
        });

        this.view.setFormVal(newq);
        this.updateState('idle');
      }
    },

    changeDefaultSort: function(query) {
      var currentQuery = this.getCurrentQuery();

      // make sure not to override an explicit sort if there is one
      if (!query.has('sort')) {
        const queryVal = query.get('q')[0];

        // citations operator should be sorted by pubdate, so it isn't added here
        const fields = [
          'trending',
          'instructive',
          'useful',
          'references',
          'reviews',
          'similar',
        ];
        const fieldReg = new RegExp(`(${fields.join('|')})(?=\\()`, 'gi');
        const matches = queryVal.match(fieldReg);

        // we're only concerned with the first match (outermost)
        let sort = 'date desc';
        if (matches) {
          sort = 'score desc';
          if (matches[0] === 'references') {
            sort = 'first_author asc';
          }
        }
        query.set('sort', sort);
      } else if (currentQuery && currentQuery.has('sort')) {
        query.set('sort', currentQuery.get('sort'));
      }
    },

    _onIndexPage: function() {
      // look out for these names, or that the current page is undefined
      return (
        /(index-page|SearchWidget)/.test(this.currentPage) || !this.currentPage
      );
    },

    navigate: function(newQuery) {
      var newQ = newQuery.toJSON();
      var oldQ = _.omit(this.getCurrentQuery().toJSON(), function(val, key) {
        // omit certain fields (highlights, paging)
        return (
          /^hl.*/.test(key) ||
          /^p_$/.test(key) ||
          /^__original_query$/.test(key)
        );
      });

      // apply any default filters only if this is a new search
      if (this._onIndexPage()) {
        newQuery = this.applyDefaultFilters(newQuery);
        newQuery.set('__clearBigQuery', 'true');
      } else {
        // if we aren't on the index page, only refine the current query, don't wipe it out
        newQuery = new ApiQuery(_.assign(oldQ, newQ));
      }

      // remove the bigquery from the query if the user cleared it
      if (newQuery.has('__clearBigQuery')) {
        newQuery.unset('__qid');
      } else if (newQuery.has('__qid') && !this._onIndexPage()) {
        newQuery.set('__saveBigQuery', 'true');
      }

      this.view.setFormVal(newQuery.get('q')[0]);
      this.setCurrentQuery(newQuery);
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'search-page', {
        q: newQuery,
      });
    },

    openQueryAssistant: function(queryString) {
      if (queryString) {
        this.view.setFormVal(queryString);
      }
      this.view.$el.find('.show-form').click();
    },

    onShow: function() {
      // only focus on the index-page
      if (this._onIndexPage()) {
        var $input = this.view.$('input[name=q]');

        // attempt to focus a few times, firefox has some problems otherwise
        var id;
        (function retry(count) {
          $input.blur().focus();
          if ($input.is(':focus') || count > 9) {
            return clearTimeout(id);
          }
          setTimeout(retry, 500, count + 1);
        })(0);
      }
    },

    onDestroy: function() {
      this.view.destroy();
    },

    onLoading: function() {
      this.model.set('loading', true);
    },

    onIdle: function() {
      this.model.set('loading', false);
    },
  });

  _.extend(SearchBarWidget.prototype, Dependon.BeeHive);
  return SearchBarWidget;
});
