define([
  'jquery',
  'lodash/dist/lodash.compat',
  'analytics',
  'react',
  'js/components/api_query',
  'js/components/api_request',
  'bowser',
], function($, _, analytics, React, ApiQuery, ApiRequest, bowser) {
  const qs = function(key, str, separator) {
    // eslint-disable-next-line no-useless-escape
    const k = key.replace(/[*+?^$.[\]{}()|\\\/]/g, '\\$&'); // escape RegEx meta chars
    var pattern = '(^|[\\?&])' + k + '=[^&]*';
    var match = (str || window.location.hash).match(new RegExp(pattern, 'g'));
    if (!match) {
      return null;
    }
    var clean = [];
    // remove 'key=' from string, combine with optional separator and unquote spaces
    for (var i = 0; i < match.length; i += 1) {
      clean.push(match[i].replace(new RegExp('(^|[\\?&])' + k + '='), ''));
    }
    if (separator) {
      var msg = clean.join(separator); // works even if separator is undefined
      return decodeURIComponent(msg.replace(/\+/g, ' '));
    }
    if (separator === false) {
      return _.map(clean, function(msg) {
        return decodeURIComponent(msg.replace(/\+/g, ' '));
      });
    }
    return null;
  };

  const updateHash = function(key, value, hash) {
    // eslint-disable-next-line no-useless-escape
    const k = key.replace(/[*+?^$.[\]{}()|\\\/]/g, '\\$&');
    const h = _.isString(hash) ? hash : window.location.hash;
    const match = h.match(new RegExp('&?' + k + '=([^&]+)(&|$)'));
    if (match) {
      const mat = match[0].replace(match[1], value);
      return h.replace(match[0], mat);
    }
    return hash;
  };

  const difference = function(obj, base) {
    return _.transform(obj, function(result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] = _.isObject(value) && _.isObject(base[key]) ? difference(value, base[key]) : value;
      }
    });
  };

  // get the current browser information
  const getBrowserInfo = function() {
    return $.Deferred().resolve(bowser.parse(window.navigator.userAgent));
  };

  class TimingEvent {
    constructor(timingVar = 'Timers', timingCategory = 'Generic Timer', timingLabel) {
      this.timingCategory = timingCategory;
      this.timingVar = timingVar;
      this.timingLabel = timingLabel;
      this.time = null;
    }

    start() {
      this.time = +new Date();
      this._emitted = false;
    }

    stop() {
      // do not emit an event if we haven't started timing or already emitted
      if (this._emitted) {
        return;
      }
      const time = +new Date() - this.time;
      analytics('send', 'timing', {
        timingCategory: this.timingCategory,
        timingVar: this.timingVar,
        timingLabel: this.timingLabel,
        timingValue: time,
      });
      this._emitted = true;
    }
  }

  const waitForSelector = (...args) => {
    const $dd = $.Deferred();
    const timeout = 3100; // 31 seconds
    let ref = null;
    (function check(n) {
      const $el = $(...args);
      if ($el.length) {
        return $dd.resolve($el);
      }
      if (n >= timeout) {
        return $dd.reject('timeout');
      }
      ref = setTimeout(() => {
        window.requestAnimationFrame(() => {
          check((n += 1));
        });
      }, 100);
      return null;
    })(0);
    $dd.promise.destroy = () => {
      window.clearTimeout(ref);
      $dd.reject();
    };
    return $dd.promise();
  };

  const withPrerenderedContent = (view) => {
    view.handlePrerenderedContent = (content, $el) => {
      // setup the elements so events are properly delegated
      const selector = view.tagName + '.' + view.className;
      view.$el = $(selector, $el);

      // stops mathjax from pre-rendering before we replace the content
      $('>', view.$el).addClass('tex2jax_ignore');
      view.el = view.$el.get(0);
      view.delegateEvents();

      // replace the current marionette template renderer for a moment
      const _renderTmpl = view._renderTemplate;
      view._renderTemplate = () => {};

      // reset template renderer on first model change
      view.model.once('change', () => {
        view._renderTemplate = _renderTmpl;
      });
    };
    return view;
  };

  const escapeRegExp = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const makeApiQuery = (params) => {
    return new ApiQuery(params);
  };

  const makeApiRequest = (params) => {
    return new ApiRequest(params);
  };

  const extractErrorMessageFromAjax = (maybeXHR, defaultMessage) => {
    if (typeof maybeXHR !== 'undefined' && typeof maybeXHR.responseJSON !== 'undefined') {
      if (typeof maybeXHR.responseJSON.error === 'string') {
        return maybeXHR.responseJSON.error;
      }
      if (typeof maybeXHR.responseJSON.message === 'string') {
        return maybeXHR.responseJSON.message;
      }
    }
    return defaultMessage;
  };

  const createCurryHandler = () => {
    const U = (f) => f(f);
    return function curry(fn) {
      return U((r) => (...args) => (args.length < fn.length ? U(r).bind(null, ...args) : fn(...args)));
    };
  };

  return {
    qs: qs,
    updateHash: updateHash,
    difference: difference,
    getBrowserInfo: getBrowserInfo,
    TimingEvent: TimingEvent,
    waitForSelector: waitForSelector,
    withPrerenderedContent: withPrerenderedContent,
    escapeRegExp: escapeRegExp,
    makeApiQuery: makeApiQuery,
    makeApiRequest: makeApiRequest,
    extractErrorMessageFromAjax,
    curry: createCurryHandler(),
  };
});
