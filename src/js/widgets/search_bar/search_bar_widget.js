define([
  'underscore',
  'marionette',
  'js/components/api_query',
  'js/widgets/base/base_widget',
  'hbs!js/widgets/search_bar/templates/search_bar_template',
  'hbs!js/widgets/search_bar/templates/search_form_template',
  'hbs!js/widgets/search_bar/templates/option-dropdown',
  'js/components/api_request',
  'js/components/api_targets',
  'js/components/api_feedback',
  'js/mixins/formatter',
  './autocomplete',
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
  ApiQuery,
  BaseWidget,
  SearchBarTemplate,
  SearchFormTemplate,
  OptionDropdownTemplate,
  ApiRequest,
  ApiTargets,
  ApiFeedback,
  FormatMixin,
  autocompleteArray,
  bootstrap,
  jqueryUI,
  Dependon,
  analytics,
  QueryValidator,
  select2,
  oldMatcher
) {
  $.fn.getCursorPosition = function() {
    var input = this.get(0);
    if (!input) return; // No (input) element found
    if ('selectionStart' in input) {
      // Standard-compliant browsers
      return input.selectionStart;
    }
    if (document.selection) {
      // IE
      input.focus();
      var sel = document.selection.createRange();
      var selLen = document.selection.createRange().text.length;
      sel.moveStart('character', -input.value.length);
      return sel.text.length - selLen;
    }
  };

  // manually highlight a selection of text, or just move the cursor if no end val is given
  $.fn.selectRange = function(start, end) {
    if (!end) end = start;
    return this.each(function() {
      if (this.setSelectionRange) {
        this.focus();
        this.setSelectionRange(start, end);
      } else if (this.createTextRange) {
        var range = this.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
      }
    });
  };

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

  // splits out the part of the text that the autocomplete cares about
  function findActiveAndInactive(textString) {
    var split = _.filter(textString.split(/\s+/), function(x) {
      if (x) return true;
    });

    var toReturn = {
      active: split[split.length - 1],
    };

    if (split.length > 1) {
      split.pop();
      toReturn.inactive = split.join(' ');
    } else {
      toReturn.inactive = '';
    }
    return toReturn;
  }

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
      /*
              select
             */
      this.$('#option-dropdown-container').append(OptionDropdownTemplate);

      function matchStart(term, text) {
        if (text.toUpperCase().indexOf(term.toUpperCase()) == 0) {
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

      /*
              end code for select
             */

      var $input = this.$('input.q');
      this.$input = $input;
      var performSearch = true;

      $input.autocomplete({
        minLength: 1,
        autoFocus: true,
        // default delay is 300
        delay: 0,
        source: function(request, response) {
          var toMatch;
          var matcher;
          var toReturn;

          // don't look for a match if the keydown event was a backspace
          if (!performSearch) {
            $input.autocomplete('close');
            return;
          }

          // dont look for a match if cursor is not at the end of search bar
          if ($input.getCursorPosition() !== $input.val().length) {
            $input.autocomplete('close');
            return;
          }

          toMatch = findActiveAndInactive(request.term).active;
          if (!toMatch) return;
          // testing each entry's "match" var in autocomplete array against the toMatch segment
          // then returning a uniqued array of matches
          matcher = new RegExp(
            '^' + $.ui.autocomplete.escapeRegex(toMatch),
            'i'
          );
          toReturn = $.grep(autocompleteArray, function(item) {
            return matcher.test(item.match);
          });
          toReturn = _.uniq(toReturn, false, function(item) {
            return item.label;
          });
          response(toReturn);
        },

        /* insert a suggestion: requires autofocus:true
         * to be set if you want to show by default without user
         * keyboard navigation or mouse hovering
         * */
        focus: function(event, ui) {
          var val = $input.val().replace(/^\s+/, '');
          var suggest = ui.item.value;

          var exists;
          var toMatch;
          var confirmedQuery;
          var splitQuery;

          var currentlySelected = getSelectedText($input[0]);
          // might be moving down the autocomplete list
          if (currentlySelected) {
            exists = val.slice(0, val.length - currentlySelected.length);
          } else {
            exists = val;
          }

          splitQuery = findActiveAndInactive(exists);

          (toMatch = splitQuery.active), (confirmedQuery = splitQuery.inactive);

          if (confirmedQuery) {
            // suggestedQ will be inserted if user accepts it
            $input.data('ui-autocomplete').suggestedQ =
              confirmedQuery + ' ' + ui.item.value;
          } else {
            $input.data('ui-autocomplete').suggestedQ = ui.item.value;
          }

          // only insert text if the words match from the beginning
          // not, for instance, if user typed "refereed" and the matching string is "property:refereed"
          if (suggest.indexOf(toMatch) == 0) {
            var text;
            var rest;
            var all;

            text = confirmedQuery ? confirmedQuery + ' ' + toMatch : toMatch;
            rest = suggest.slice(toMatch.length);
            all = text + rest;

            $input.val(all);
            $input.selectRange(text.length, all.length);
          } else {
            $input.val(exists);
          }

          return false;
        },

        // re-insert actual text w/ optional addition of autocompleted stuff
        select: function(event, ui) {
          $input.val($input.data('ui-autocomplete').suggestedQ);
          // move cursor before final " or )
          var final = ui.item.value.split('').reverse()[0];
          if (final == '"' || final == ')') {
            $input.selectRange($input.val().length - 1);
          } else {
            // just move cursor to the end, e.g. for property: refereed
            $input.selectRange($input.val().length);
          }

          analytics(
            'send',
            'event',
            'interaction',
            'autocomplete-used',
            ui.item.value
          );
          return false;
        },
      });

      $input.data('ui-autocomplete')._renderItem = function(ul, item) {
        if (item.desc) {
          return $('<li>')
            .append(
              '<a>' +
                item.label +
                '<span class="s-auto-description">&nbsp;&nbsp;' +
                item.desc +
                '</span></a>'
            )
            .appendTo(ul);
        }

        return $('<li>')
          .append('<a>' + item.label + '</a>')
          .appendTo(ul);
      };

      $input.bind({
        keydown: function(event) {
          if (event.keyCode == 8) {
            performSearch = false; // backspace, do not perform the search
          } else if (event.keyCode == 32) {
            // space, do not perform the search
            performSearch = false;
          } else {
            performSearch = true; // perform the search
          }
        },

        // don't do anything on paste
        paste: function() {
          performSearch = false;
        },
      });

      $input.popover({
        placement: 'bottom',
        title: 'Empty Search!',
        content: 'Please enter a query to search.',
        animation: true,
        trigger: 'manual',
      });

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
              val = 'author';
              selected = selected.replace(/"/, '"^');
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
        newVal = ' author:"^' + selected + '"';
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
        $input.popover('show');
        $input.on('input change blur', function() {
          $(this).popover('hide');
        });
        return false;
      }
      $input.popover('hide');

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
              '<strong><a href="https://adsabs.github.io/help/search/search-syntax">reading our help page.</a></strong></p>',
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

      var type = fielded ? 'fielded' : 'unfiielded';
      analytics(
        'send',
        'event',
        'interaction',
        type + '-query-submitted-from-search-bar',
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
        this.view.setFormVal(arg.text);
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
      var dbfilters = this.defaultDatabases || [];
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
      var da = this.defaultQueryArguments;
      if (/citation_count_norm/i.test(sort)) {
        da = _.extend(da, {
          stats: 'true',
          'stats.field': 'citation_count_norm',
        });
      } else if (/citation_count/i.test(sort)) {
        da = _.extend(da, {
          stats: 'true',
          'stats.field': 'citation_count',
        });
      } else {
        this.model.unset('citationCount');
        this.model.unset('citationLabel');
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
        var queryVal = query.get('q')[0];

        // citations operator should be sorted by pubdate, so it isn't added here
        var toMatch = [
          'trending(',
          'instructive(',
          'useful(',
          'references(',
          'reviews(',
          'similar(',
        ];

        // if there are multiple, this will just match the first operator
        var operator = _.find(toMatch, function(e) {
          if (queryVal.indexOf(e) !== -1) {
            return e;
          }
        });

        if (operator == 'references(') {
          query.set('sort', 'first_author asc');
        } else if (operator) {
          query.set('sort', 'score desc');
        } else if (!operator) {
          query.set('sort', 'date desc');
        }
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
