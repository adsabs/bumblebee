(function() {
  // ############ DON'T EDIT THIS LINE
  // prettier-ignore
  const APP_VERSION="";
  // #################################

  const PATHS = {
    LANDING: 'landing-page',
    SEARCH: 'search-page',
    ABSTRACT: 'abstract-page',
  };

  const log = (message) => console.debug(`[DEBUG] ${message}`);

  const getDefaultLoader = () => {
    log('Using default loader');
    return () =>
      require(['config/main.config'], function() {
        log('Loaded main.config successfully');
        try {
          require(['config/discovery.config'], function() {
            log('Loaded discovery.config successfully');
          }, function() {
            log('Failed to load discovery.config');
          });
        } catch (e) {
          log(`Error loading discovery.config: ${e.message}`);
        }
      }, function() {
        log('Failed to load main.config, loading discovery.config as fallback');
        try {
          require(['config/discovery.config'], function() {
            log('Loaded discovery.config successfully');
          }, function() {
            log('Failed to load discovery.config');
          });
        } catch (e) {
          log(`Error loading discovery.config: ${e.message}`);
        }
      });
  };

  const getPathLoader = (path) => {
    log(`Using path loader for ${path}`);
    return () =>
      require(['config/main.config'], function() {
        log('Loaded main.config successfully');
        try {
          require([`config/${path}.config`], function() {
            log(`Loaded ${path}.config successfully`);
          }, function() {
            log(`Failed to load ${path}.config`);
          });
        } catch (e) {
          log(`Error loading ${path}.config: ${e.message}`);
        }
      }, function() {
        log(`Failed to load main.config, loading discovery.config as fallback for ${path}`);
        try {
          require(['config/discovery.config'], function() {
            log('Loaded discovery.config successfully');
          }, function() {
            log('Failed to load discovery.config');
          });
        } catch (e) {
          log(`Error loading discovery.config: ${e.message}`);
        }
      });
  };

  let load = getDefaultLoader();
  const version = APP_VERSION ? 'v=' + APP_VERSION : '';

  try {
    const loc = window.location;
    const fullPath = loc[loc.pathname === '/' ? 'hash' : 'pathname'].replace(/#/g, '');

    if (fullPath === '') {
      load = getPathLoader(PATHS.LANDING);
    } else if (fullPath.startsWith('/search')) {
      load = getPathLoader(PATHS.SEARCH);
    } else if (fullPath.startsWith('/abs')) {
      load = getPathLoader(PATHS.ABSTRACT);
    }
  } catch (e) {
    log(`Error determining path: ${e.message}`);
    load = getDefaultLoader();
  } finally {
    (function checkLoad() {
      if (window.requirejs) {
        log('RequireJS is ready, configuring...');
        window.requirejs.config({
          waitSeconds: 30,
          urlArgs: version,
        });

        log('Starting module load');
        return load();
      }
      log('RequireJS not ready, retrying...');
      return setTimeout(checkLoad, 10);
    })();
  }
})();

/**
 * In the case of a proxied URL, we want to show a warning message
 * Do that by checking for the presence of the canonical URL ([ui|dev|qa].adsabs.harvard.edu)
 */
(function checkIfProxied() {
  const canonicalUrlPattern = /^(ui|qa|dev|devui|demo)\.adsabs\.harvard\.edu$/;

  // ignore for localhost (development)
  if (/^localhost$/.exec(window.location.hostname)) {
    return;
  }

  // if test fails, it is proxied url, set a class on body element
  if (!canonicalUrlPattern.test(window.location.hostname)) {
    const [bodyEl] = document.getElementsByTagName('body');
    bodyEl.classList.add('is-proxied');
  }
})();

/**
 * Use a list of canonical URLs that might be changed by a proxy server, detect any
 * changes, and return the correct canonical URL.
 */
window.getCanonicalUrl = () => {
  const canonicalUrlPattern = /^https:\/\/(ui|qa|dev|devui|demo)\.adsabs\.harvard\.edu$/;

  // URLs that could be rewritten by the proxy server
  const couldChangeUrls = [
    { env: 'ui', url: 'https://ui.adsabs.harvard.edu' },
    { env: 'qa', url: 'https://qa.adsabs.harvard.edu' },
    { env: 'dev', url: 'https://dev.adsabs.harvard.edu' },
    { env: 'devui', url: 'https://devui.adsabs.harvard.edu' },
    { env: 'demo', url: 'https://demo.adsabs.harvard.edu' },
  ];

  const [changedUrl] = couldChangeUrls.filter(
    ({ url }) => !canonicalUrlPattern.test(url)
  );

  // if we detect a change in one of the URLs, return an interpolated string to keep from getting rewritten
  if (typeof changedUrl !== 'undefined') {
    return `https://${[changedUrl.env, 'adsabs', 'harvard', 'edu'].join('.')}`;
  }
  return `https://${['ui', 'adsabs', 'harvard', 'edu'].join('.')}`;
};
