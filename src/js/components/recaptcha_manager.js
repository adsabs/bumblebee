/*
 widgets can attach callbacks to a deferred that waits until
 * grecaptcha is loaded from google, and sitekey info is loaded from discovery.vars.js
 *
 * */
define([
  'backbone',
  'js/components/generic_module',
  'js/mixins/hardened',
  'js/mixins/dependon',
], function(Backbone, GenericModule, Hardened, Dependon) {
  var RecaptchaManager = GenericModule.extend({
    initialize: function() {
      this.grecaptchaDeferred = window.__grecaptcha__;
      this.siteKeyDeferred = $.Deferred();
      this.when = $.when(this.siteKeyDeferred, this.grecaptchaDeferred);
      this.execPromise = $.Deferred();
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      _.bindAll(this, ['getRecaptchaKey']);
      pubsub.subscribe(pubsub.APP_STARTED, this.getRecaptchaKey);
    },

    getRecaptchaKey: function() {
      var siteKey = this.getBeeHive()
        .getObject('AppStorage')
        .getConfigCopy().recaptchaKey;
      this.siteKeyDeferred.resolve(siteKey);
    },

    /**
     * widgets use this to attach a callback to the recaptcha promise
     * the callback  will automatically put the completed recaptcha into the view's model
     * view template needs an element with the class of "g-recaptcha" for this to work
     *
     * @param view to render recaptcha on
     */
    activateRecaptcha: function(view) {
      if (this.when.state() !== 'resolved') {
        this.renderLoading(view);
      }

      var self = this;
      clearTimeout(this.to);
      this.to = setTimeout(function() {
        if (self.when.state() !== 'resolved') {
          self.renderError(view);
        }
      }, 5000);

      this.when
        .done(_.partial(_.bind(this.renderRecaptcha, this), view))
        .fail(function() {
          self.renderError(view);
        });
    },

    getEl: function(view) {
      let $el;
      if (typeof view.$ === 'function') {
        $el = view.$('.g-recaptcha');
      } else if (view.el) {
        $el = $('.g-recaptcha', view.el);
      } else {
        $el = $('.g-recaptcha');
      }
      return $el;
    },

    execute: function() {
      this.execPromise = $.Deferred();
      grecaptcha.execute();
      return this.execPromise.promise();
    },

    renderLoading: function(view) {
      this.getEl(view).html(
        '<p><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></p>'
      );
      this.enableSubmit(view, false);
    },

    enableSubmit: function(view, bool) {
      let $el;
      const selector = 'button[type=submit],input[type=submit]';
      if (typeof view.$ === 'function') {
        $el = view.$(selector);
      } else if (view.el) {
        $el = $(selector, view.el);
      } else {
        $el = $(selector);
      }

      if ($el.length > 0) {
        $el.attr('disabled', !bool);
      }
    },

    renderError: function(view) {
      var msg = 'Error loading ReCAPTCHA, please try again';
      this.getEl(view).html('<p class="text-danger">' + msg + '</p>');
      this.enableSubmit(view, false);
    },

    googleMsg: () => {
      return `<small class="recaptcha-msg">This site is protected by reCAPTCHA and the Google
      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and
      <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a> apply.</small>`;
    },

    renderRecaptcha: function(view, siteKey) {
      const $el = this.getEl(view);
      const msg = $('<div class="form-group"></div>').append(this.googleMsg());
      $el.closest('form').append(msg);
      grecaptcha.render($el[0], {
        sitekey: siteKey,
        size: 'invisible',
        badge: 'inline',
        callback: (response) => {
          // this might need to be inserted into the model.
          // or in the case of feedback form, it just needs
          // to be in the serialized form
          if (view.model) {
            view.model.set('g-recaptcha-response', response);
          }
          this.execPromise.resolve(response);
        },
      });
      this.enableSubmit(view, true);
    },

    hardenedInterface: {
      activateRecaptcha: 'activateRecaptcha',
      execute: 'execute',
    },
  });

  _.extend(RecaptchaManager.prototype, Hardened, Dependon.BeeHive);

  return RecaptchaManager;
});
