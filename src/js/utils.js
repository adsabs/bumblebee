define([
  'jquery',
  'underscore',
  'analytics'
], function ($, _, analytics) {

  const qs = function (key, str, separator) {
    const k = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var pattern = '(^|[\\?&])' + k + '=[^&]*';
    var match = (str || location.hash).match(new RegExp(pattern, 'g'));
    if (!match) {
      return null;
    } else {
      var clean = []
      // remove 'key=' from string, combine with optional separator and unquote spaces
      for (var i = 0 ; i < match.length ; i++) {
        clean.push(match[i].replace(new RegExp('(^|[\\?&])' +  k + '='), ''));
      }
      if (separator) {
        var msg = clean.join(separator);  // works even if separator is undefined
        return decodeURIComponent(msg.replace(/\+/g, " "));
      } else if (separator === false) {
        return _.map(clean, function (msg) {
          return decodeURIComponent(msg.replace(/\+/g, " "));
        });
      }
    }
  };

  const updateHash = function (key, value, hash) {
    const k = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&");
    const h = _.isString(hash) ? hash : location.hash;
    const match = h.match(new RegExp("&?"+ k +"=([^&]+)(&|$)"));
    if (match) {
      const mat = match[0].replace(match[1], value);
      return h.replace(match[0], mat);
    }
    return hash;
  };

  const difference = function (obj, base) {
    return _.transform(obj, function (result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] = _.isObject(value) && _.isObject(base[key]) ?
          difference(value, base[key]) : value;
      }
    });
  };

  // get the current browser information
  const getBrowserInfo = function () {
    // do this inline, so we only request when necessary
    const $dd = $.Deferred();

    // reject after 3 seconds
    const timeoutId = setTimeout(() => { $dd.reject(); }, 3000);
    require(['bowser'], (bowser) => {
      window.clearTimeout(timeoutId);
      $dd.resolve(bowser.parse(window.navigator.userAgent));
    }, () => { $dd.reject(); });

    return $dd.promise();
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
      analytics('send', {
        hitType: 'timing',
        timingCategory: this.timingCategory,
        timingVar: this.timingVar,
        timingLabel: this.timingLabel,
        timingValue: time
      });
      this._emitted = true;
    }
  };

  const waitForSelector = (...args) => {
    const $dd = $.Deferred();
    const timeout = 3100; // 31 seconds
    let ref = null;
    (function check (n) {
      const $el = $(...args);
      if ($el.length) {
        return $dd.resolve($el);
      } else if (n >= timeout) {
        return $dd.reject('timeout');
      }
      ref = setTimeout(() => {
        window.requestAnimationFrame(() => check(++n));
      }, 100);
    })(0);
    $dd.promise.destroy = () => {
      window.clearTimeout(ref);
      $dd.reject();
    }
    return $dd.promise();
  }

  const withPrerenderedContent = (view) => {
    view.handlePrerenderedContent = (content, $el) => {

      // setup the elements so events are properly delegated
      view.$el = $(view.tagName + '.' + view.className, $el);
      view.el = view.$el.get(0);
      view.delegateEvents();

      // reset on first model change
      view.model.once('change', () => view.getTemplate = () => view.getOption('template'))

      // override the template to provide our pre-rendered content
      view.getTemplate = () => content;
    };
    return view;
  };

  return {
    qs: qs,
    updateHash: updateHash,
    difference: difference,
    getBrowserInfo: getBrowserInfo,
    TimingEvent: TimingEvent,
    waitForSelector: waitForSelector,
    withPrerenderedContent: withPrerenderedContent
  };
});
