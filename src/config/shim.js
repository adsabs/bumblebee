(function() {
  // ############ DON'T EDIT THIS LINE
  // prettier-ignore
  const APP_VERSION="";
  // #################################

  /*
    Dynamically pick which configuration to use based on the url.
    Then attempt to load the resource, using require, upon failure we
    load a known resource (discovery.config.js)
  */
  const PATHS = {
    LANDING: 'landing-page',
    SEARCH: 'search-page',
    ABSTRACT: 'abstract-page',
  };

  const getDefaultLoader = () => {
    /* eslint-disable */
    // @ts-ignore
    return () =>
      require([
        'config/main.config.js',
        'config/discovery.config.js',
      ], undefined, () => require(['config/discovery.config.js']));
    /* eslint-enable */
  };

  const getPathLoader = (path) => {
    /* eslint-disable */
    // @ts-ignore
    return () =>
      require([
        'config/main.config.js',
        `config/${path}.config.js`,
      ], undefined, getDefaultLoader());
    /* eslint-enable */
  };

  let load = getDefaultLoader();
  const version = APP_VERSION ? 'v=' + APP_VERSION : '';
  try {
    const loc = window.location;
    const fullPath = loc[loc.pathname === '/' ? 'hash' : 'pathname'].replace(
      /#/g,
      ''
    );

    if (fullPath === '') {
      load = getPathLoader(PATHS.LANDING);
    } else if (fullPath.startsWith('/search')) {
      load = getPathLoader(PATHS.SEARCH);
    } else if (fullPath.startsWith('/abs')) {
      load = getPathLoader(PATHS.ABSTRACT);
    }
  } catch (e) {
    load = getDefaultLoader();
  } finally {
    (function checkLoad() {
      // sometimes requirejs isn't ready yet, this will wait for it
      if (window.requirejs) {
        window.requirejs.config({
          waitSeconds: 30,
          urlArgs: version,
        });

        return load();
      }
      return setTimeout(checkLoad, 10);
    })();
  }
})();

/**
 * In the case of a proxied URL, we want to show a warning message
 * Do that by checking for the presence of the canonical URL ([ui|dev|qa].adsabs.harvard.edu)
 */
(function checkIfProxied() {
  const canonicalUrlPattern = /^(ui|qa|dev|devui)\.adsabs\.harvard\.edu$/;

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
  const canonicalUrlPattern = /^https:\/\/(ui|qa|dev|devui)\.adsabs\.harvard\.edu$/;

  // URLs that could be rewritten by the proxy server
  const couldChangeUrls = [
    { env: 'ui', url: 'https://ui.adsabs.harvard.edu' },
    { env: 'qa', url: 'https://qa.adsabs.harvard.edu' },
    { env: 'dev', url: 'https://dev.adsabs.harvard.edu' },
    { env: 'devui', url: 'https://devui.adsabs.harvard.edu' },
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
