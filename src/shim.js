'use strict';
(function () {

  /*
    Dynamically pick which configuration to use based on the url.
    Then attempt to load the resource, using require, upon failure we
    load a known resource (discovery.config.js)
  */
  var paths = {
    '': 'landing-page',
    'search': 'search-page',
    'abs': 'abstract-page'
  };

  var load;
  var version = window.APP_VERSION ? '?v=' + window.APP_VERSION : '';
  try {
    var loc = window.location;
    var parts = loc[loc.pathname === '/' ? 'hash' : 'pathname'].replace(/#/g, '').split('/');
    var path = parts.reverse().filter(function (p) {
      return Object.keys(paths).indexOf(p) > -1;
    });
    path = path.length && path[0];
    load = function () {
      // attempt to get bundle config
      require([paths[path] + '.config.js' + version], function () {}, function () {
        // on failure to load specific bundle; load generic one
        require(['discovery.config.js' + version]);
      });
    };
  } catch (e) {
    load = function () {
      // on errors, just fallback to normal config
      require(['discovery.config.js' + version]);
    };
  }

  (function checkLoad() {
    if (window.requirejs && typeof load === 'function') {
      return load();
    }
    setTimeout(checkLoad, 10);
  })();

})();
