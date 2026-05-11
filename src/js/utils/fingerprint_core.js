/* UMD-style module that works with RequireJS and CommonJS */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('js/utils/fingerprint_core', [], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FingerprintCore = factory();
  }
})(this, function() {
  var SCRIPT_ID = 'ads-fingerprint-script';
  var visitorId = null;
  var loadingPromise = null;

  var injectScript = function(apiKey) {
    return new Promise(function(resolve, reject) {
      var existing = document.getElementById(SCRIPT_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      var script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src =
        'https://fpjscdn.net/v3/' +
        encodeURIComponent(apiKey) +
        '/iife.min.js';
      script.onload = resolve;
      script.onerror = function() {
        reject(new Error('FingerprintJS Pro script failed to load'));
      };
      document.head.appendChild(script);
    });
  };

  var load = function(apiKey) {
    if (!apiKey) {
      return Promise.resolve();
    }
    if (loadingPromise) {
      return loadingPromise;
    }
    loadingPromise = injectScript(apiKey)
      .then(function() {
        return window.FingerprintJS.load();
      })
      .then(function(fp) {
        return fp.get();
      })
      .then(function(result) {
        visitorId = (result && result.visitorId) || null;
      })
      .catch(function() {
        visitorId = null;
        loadingPromise = null; // allow retry on transient failure
      });
    return loadingPromise;
  };

  var getVisitorId = function() {
    return visitorId;
  };

  // Reset module state — used by tests only
  var _reset = function() {
    visitorId = null;
    loadingPromise = null;
    var existing = document.getElementById(SCRIPT_ID);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  };

  return {
    load: load,
    getVisitorId: getVisitorId,
    SCRIPT_ID: SCRIPT_ID,
    _reset: _reset,
  };
});
