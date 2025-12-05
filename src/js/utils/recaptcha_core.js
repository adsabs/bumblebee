/* UMD-style module that works with RequireJS and CommonJS */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RecaptchaCore = factory();
  }
})(this, function() {
  var loadingPromise = null;
  var SCRIPT_ID = 'ads-recaptcha-script';

  var clearLoading = function() {
    loadingPromise = null;
  };

  var createScript = function(siteKey) {
    return new Promise(function(resolve, reject) {
      var existing = document.getElementById(SCRIPT_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      var script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.dataset.siteKey = siteKey;
      script.async = true;
      script.defer = true;
      script.src =
        'https://www.google.com/recaptcha/api.js?render=' +
        encodeURIComponent(siteKey);
      script.onload = function() {
        if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
          window.grecaptcha.ready(function() {
            resolve(window.grecaptcha);
          });
        } else {
          reject(new Error('reCAPTCHA did not initialize'));
        }
      };
      script.onerror = function() {
        reject(new Error('reCAPTCHA failed to load'));
      };
      document.head.appendChild(script);
    })
      .then(function(result) {
        clearLoading();
        return result;
      })
      .catch(function(err) {
        clearLoading();
        throw err;
      });
  };

  var loadRecaptcha = function(siteKey) {
    var existing = document.getElementById(SCRIPT_ID);
    if (
      window.grecaptcha &&
      typeof window.grecaptcha.execute === 'function' &&
      existing &&
      existing.dataset.siteKey === siteKey
    ) {
      return Promise.resolve(window.grecaptcha);
    }
    if (loadingPromise) {
      return loadingPromise;
    }
    loadingPromise = createScript(siteKey);
    return loadingPromise;
  };

  var executeRecaptcha = function(siteKey, action, options) {
    var timeoutMs = (options && options.timeoutMs) || 8000;
    return new Promise(function(resolve, reject) {
      var finished = false;
      var timeout = setTimeout(function() {
        if (!finished) {
          finished = true;
          reject(new Error('reCAPTCHA timed out'));
        }
      }, timeoutMs);

      loadRecaptcha(siteKey)
        .then(function() {
          window.grecaptcha
            .execute(siteKey, { action: action })
            .then(function(token) {
              finished = true;
              clearTimeout(timeout);
              resolve(token);
            })
            .catch(function(err) {
              finished = true;
              clearTimeout(timeout);
              reject(err);
            });
        })
        .catch(function(err) {
          finished = true;
          clearTimeout(timeout);
          reject(err);
        });
    });
  };

  return {
    loadRecaptcha: loadRecaptcha,
    executeRecaptcha: executeRecaptcha,
    SCRIPT_ID: SCRIPT_ID,
  };
});
