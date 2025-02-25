define([], function () {
  /*
   * Set of targets
   * each has a set of hooks which coorespond to the event label passed
   * types represents the possible event targets which can be used
   * url is a template which will be passed the incoming data
   */
  var TARGETS = {
    resolver: {
      hooks: [
        'toc-link-followed',
        'abstract-link-followed',
        'citations-link-followed',
        'associated-link-followed',
      ],
      types: [
        'abstract',
        'citations',
        'references',
        'metrics',
        'coreads',
        'similar',
        'graphics',
        'associated',
        'toc',
      ],
      url: ({ bibcode, target }) => `link_gateway/${bibcode}/${target}`,
    },
  };

  /**
   * fire off the xhr request to the url
   *
   * @param {string} url
   * @param {object} data
   */
  var sendEvent = function (url) {
    window.fetch(url, { method: 'GET' }).catch((error) => {
      window.getSentry().captureMessage('Failed to send analytics event', {
        extra: { url, error: error.message },
      });
    });
  };

  /**
   * Go through the targets and fire the event if the label passed
   * matches one of the hooks specified.  Also the data.target must match one
   * of the types listed on the target config
   *
   * @param {string} label - the event label
   * @param {object} data - the event data
   */
  var adsLogger = function (label, data) {
    // if label or data is not present, do nothing
    if (typeof label === 'string' && typeof data === 'object' && data.target) {
      TARGETS.forEach(function (val) {
        var target = null;
        val.types.forEach(function (type) {
          if (Array.isArray(type)) {
            if (type[0] === data.target && 'redirectTo' in type[1]) {
              target = type[1].redirectTo;
            }
          } else if (type === data.target) {
            target = type;
          }
        });

        // send event if we find a hook and the target is in the list of types
        if (val.hooks.includes(label) && target) {
          var params = { ...data, target };
          sendEvent(data.url ? data.url : val.url(params));
        }
      });
    }
  };

  var buffer = [];
  var gaName = window.GoogleAnalyticsObject || 'ga';

  var cleanBuffer = function () {
    if (window[gaName]) {
      for (var i = 0; i < buffer.length; i++) {
        window[gaName].apply(this, buffer[i]);
      }
      buffer = []
    }
  }

  const CACHE_TIMEOUT = 300;
  /**
   * Simple debouncing mechanism with caching
   * this will store stringified version of the incoming events and provide a way to
   * check if the event has recently been cached.  With a short rolling timer to keep the timeout short to hopefully
   * only target duplicate calls.
   */
  class AnalyticsCacher {
    constructor() {
      this.timer = null;
      this.cache = new Set();
    }

    stringify(args) {
      return JSON.stringify(args, function (key, value) {

        // filter out this cache-buster id added by GTM
        if (key === 'gtm.uniqueEventId') {
          return undefined;
        }
        return value;
      });
    }

    add(...args) {
      this._resetTimeout();
      return this.cache.add(this.stringify(args));
    }

    has(...args) {
      return this.cache.has(this.stringify(args));
    }

    _resetTimeout() {
      clearTimeout(this.timer);
      this.timer = setTimeout(this._clear.bind(this), CACHE_TIMEOUT);
    }

    _clear() {
      this.cache.clear();
    }
  }

  const cacher = new AnalyticsCacher();
  const Analytics = function (action, event, type, description, ...args) {
    if (cacher.has(arguments)) {
      return;
    }

    cacher.add(arguments);

    adsLogger.apply(null, Array.prototype.slice.call(arguments, 3));
    // if the action is send and the event is event, then we want to send the event to the dataLayer
    if (Array.isArray(window.dataLayer) &&
      action === 'send' && event === 'event'
    ) {
      // some events are 'interaction' or 'error', so add that to the event name
      window.dataLayer.push({
        event: `${type}_${description}`,

        // if the next argument is an object, we'll use that as the data, ignore an extra arguments
        value1: args[0],
        value2: args[1],
        value3: args[2],
      });
    } else if (Array.isArray(window.dataLayer) && action === 'send') {
      window.dataLayer.push({
        event,
        value1: type,
        value2: description,
        value3: args[0],
      });
    } else if (Array.isArray(window.dataLayer) && action === 'set') {
      window.dataLayer.push({
        event: 'config',
        value1: event,
        value2: type,
        value3: description,
      });
    }
  };

  /**
   * Get the datalayer for sending events to
   * @returns {*|*[]}
   */
  Analytics.getDL = () => {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      return window.dataLayer;
    }
    return [];
  }

  /**
   * Push a new object to the datalayer
   * @param {Object} data
   */
  Analytics.push = (data) => {
    if (cacher.has(data)) {
      return;
    }
    cacher.add(data);
    Analytics.getDL().push(data);
  }

  /**
   * Reset the datalayer
   */
  Analytics.reset = () => {
    Analytics.getDL().push(function() {
      this.reset();
    });
  }

  /**
   * set a value on the datalayer
   * @param {string} property
   * @param {unknown} value
   */
  Analytics.set = (property, value) => {
    Analytics.getDL().push(function() {
      this.set(property, value);
    });
  }

  /**
   * get a value on the datalayer
   * @param {string} property
   */
  Analytics.get = (property) => {
    let value;
    Analytics.getDL().push(function() {
      value = this.get(property);
    });
    return value;
  }

  return Analytics;
});
