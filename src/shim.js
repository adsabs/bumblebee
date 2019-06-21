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
  try {
    var version = APP_VERSION ? '.' + APP_VERSION : '';
    var loc = window.location;
    var parts = loc[loc.pathname === '/' ? 'hash' : 'pathname'].replace(/#/g, '').split('/');
    var path = parts.reverse().filter(function (p) {
      return Object.keys(paths).indexOf(p) > -1;
    });
    path = path.length && path[0];
    load = function () {
      // attempt to get bundle config
      require([paths[path] + '.config' + version], function () {}, function() {
        // on failure to load specific bundle; load generic one
        require(['discovery.config' + version]);
      });
    };
  } catch (e) {
    load = function () {
      // on errors, just fallback to normal config
      require(['discovery.config' + version]);
    };
  }

  (function checkLoad() {
    if (window.requirejs) {
      return load();
    }
    setTimeout(checkLoad, 10);
  })();

})();
