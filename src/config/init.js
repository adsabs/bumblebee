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
  const CDN = 'https://ads-assets.pages.dev';
  const COOKIE_NAME = 'app_load_attempts';

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
  const version = APP_VERSION ? `v=${APP_VERSION}` : '';
  // eslint-disable-next-line no-console
  const log = (message) => console.debug(`[DEBUG] ${message}`);
  const getBasePath = () => {
    const path = window.location.pathname;
    // Strip everything after the first segment, keeping only the base like "/search"
    const base = path.split('/').filter(Boolean)[0];
    return `/${base || ''}`;
  };

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

  const createLoader = function(module) {
    if (typeof require !== 'function') {
      throw new Error('RequireJS is not available, app cannot load');
    }
    log(`Adding loader for ${module}`);
    return () => {
      log(`Loading ${module}...`);
      return new Promise((res, rej) => {
        const cb = (mod) => {
          log(`Loaded module ${module} successfully`);
          res(mod);
        };
        const errBack = (err) => {
          log(`Error loading module ${module}.`, err);
          rej(err);
        };
        if (process.env.NODE_ENV === 'development') {
          window.requirejs([module], cb, errBack);
          return;
        }
        window.requirejs([`${CDN}/${module}.js`], cb, () => {
          window.requirejs([module], cb, errBack);
        });
      });
    };
  };

  /**
   * Get the appropriate loader based on the current path.
   */
  const getPathLoader = () => {
    const basePath = getBasePath();
    if (basePath.startsWith('/abs')) {
      return createLoader(`config/${PATHS.ABSTRACT}.config`);
    }

    if (basePath.startsWith('/search')) {
      return createLoader(`config/${PATHS.SEARCH}.config`);
    }

    if (basePath === '/') {
      return createLoader(`config/${PATHS.LANDING}.config`);
    }

    return () => Promise.resolve();
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
      return parseInt(getCookie(COOKIE_NAME), 10) || 1;
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
    if (retries >= MAX_RETRIES) {
      log(`Failed to load config after ${MAX_RETRIES} attempts`);
      showAppErrorMessage(`
        <p>Failed to load.</p>
        <p>Maybe your network or our server is down? Please try again later.</p>
      `);
      deleteCookie(COOKIE_NAME);
      return;
    }

    const loaders =
      process.env.NODE_ENV === 'development'
        ? [createLoader('config/discovery.config')]
        : [getPathLoader(), createLoader('config/main.config'), createLoader('config/discovery.config')];

    // eslint-disable-next-line no-restricted-syntax
    for (const loader of loaders) {
      loader()
        .then(() => {
          deleteCookie(COOKIE_NAME);
        })
        .catch((e) => {
          log(`Attempt ${retries}: ${loader.name} failed`, e);
          showAppErrorMessage(`Failed to load. Refreshing... (attempt ${retries}/${MAX_RETRIES})`);
          setTimeout(() => {
            // only reload if the user is seeing the loading splash screen
            if (document.getElementById('loading-screen-title')) {
              // If all loaders fail, update the retry count and reload the page
              setCookie(COOKIE_NAME, retries + 1, 5);
              window.location.reload();
            }
          }, 5000);
        });
    }

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
      window.requirejs.config({ urlArgs: version, waitSeconds: getModuleTimeout() });
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

  const [changedUrl] = couldChangeUrls.filter(({ url }) => !canonicalUrlPattern.test(url));

  // if we detect a change in one of the URLs, return an interpolated string to keep from getting rewritten
  if (typeof changedUrl !== 'undefined') {
    return `https://${[changedUrl.env, 'adsabs', 'harvard', 'edu'].join('.')}`;
  }
  return `https://${['ui', 'adsabs', 'harvard', 'edu'].join('.')}`;
};
