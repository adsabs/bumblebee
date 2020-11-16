define([], function() {
  const URLS = [
    '//google.com/recaptcha/api.js?&render=explicit&onload=onRecaptchaLoad',
    '//recaptcha.net/recaptcha/api.js?&render=explicit&onload=onRecaptchaLoad',
  ];

  const recaptcha = {
    load: function(name, req, onload) {
      // make a global deferred that will be used by the recaptcha_manager
      window.__grecaptcha__ = $.Deferred();

      // add the global handler which will be called by the recaptcha script
      window.onRecaptchaLoad = function() {
        window.__grecaptcha__.resolve(window.grecaptcha);
      };

      // load each url, we don't care if they take a while or fail
      URLS.forEach((url) => req([url]));

      // load our resource right away, don't wait for recaptcha to be ready
      req([name], (value) => onload(value));
    },
  };

  return recaptcha;
});
