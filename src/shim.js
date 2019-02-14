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
    var loc = window.location;
    var parts = loc[loc.pathname === '/' ? 'hash' : 'pathname'].split('/');
    var path = parts[+(parts.length > 1)].replace('#', '');
    load = function () {
      // attempt to get bundle config
      require([paths[path] + '.config'], setGlobalLinkHandler, function() {
        // on failure to load specific bundle; load generic one
        require(['discovery.config'], setGlobalLinkHandler);
      });
    };
  } catch (e) {
    load = function () {
      // on errors, just fallback to normal config
      require(['discovery.config'], setGlobalLinkHandler);
    };
  }

  (function checkLoad() {
    if (window.requirejs) {
      return load();
    }
    setTimeout(checkLoad, 10);
  })();

  var setGlobalLinkHandler = function () {

    var routes = [
      'classic-form',
      'paper-form',
      'index',
      'search',
      'execute-query',
      'abs',
      'user',
      'orcid-instructions',
      'public-libraries'
    ];
    var regx = new RegExp('^#(\/?(' + routes.join('|') + ').*\/?)?$', 'i');

    // apply a global link handler for push state
    require(['jquery'], function ($) {

      var $el = [];
      $(document).on('mousedown', 'a', function (ev) {
        if (!Backbone.history.options.pushState) return;
        $el = $(ev.currentTarget);
        var href = $el.attr('href');
        if (regx.test(href)) {
          var url = href.replace(/^\/?#\/?/, '/');
          $el.attr('href', url);
          return false;
        }
        $el = [];
      });

      $(document).on('click', 'a', function () {
        if ($el.length && window.bbb) {
          var href = $el.attr('href');

          // clear it so we don't have one lingering around
          $el = [];
          try {
            var nav = bbb.getBeeHive().getService('Navigator');
            nav.router.navigate(href, { trigger: true, replace: true });
            return false;
          } catch (e) {
            console.error(e.message);
          }
        }
      });
    });
  };
})();
