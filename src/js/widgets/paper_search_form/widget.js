define([
  'underscore',
  'jquery',
  'js/widgets/base/base_widget',
  'js/components/api_query',
  'js/components/api_request',
  'js/components/api_targets',
  'hbs!js/widgets/paper_search_form/form',
  './topterms',
], function(
  _,
  $,
  BaseWidget,
  ApiQuery,
  ApiRequest,
  ApiTargets,
  FormTemplate,
  AutocompleteData
) {
  const renderAutoCompleteItem = function(ul, item) {
    const re = new RegExp('(' + this.term + ')', 'i');
    const label = item.label.replace(
      re,
      '<span class="ui-state-highlight">$1</span>'
    );
    const $li = $('<li/>').appendTo(ul);
    $('<a/>')
      .html(label)
      .appendTo($li);
    return $li;
  };

  const getAutoCompleteSource = (request, response) => {
    const matches = $.map(AutocompleteData, function(item) {
      if (_.isString(request.term)) {
        const term = request.term.toUpperCase();
        const bibstem = item.value.toUpperCase();
        const label = item.label.toUpperCase();
        if (
          bibstem.indexOf(term) === 0 ||
          label.indexOf(term) === 0 ||
          label.replace(/^THE\s/, '').indexOf(term) === 0
        ) {
          return item;
        }
      }
    });
    return response(matches);
  };

  const createAutoComplete = (el) => {
    const $input = $('input#bibstem', el);

    // don't rebind to the element
    if ($input.data('ui-autocomplete')) {
      return;
    }

    $input.on('keyup', (e) => {
      if (e.keyCode === 13) {
        $input.trigger('enter');
      }
    });

    $input.autocomplete({
      minLength: 1,
      autoFocus: true,
      source: getAutoCompleteSource,
    });
    $input.data('ui-autocomplete')._renderItem = renderAutoCompleteItem;
  };

  const View = Marionette.ItemView.extend({
    template: FormTemplate,
    className: 'paper-search-form',
    onRender() {
      createAutoComplete(this.el);
      setTimeout(() => {
        $('input', this.el)
          .get(0)
          .focus();
      }, 100);
    },
    events: {
      'submit form': 'submit',
    },
    _submit: _.debounce(
      function(e) {
        const type = $(e.target).addClass('submitted').data('formType');
        const $inputs = $('input, textarea', e.target);

        // parse the inputs' values into an object
        const data = $inputs.toArray().reduce((acc, el) => {
          acc[el.name] = el.value;
          return acc;
        }, {});

        // disable to form, change the button to loading, and trigger submit
        this.setFormDisabled(true);
        $('button', e.target).html(
          '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Submitting...'
        );
        this.trigger('submit', type, data);
      },
      1000,
      { leading: true, trailing: false }
    ),
    submit(e) {
      e.preventDefault();
      this._submit(e);
    },
    setFormDisabled(disable) {
      $('input, textarea, button', this.el)
        .prop('disabled', disable)
        .toggleClass('disabled', disable);
      $('button', this.el).html(`
        <i class="fa fa-search" aria-hidden="true"></i> Search
      `);
    },
    onDone() {
      this.setFormDisabled(false);
    },
    onFail(msg = 'Error') {
      // show an error message, and then remove it next time the user focuses on an input
      const $el = $(this.el);
      const $submittedContainer = $('form.submitted', $el).closest('.row');
      $(`
        <div class="alert alert-danger" id="error-message">
          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>  <strong>${msg}</strong>
        </div>
      `).insertAfter($submittedContainer);
      this.setFormDisabled(false);
      $('input, textarea, button', $el).one('focus', () => {
        $('#error-message', $el).remove();
        $('form.submitted', $el).removeClass('submitted');
      });
    },
    onReset() {
      this.render();
    },
    onShow() {
      this.setFormDisabled(false);
      $('input', this.el)
        .get(0)
        .focus();
    },
  });

  const extractBibcodeFromReference = (data) => {
    const {score, bibcode} = data;
    if (score !== '0.0' && bibcode) {
      return bibcode;
    }
    return null;
  }

  const PaperForm = BaseWidget.extend({
    initialize() {
      this.view = new View();
      this.view.on('submit', this.onSubmit.bind(this));
    },
    activate(beehive) {
      BaseWidget.prototype.activate.call(this, beehive);
      const ps = this.getPubSub();
      ps.subscribe(ps.CUSTOM_EVENT, (ev, data) => {
        if (ev === 'start-new-search') {
          this.onNewSearch();
        } else if (ev === 'second-order-search/error') {
          this.view.triggerMethod('fail', data.message);
        }
      });
    },
    onNewSearch() {
      this.view.triggerMethod('reset');
    },
    processResponse() {},
    onSubmit(type, data) {
      switch (type) {
        case 'reference':
          {
            this.sendReferenceQuery(data)
              .done(({ resolved }) => {
                const bib = extractBibcodeFromReference(resolved);
                if (bib) {
                  return this.doSearch(`bibcode:${bib}`);
                }
                this.view.triggerMethod(
                  'fail',
                  'No bibcodes matching reference string'
                );
              })
              .fail((event) => {
                if (event.responseJSON && event.responseJSON.error) {
                  return this.view.triggerMethod(
                    'fail',
                    event.responseJSON.error
                  );
                }
                this.view.triggerMethod(
                  'fail',
                  'Error occurred sending reference request'
                );
              });
          }
          break;

        case 'journal':
          {
            try {
              const queryStr = Object.keys(data)
                .filter((k) => data[k].trim())
                .map((k) => `${k}:${data[k]}`)
                .join(' ');
              this.doSearch(queryStr);
            } catch (e) {
              this.view.triggerMethod('fail', 'Error parsing journals');
            }
          }
          break;

        case 'bibcodes':
          {
            try {
              const bibcodes = data.bibcodes.split(/\s+/).filter((s) => !!s);
              if (bibcodes.length === 0) {
                return this.view.triggerMethod('done');
              }
              this.doBigSearch(bibcodes);
            } catch (e) {
              this.view.triggerMethod('fail', 'Error parsing bibcodes');
            }
          }
          break;
      }
    },
    doBigSearch(bibcodes = []) {
      const ps = this.getPubSub();
      ps.publish(ps.CUSTOM_EVENT, 'second-order-search/limit', {
        ids: bibcodes,
      });
    },
    doSearch(queryStr = '') {
      const query = new ApiQuery({
        q: queryStr,
        sort: ['date desc'],
      });

      const ps = this.getPubSub();
      ps.publish(ps.NAVIGATE, 'search-page', {
        q: query,
        context: {
          referrer: 'PaperSearchForm',
        },
      });
    },
    sendReferenceQuery(data) {
      const $dd = $.Deferred();
      const ps = this.getPubSub();
      const request = new ApiRequest({
        target: ApiTargets.REFERENCE + '/' + encodeURIComponent(data.reference),
        query: new ApiQuery({}),
        options: {
          type: 'GET',
          headers: {
            Accept: 'application/json; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8',
          },
          done: (data) => $dd.resolve(data),
          fail: (...args) => $dd.reject(...args),
          always: () => $dd.always(),
        },
      });
      ps.publish(ps.EXECUTE_REQUEST, request);
      return $dd.promise();
    },
    onShow() {
      this.view.triggerMethod('show');
    },
  });
  return PaperForm;
});
