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
    var path = loc[loc.pathname === '/' ? 'hash' : 'pathname'].split('/')[0].replace('#', '');
    load = function () {
      // attempt to get bundle config
      require([paths[path] + '.config'], function() {
        // do nothing
      }, function() {
        // on failure to load specific bundle; load generic one
        require(['discovery.config']);
      });
    };
  } catch (e) {
    load = function () {
      // on errors, just fallback to normal config
      require(['discovery.config']);
    };
  }

  (function checkLoad() {
    if (window.requirejs) {
      return load();
    }
    else {
      setTimeout(checkLoad, 10);
    }
  })();

  var setGlobalLinkHandler = function () {
    // apply a global link handler for push state
    require(['jquery'], function ($) {
      $(document).on('click', 'a', function (ev) {
        if (Backbone.history.options.pushState) {

          var href = $(ev.currentTarget).attr('href');

          /*
            this should filter out hrefs that look like:
            `http://mysite.com`
            `//mysite.com`
            `#`
            `#local-reference`
            `` <- empty routes
          */
          if (!href.match(/^(https?|$|#$|\/\/)/) &&
            !ev.altKey &&
            !ev.ctrlKey &&
            !ev.metaKey &&
            !ev.shiftKey &&
            window.bbb
          ) {
            var url = href.replace(/^\/?#\/?/, '/');
            try {
              var nav = bbb.getBeeHive().getService('Navigator');
              nav.router.navigate(url, { trigger: true, replace: true });
            } catch (e) {
              console.log('error ', e);
              return true;
            }
            return false;
          }
        }
      });
    });
  };

  setTimeout(setGlobalLinkHandler, 1000);
})();

