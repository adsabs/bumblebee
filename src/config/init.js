/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
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
  const MAX_RETRIES = 3;
  const MODULE_TIMEOUTS = { slow: 30, default: 7 };

  /**
   * Get the module timeout based on the user's connection speed.
   * @returns {number}
   */
  const getModuleTimeout = () => {
    if ('connection' in navigator) {
      const effectiveType = navigator.connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g') {
        return MODULE_TIMEOUTS.slow;
      }
    }
    return MODULE_TIMEOUTS.default;
  };
  const now = () => Date.now();
  const fullPath = window.location[window.location.pathname === '/' ? 'hash' : 'pathname'].replace(/#/g, '');
  const version = APP_VERSION ? `v=${APP_VERSION}` : `dev-${now()}`;
  const log = (message) => console.debug(`[DEBUG] ${message}`);

  /**
   * Display an error message in the app.
   * @param message
   */
  const showAppErrorMessage = (message) => {
    const errorContainer = document.getElementById('app-error-container');
    const errorMessage = document.getElementById('app-error-message');
    errorContainer.classList.remove('hidden');
    errorMessage.innerHTML = message;
  };

  /**
   * Load the discovery.config file.
   * @returns {Promise<unknown>}
   */
  const getDiscoveryConfigLoader = () => {
    return new Promise((res, rej) => {
      log('Loading discovery.config');
      require({
        waitSeconds: getModuleTimeout(),
      }, ['config/discovery.config'], function() {
        log('Loaded discovery.config successfully');
        res();
      }, function(e) {
        log('Failed to load discovery.config');
        rej(e);
      });
    });
  };

  /**
   * Load the main.config file.
   * @returns {Promise<unknown>}
   */
  const getMainConfigLoader = () => {
    return new Promise((res, rej) => {
      log('Loading main.config');
      require({
        waitSeconds: getModuleTimeout(),
      }, ['config/main.config'], function() {
        log('Loaded main.config successfully');
        res();
      }, function(e) {
        log('Failed to load main.config');
        rej(e);
      });
    });
  };

  /**
   * Load the page config file.
   * @param path
   * @returns {Promise<unknown>}
   */
  const getPageConfigLoader = (path) => {
    return new Promise((res, rej) => {
      log(`Loading ${path}.config`);
      require({
        waitSeconds: getModuleTimeout(),
      }, [`config/${path}.config`], function() {
        log(`Loaded ${path}.config successfully`);
        res();
      }, function(e) {
        log(`Failed to load ${path}.config`);
        rej(e);
      });
    });
  };

  /**
   * Get the appropriate loader based on the current path.
   * @returns {Promise<*>}
   */
  const getLoader = () => {
    if (fullPath.startsWith('/abs')) {
      return getPageConfigLoader(PATHS.ABSTRACT);
    }

    if (fullPath.startsWith('/search')) {
      return getPageConfigLoader(PATHS.SEARCH);
    }

    if (fullPath === '/') {
      return getPageConfigLoader(PATHS.LANDING);
    }

    return getMainConfigLoader();
  };

  /**
   * Set a cookie with a specified name, value, and expiration time in minutes.
   * @param name
   * @param value
   * @param minutes
   */
  const setCookie = (name, value, minutes) => {
    const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };

  /**
   * Get a cookie by name.
   * @param name
   * @returns {null|string}
   */
  const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i];
      const [key, value] = cookie.split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  /**
   * Delete a cookie by setting its expiration date to a past date.
   * @param name
   */
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  };

  /**
   * Get the current retry count from the cookie.
   * @returns {number|number|number}
   */
  const getRetries = () => {
    try {
      return parseInt(getCookie('app_load_attempts'), 10) || 1;
    } catch (e) {
      log(`Failed to parse app_load_attempts cookie: ${e}`);
      return 1;
    }
  };

  /**
   * Loaders will be loaded in this order:
   * [LOAD BY PATHNAME] -> [LOAD MAIN CONFIG] -> [LOAD DISCOVERY CONFIG]
   *
   * @returns {Promise<void>}
   */
  const load = async () => {

    // handle if the user is offline
    if (!navigator.onLine) {
      showAppErrorMessage(`
        <p>It seems you are offline.</p>
        <p>Please check your network connection and try again.</p>
      `);
      window.addEventListener('online', () => load(), { once: true });
      return;
    }

    // check our current retry_count and stop loop if we have hit the max
    const retries = getRetries();
    if (retries === MAX_RETRIES) {
      log(`Failed to load config after ${MAX_RETRIES} attempts`);
      showAppErrorMessage(`
        <p>Failed to load.</p>
        <p>Maybe your network or our server is down? Please try again later.</p>
      `);
      deleteCookie('app_load_attempts');
      return;
    }

    const loaders = [getLoader, getMainConfigLoader, getDiscoveryConfigLoader];

    // eslint-disable-next-line no-restricted-syntax
    for (const loader of loaders) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await loader();
        deleteCookie('app_load_attempts');
        return;
      } catch (e) {
        log(`Attempt ${retries}: ${loader.name} failed`, e);
      }
    }

    showAppErrorMessage(`Failed to load. Refreshing... (attempt ${retries}/${MAX_RETRIES})`);
    setTimeout(() => {
      // If all loaders fail, update the retry count and reload the page
      setCookie('app_load_attempts', retries + 1, 5);
      window.location.reload();
    }, 5000);
  };

  /**
   * Checks if RequireJS is available and configures it if so.
   * If RequireJS is not available, it retries after a short delay.
   *
   * @param {Function} cb - The callback function to execute once RequireJS is ready.
   */
  const checkForRequireJS = (cb) => {
    if (window.requirejs) {
      log('RequireJS is ready, configuring...');
      window.requirejs.config({ urlArgs: version });
      if (typeof cb === 'function') cb();
      return;
    }
    setTimeout(checkForRequireJS, 10);
  };

  // initial entry point
  checkForRequireJS(load);
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
