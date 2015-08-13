define([
    'marionette',
    'js/components/api_query',
    'js/widgets/base/base_widget',
    'hbs!./templates/search_bar_template',
    'hbs!./templates/search_form_template',
    'js/components/query_builder/plugin',
    'js/components/api_feedback',
    'js/mixins/formatter',
    './autocomplete',
    'bootstrap', // if bootstrap is missing, jQuery events get propagated
    'analytics',
    'jquery-ui'
  ],
  function (
    Marionette,
    ApiQuery,
    BaseWidget,
    SearchBarTemplate,
    SearchFormTemplate,
    QueryBuilderPlugin,
    ApiFeedback,
    FormatMixin,
    autocompleteArray,
    bootstrap,
    analytics,
    jqueryUI
    ) {

    $.fn.getCursorPosition = function() {
      var input = this.get(0);
      if (!input) return; // No (input) element found
      if ('selectionStart' in input) {
        // Standard-compliant browsers
        return input.selectionStart;
      } else if (document.selection) {
        // IE
        input.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -input.value.length);
        return sel.text.length - selLen;
      }
    };

    //manually highlight a selection of text, or just move the cursor if no end val is given
    $.fn.selectRange = function (start, end) {
      if (!end) end = start;
      return this.each(function () {
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

    //get what is currently selected in the window
    function getSelectedText() {
      var text = "";
      if (window.getSelection) {
        text = window.getSelection().toString();
      } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
      }
      return text;
    }

    //splits out the part of the text that the autocomplete cares about
    function findActiveAndInactive(textString){

      var split = _.filter(textString.split(/\s+/), function(x){
        if (x) return true;
      });

      var toReturn =  {active: split[split.length - 1]};

      if (split.length > 1){
        split.pop();
        toReturn.inactive =split.join(" ");
      }
      else {
        toReturn.inactive = "";
      }
      return toReturn;
    };


    var SearchBarView = Marionette.ItemView.extend({

      template: SearchBarTemplate,

      render : function(){
        Marionette.ItemView.prototype.render.apply(this, arguments);
        this.render = function(){ return this}
      },

      className : "s-search-bar-widget",

      initialize: function (options) {
        _.bindAll(this, "fieldInsert");
        this.queryBuilder = new QueryBuilderPlugin();
      },

      activate: function(beehive) {
        this.queryBuilder.setQTreeGetter(QueryBuilderPlugin.buildQTreeGetter(beehive));
        var that = this;
        this.queryBuilder.attachHeartBeat(function() {
          that.onBuilderChange();
        });
        this.beehive = beehive;
      },

      onBuilderChange: function() {
        if (this.queryBuilder.isDirty()) {
          var newQuery = this.queryBuilder.getQuery();
          this.setFormVal(newQuery);
        }
      },

      onRender: function () {

        this.$("#search-form-container").append(SearchFormTemplate);
        this.$("#search-gui").append(this.queryBuilder.$el);

        var $input = this.$("input.q");
        this.$input = $input;
        var performSearch = true;

        $input.autocomplete({
          minLength: 1,
          autoFocus : true,
          //default delay is 300
          delay : 0,
          source:  function( request, response ) {

            var toMatch, matcher, toReturn;

            //don't look for a match if the keydown event was a backspace
            if (!performSearch){
              $input.autocomplete("close");
              return;
            }

            toMatch = findActiveAndInactive(request.term.trim()).active;
            if (!toMatch)
              return
            //testing each entry's "match" var in autocomplete array against the toMatch segment
            //then returning a uniqued array of matches
            matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(toMatch), "i");
            toReturn  = $.grep(autocompleteArray, function (item) {
              return matcher.test(item.match);
            });
            toReturn = _.uniq(toReturn, false, function(item){
              return item.label
            });
            response(toReturn);
          },

          /* insert a suggestion: requires autofocus:true
           * to be set if you want to show by default without user
           * keyboard navigation or mouse hovering
           * */
          focus: function( event, ui ) {

            var val = $input.val().replace(/^\s+/,"");
            suggest = ui.item.value;

            var exists, toMatch, confirmedQuery, splitQuery;

            var currentlySelected = getSelectedText();
            //might be moving down the autocomplete list
            if (currentlySelected){
              exists = val.slice(0, val.length - currentlySelected.length)
            }
            else {
              exists = val;
            }

            splitQuery = findActiveAndInactive(exists);

            toMatch = splitQuery.active,
              confirmedQuery = splitQuery.inactive;

            if (confirmedQuery){
              //suggestedQ will be inserted if user accepts it
              $input.data("ui-autocomplete").suggestedQ = confirmedQuery + " " + ui.item.value;
            }
            else {
              $input.data("ui-autocomplete").suggestedQ = ui.item.value;
            }

            // only insert text if the words match from the beginning
            // not, for instance, if user typed "refereed" and the matching string is "property:refereed"
            if ( suggest.indexOf(toMatch) == 0 ) {

              var text, rest, all;

              text = confirmedQuery ? confirmedQuery + " " + toMatch : toMatch;
              rest = suggest.slice(toMatch.length);
              all = text + rest;

              $input.val(all);
              $input.selectRange(text.length, all.length);

            }
            else {
              $input.val(exists);
            }

            return false;
          },

          //re-insert actual text w/ optional addition of autocompleted stuff
          select : function( event, ui ){
            $input.val( $input.data("ui-autocomplete").suggestedQ);
            //move cursor before final " or )
            var final = ui.item.value.split("").reverse()[0];
            if ( final == '"' || final == ")" ){
              $input.selectRange($input.val().length - 1);
            }
            return false;
          }

        });

        $input.data("ui-autocomplete")._renderItem = function( ul, item ) {
          if (item.desc){
            return $( "<li>" )
              .append( "<a>" + item.label + "<span class=\"s-auto-description\">&nbsp;&nbsp;" + item.desc + "</span></a>" )
              .appendTo( ul );
          }
          else {
            return $( "<li>" )
              .append( "<a>" + item.label + "</a>" )
              .appendTo( ul );
          }
        };

        $input.keydown(function (event) {
          if (event.keyCode == 8) {
            performSearch = false; //backspace, do not perform the search
          } else {
            performSearch = true; //perform the search
          }
        });

        this.$('[data-toggle="tooltip"]').tooltip();

      },

      events: {
        "click #field-options button" : "fieldInsert",
        "click #search-form-container": function (e) {
          e.stopPropagation();
        },
        "click #search-form-container .title": "toggleFormSection",
        "click .show-form": "onShowForm",
        "submit form[name=main-query]": "submitQuery",
        "click .icon-clear" : "clearInput",
        "keyup .q" : "storeCursorInfo",
        "select .q" : "storeCursorInfo",
        "click .q" : "storeCursorInfo"

      },

      toggleClear : function(){
        var display = Boolean(this.$input.val());
        if (display){
          this.$(".icon-clear").removeClass("hidden");
        }
        else {
          this.$(".icon-clear").addClass("hidden");
        }
      },

      clearInput : function(e){
        this.$input.val("");
        this.$(".icon-clear").addClass("hidden");
      },

      getFormVal: function() {
        return this.$input.val();
      },

      setFormVal: function(v) {
        this.$(".q").val(v);
        this.toggleClear();

      },

      setNumFound : function(numFound){
        this.$(".num-found-container").html(this.formatNum(numFound));
      },

      onShowForm: function() {

        analytics('send', 'event', 'interaction', 'click', 'query-assistant');

        var formVal = this.getFormVal();
        if (formVal.trim().length > 0) {
          this.queryBuilder.updateQueryBuilder(formVal);
        }
        else { // display a default form
          this.queryBuilder.setRules({
            "condition": "AND",
            "rules": [
              {
                "id": "author",
                "field": "author",
                "type": "string",
                "input": "text",
                "operator": "is",
                "value": ""
              }
            ]
          });
        }

        // show the form
        this.specifyFormWidth();
      },

      specifyFormWidth: function () {
        this.$("#search-form-container").width(this.$(".input-group").width());
      },

      toggleFormSection: function (e) {
        var $p = $(e.target).parent();
        $p.next().toggleClass("hide");
        $p.toggleClass("search-form-header-active");
      },

      //used for the "field insert" function
      _cursorInfo : {
        selected : "",
        startIndex: 0
      },

      storeCursorInfo : function(e){
        var selected = getSelectedText();
        var startIndex = this.$input.getCursorPosition();

        this._cursorInfo = {selected : selected, startIndex : startIndex};

        this.toggleClear();

      },

      fieldInsert: function (e) {
        e.preventDefault();
        var newVal,
          currentVal = this.getFormVal(),
          $target = $(e.target),
          df = $target.attr("data-field"),
          punc = $target.attr("data-punc");

        var startIndex = this._cursorInfo.startIndex,
          selected = this._cursorInfo.selected;
        //selected will be "" if user didn't highlight any text

        if ( df.indexOf("operator-") > -1) {
          var operator = df.split("-").reverse()[0];
          newVal = operator + "(" + selected + ")";

        } else if (df == "first-author") {
          newVal = " author:\"^" + selected + "\"";
        } else if (punc == "\"") {
          newVal = df + ":\"" + selected + "\"";
        }
        else if (punc == "("){
          newVal = df + ":(" + selected + ")";
        }
        else if (!punc){
          //year
          newVal = df + ":" + selected;
        }

        this.setFormVal(currentVal.substr(0, startIndex) +  newVal + currentVal.substr(startIndex + selected.length));

        //put the cursor in the middle of the "" or ()
        if (!selected) {this.$input.selectRange(startIndex + newVal.length -1)}

        //figure out if clear button needs to be there
        this.toggleClear();
      },

      submitQuery: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var query = this.getFormVal();
        this.trigger("start_search", query);
      }
    });

    _.extend(SearchBarView.prototype, FormatMixin);

    var SearchBarWidget = BaseWidget.extend({

      activate: function (beehive) {
        this.pubsub = beehive.Services.get('PubSub');

        // search widget doesn't need to execute queries (but it needs to listen to them)
        this.pubsub.subscribe(this.pubsub.FEEDBACK, _.bind(this.handleFeedback, this));
        this.pubsub.subscribe(this.pubsub.NAVIGATE, _.bind(this.focusInput, this));
        this.view.activate(beehive);
      },

      defaultQueryArguments: {
        //sort: 'date desc',
        fl: 'id'
      },

      /*
       * when users return to index page, we should re-focus on the search bar
       * */

      focusInput : function(page){

        if (page == "index-page"){
          this.view.$("input.q").focus();
        }
      },

      handleFeedback: function(feedback) {
        switch (feedback.code) {
          case ApiFeedback.CODES.SEARCH_CYCLE_STARTED:
            this.setCurrentQuery(feedback.query);
            this.view.setFormVal(feedback.query.get('q').join(' '));
            this.view.setNumFound(feedback.numFound || 0);
            break;
        }
      },

      initialize: function (options) {

        this.currentQuery = undefined;
        this.view = new SearchBarView();
        this.listenTo(this.view, "start_search", function (query) {
          var newQuery = new ApiQuery({
            q: query
          });

          this.changeDefaultSort(newQuery);
          this.navigate(newQuery);
        });

        this.listenTo(this.view, "render", function () {
          var query = this.getCurrentQuery().get("q");
          if (query) {
            this.view.setFormVal(query);
            this.view.$(".icon-clear").removeClass("hidden");
          } else {
            this.view.$(".icon-clear").addClass("hidden");
          }
        });

        BaseWidget.prototype.initialize.call(this, options)
      },

      changeDefaultSort : function(query) {

        //make sure not to override an explicit sort if there is one
        if (!query.has("sort")){
          var queryVal = query.get("q")[0];

          //citations operator should be sorted by pubdate, so it isn't added here
          var toMatch = ["trending(", "instructive(", "useful(", "references(", "reviews("];

          //if there are multiple, this will just match the first operator
          var operator = _.find(toMatch, function(e) {
            if (queryVal.indexOf(e) !== -1) {
              return e
            }
          });

          if (operator == "references("){
            query.set("sort", "first_author asc");
          }
          else if (operator){
            query.set("sort", "score desc");
          }
          else if (!operator) {
            query.set("sort", "date desc");
          }
        }
      },

      navigate: function (newQuery) {
        this.pubsub.publish(this.pubsub.START_SEARCH, newQuery);
      },

      openQueryAssistant: function(queryString) {
        if (queryString) {
          this.view.setFormVal(queryString);
        }
        this.view.$el.find('.show-form').click();
      }
    });
    return SearchBarWidget;
  });