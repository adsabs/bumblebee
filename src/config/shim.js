(function() {
  // ############ DON'T EDIT THIS LINE
  // prettier-ignore
  var APP_VERSION="";
  // #################################

  /*
    Dynamically pick which configuration to use based on the url.
    Then attempt to load the resource, using require, upon failure we
    load a known resource (discovery.config.js)
  */
  var paths = {
    '': 'landing-page',
    search: 'search-page',
    abs: 'abstract-page',
  };

  var load;
  var version = APP_VERSION ? 'v=' + APP_VERSION : '';
  try {
    var loc = window.location;
    var parts = loc[loc.pathname === '/' ? 'hash' : 'pathname']
      .replace(/#/g, '')
      .split('/');
    var path = parts.reverse().filter(function(p) {
      return Object.keys(paths).indexOf(p) > -1;
    });
    path = path.length && path[0];
    load = function() {
      // attempt to get bundle config
      require([
        'config/' + paths[path] + '.config.js',
      ], function() {}, function() {
        // on failure to load specific bundle; load generic one
        require(['config/discovery.config.js']);
      });
    };
  } catch (e) {
    load = function() {
      // on errors, just fallback to normal config
      require(['config/discovery.config.js']);
    };
  }

  (function checkLoad() {
    if (window.requirejs && typeof load === 'function') {
      window.requirejs.config({
        waitSeconds: 30,
        urlArgs: version,
      });

      return load();
    }
    setTimeout(checkLoad, 10);
  })();
})();
