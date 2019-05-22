/*
 widgets can attach callbacks to a deferred that waits until
 * grecaptcha is loaded from google, and sitekey info is loaded from discovery.vars.js
 *
 * */
define([
  'backbone',
  'js/components/generic_module',
  'js/mixins/hardened',
  'js/mixins/dependon'
],
function (
  Backbone,
  GenericModule,
  Hardened,
  Dependon
) {


  var RecaptchaManager = GenericModule.extend({

    initialize: function () {
      this.grecaptchaDeferred = window.__grecaptcha__;
      this.siteKeyDeferred = $.Deferred();
      this.when = $.when(this.siteKeyDeferred, this.grecaptchaDeferred);
    },

    activate: function (beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      _.bindAll(this, ['getRecaptchaKey']);
      pubsub.subscribe(pubsub.APP_STARTED, this.getRecaptchaKey);
    },

    getRecaptchaKey: function () {
      var siteKey = this.getBeeHive().getObject('AppStorage').getConfigCopy().recaptchaKey;
      this.siteKeyDeferred.resolve(siteKey);
    },

    /**
       * widgets use this to attach a callback to the recaptcha promise
       * the callback  will automatically put the completed recaptcha into the view's model
       * view template needs an element with the class of "g-recaptcha" for this to work
       *
       * @param view to render recaptcha on
       */
    activateRecaptcha: function (view) {

      if (this.when.state() !== 'resolved') {
        this.renderLoading(view);
      }

      var self = this;
      clearTimeout(this.to);
      this.to = setTimeout(function () {
        if (self.when.state() !== 'resolved') {
          self.renderError(view);
        }
      }, 5000);

      this.when
        .done(_.partial(_.bind(this.renderRecaptcha, this), view))
        .fail(function () {
          self.renderError(view);
        });
    },

    getEl: function (view) {
      return view.$('.g-recaptcha');
    },

    renderLoading: function (view) {
      this.getEl(view).html(
        '<p><i class="fa fa-spinner fa-spin"></i></p>'
      );
      this.enableSubmit(view, false);
    },

    enableSubmit: function (view, bool) {
      view.$('button[type=submit],input[type=submit]')
        .attr('disabled', !bool)
        .on('click', function () {
          grecaptcha.execute();
        });
    },

    renderError: function (view) {
      var msg = 'Error loading ReCAPTCHA, please try again';
      this.getEl(view).html(
        '<p class="text-danger">' + msg + '</p>'
      );
      this.enableSubmit(view, false);
    },

    renderRecaptcha: function (view, siteKey, undefined) {
      this.getEl(view).empty();
      grecaptcha.render(this.getEl(view)[0],
        {
          sitekey: siteKey,
          size: 'invisible',
          badge: 'inline',
          callback: function (response) {
            // this might need to be inserted into the model.
            // or in the case of feedback form, it just needs
            // to be in the serialized form
            if (view.model) {
              view.model.set('g-recaptcha-response', response);
            }
          }
        });
      this.enableSubmit(view, true);
    },

    hardenedInterface: {
      activateRecaptcha: 'activateRecaptcha'
    }

  });

  _.extend(RecaptchaManager.prototype, Hardened, Dependon.BeeHive);

  return RecaptchaManager;
});
