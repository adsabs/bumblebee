define(['underscore', 'jquery'], function (_, $) {
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
      url: _.template('link_gateway/<%= bibcode %>/<%= target %>'),
    },
  };

  /**
   * fire off the xhr request to the url
   *
   * @param {string} url
   * @param {object} data
   */
  var sendEvent = function (url) {
    $.ajax({url: url, type: 'GET'});
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
    if (_.isString(label) && _.isPlainObject(data) && _.has(data, 'target')) {
      _.forEach(TARGETS, function (val) {
        var target = null;
        _.forEach(val.types, function (type) {
          if (_.isArray(type)) {
            if (type[0] === data.target && _.has(type[1], 'redirectTo')) {
              target = type[1].redirectTo;
            }
          } else if (type === data.target) {
            target = type;
          }
        });

        // send event if we find a hook and the target is in the list of types
        if (_.contains(val.hooks, label) && target) {
          var params = _.assign({}, data, {target: target});
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

  const Analytics = function (action, event, type, description, ...args) {
    adsLogger.apply(null, _.rest(arguments, 3));

    // if the action is send and the event is event, then we want to send the event to the dataLayer
    if (
      action === 'send' &&
      event === 'event' &&
      Array.isArray(window.dataLayer)
    ) {
      // some events are 'interaction' or 'error', so add that to the event name
      window.dataLayer.push({
        event: `${type}_${description}`,

        // if the next argument is an object, we'll use that as the data, ignore an extra arguments
        value1: args[0],
        value2: args[1],
        value3: args[2],
      });
    }
  };

  return Analytics;
});
