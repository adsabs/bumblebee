define([
  'marionette',
  'js/widgets/base/base_widget',
  'js/components/api_feedback',
  'js/mixins/form_view_functions',
  'js/widgets/success/view',
  'js/components/api_targets',
  'hbs!js/widgets/authentication/templates/log-in',
  'hbs!js/widgets/authentication/templates/register',
  'hbs!js/widgets/authentication/templates/container',
  'hbs!js/widgets/authentication/templates/reset-password-1',
  'hbs!js/widgets/authentication/templates/reset-password-2',
  'js/components/user',
  'analytics',
  'backbone-validation',
  'backbone.stickit',
], function(
  Marionette,
  BaseWidget,
  ApiFeedback,
  FormFunctions,
  SuccessView,
  ApiTargets,
  LogInTemplate,
  RegisterTemplate,
  ContainerTemplate,
  ResetPassword1Template,
  ResetPassword2Template,
  User,
  analytics
) {
  /*
   *
   * any submit action forces the widget to rerender when it
   * gets a success or fail message from pubsub
   *
   * */

  var passwordRegex = /(?=.*\d)(?=.*[a-zA-Z]).{5,}/;

  var FormView;
  var FormModel;

  FormView = Marionette.ItemView.extend({
    activateValidation: FormFunctions.activateValidation,
    checkValidationState: FormFunctions.checkValidationState,
    triggerSubmit: function(ev) {
      ev.preventDefault();

      // simple check if we need to get the recaptcha token
      if (
        this.$el.find('.g-recaptcha').length > 0 &&
        !this.model.has('g-recaptcha-response')
      ) {
        this.model.once('change:g-recaptcha-response', () => {
          FormFunctions.triggerSubmit.apply(this, arguments);
        });
        this.trigger('get-recaptcha-token');
      } else {
        FormFunctions.triggerSubmit.apply(this, arguments);
      }
    },
    dissmissError: function() {
      this.model.set(this.model.defaults());
      this.render();
    },

    modelEvents: {
      change: 'checkValidationState',
    },

    events: {
      'click button[type=submit]': 'triggerSubmit',
      'click a#dismiss-error': 'dissmissError',
    },
  });

  FormModel = Backbone.Model.extend({
    isValidSafe: FormFunctions.isValidSafe,
    reset: FormFunctions.reset,
    defaults: function() {
      return {
        hasError: false,
        errorMsg: '',
      };
    },
  });

  var RegisterModel;
  var RegisterView;

  RegisterModel = FormModel.extend({
    validation: {
      email: {
        required: true,
        pattern: 'email',
        msg: '(A valid email is required)',
      },
      password1: {
        required: true,
        pattern: passwordRegex,
        msg: "(Password isn't valid)",
      },
      password2: {
        required: true,
        equalTo: 'password1',
        msg: '(The passwords do not match)',
      },
      'g-recaptcha-response': {
        required: true,
      },
    },

    target: 'REGISTER',

    /* note: defaults are missing here because
     * they cause the validation to call an error for vals
     * that the user hasnt entered yet
     * */
  });

  RegisterView = FormView.extend({
    template: RegisterTemplate,

    className: 'register s-register',

    bindings: {
      'input[name=email]': {
        observe: 'email',
        setOptions: {
          validate: true,
        },
      },
      'input[name=password1]': {
        observe: 'password1',
        setOptions: {
          validate: true,
        },
      },
      'input[name=password2]': {
        observe: 'password2',
        setOptions: {
          validate: true,
        },
      },
      'g-recaptcha-response': {
        required: true,
      },
    },

    onRender: function() {
      this.activateValidation();
      this.trigger('activate-recaptcha');
    },
  });

  var LogInView;
  var LogInModel;

  LogInModel = FormModel.extend({
    skipReset: ['username'],
    validation: {
      username: {
        required: true,
        pattern: 'email',
        msg: '(A valid email is required)',
      },
      password: {
        required: true,
        pattern: passwordRegex,
        msg: '(A valid password is required)',
      },
    },

    target: 'USER',
  });

  LogInView = FormView.extend({
    template: LogInTemplate,

    className: 'log-in s-log-in',

    bindings: {
      'input[name=username]': {
        observe: 'username',
        setOptions: {
          validate: true,
        },
      },
      'input[name=password]': {
        observe: 'password',
        setOptions: {
          validate: true,
        },
      },
    },

    onRender: function() {
      this.activateValidation();
    },
  });

  var ResetPassword1View;
  var ResetPassword1Model;

  ResetPassword1Model = FormModel.extend({
    skipReset: ['email'],
    validation: {
      email: {
        required: true,
        pattern: 'email',
        msg: '(A valid email is required)',
      },
      'g-recaptcha-response': {
        required: true,
      },
    },

    target: 'RESET_PASSWORD',

    method: 'POST',
  });

  ResetPassword1View = FormView.extend({
    template: ResetPassword1Template,

    className: 'reset-password-1 s-reset-password-1',

    bindings: {
      'input[name=email]': {
        observe: 'email',
        setOptions: {
          validate: true,
        },
      },
    },

    onRender: function() {
      this.activateValidation();
      this.trigger('activate-recaptcha');
    },
  });

  // this view is only accessible after user has clicked on a link in a verification
  // email after they enter the "forgot password form".

  var ResetPassword2View;
  var ResetPassword2Model;

  ResetPassword2Model = FormModel.extend({
    validation: {
      password1: {
        required: true,
        pattern: passwordRegex,
        msg: "(Password isn't valid)",
      },
      password2: {
        required: true,
        equalTo: 'password1',
        pattern: passwordRegex,
        msg: '(The passwords do not match)',
      },
    },

    target: 'RESET_PASSWORD',
    method: 'PUT',
  });

  ResetPassword2View = FormView.extend({
    template: ResetPassword2Template,

    className: 'reset-password-2 s-reset-password-2',

    bindings: {
      'input[name=password1]': {
        observe: 'password1',
        setOptions: {
          validate: true,
        },
      },
      'input[name=password2]': {
        observe: 'password2',
        setOptions: {
          validate: true,
        },
      },
    },

    onRender: function() {
      this.activateValidation();
    },
  });

  var StateModel = Backbone.Model.extend({
    defaults: function() {
      return {
        subView: undefined,
      };
    },
  });

  var AuthenticationContainer = Marionette.LayoutView.extend({
    template: ContainerTemplate,

    initialize: function() {
      this.logInModel = new LogInModel();
      this.registerModel = new RegisterModel();
      this.resetPassword1Model = new ResetPassword1Model();
      this.resetPassword2Model = new ResetPassword2Model();
    },

    modelEvents: { 'change:subView': 'renderSubView' },

    className: 's-authentication-container row s-form-widget',

    regions: {
      container: '.form-container',
    },

    triggers: {
      'click .show-login': 'navigateToLoginForm',
      'click .show-register': 'navigateToRegisterForm',
      'click .show-reset-password-1': 'navigateToResetPassword1Form',
    },

    onRender: function() {
      this.renderSubView();
    },

    renderSubView: function() {
      // figure out which view to show
      var subView = this.model.get('subView');
      if (subView === 'login') {
        this.showLoginForm();
      } else if (subView === 'register') {
        this.showRegisterForm();
      } else if (subView === 'reset-password-1') {
        this.showResetPasswordForm1();
      } else if (subView === 'reset-password-2') {
        this.showResetPasswordForm2();
      }
    },

    showLoginForm: function(error) {
      var view = new LogInView({ model: this.logInModel });

      // show error message
      if (error) {
        view.model.set({ hasError: true, errorMsg: error });
      }

      view.on('submit-form', this.forwardSubmit, this);
      this.container.show(view);
    },

    showRegisterForm: function(error) {
      var view = new RegisterView({ model: this.registerModel });

      // show error message
      if (error) {
        view.model.set({ hasError: true, errorMsg: error });
      }

      view.on('submit-form', this.forwardSubmit, this);
      view.on(
        'activate-recaptcha',
        _.bind(this.forwardActivateRecaptcha, this, view)
      );
      view.on(
        'get-recaptcha-token',
        _.bind(this.forwardGetRecaptchaToken, this, view)
      );
      this.container.show(view);
    },

    showResetPasswordForm1: function(error) {
      var view = new ResetPassword1View({ model: this.resetPassword1Model });

      // show error message
      if (error) {
        view.model.set({ hasError: true, errorMsg: error });
      }

      view.on('submit-form', this.forwardSubmit, this);
      view.on(
        'activate-recaptcha',
        _.bind(this.forwardActivateRecaptcha, this, view)
      );
      view.on(
        'get-recaptcha-token',
        _.bind(this.forwardGetRecaptchaToken, this, view)
      );
      this.container.show(view);
    },

    showResetPasswordForm2: function(error) {
      var view = new ResetPassword2View({ model: this.resetPassword2Model });

      // show error message
      if (error) {
        view.model.set({ hasError: true, errorMsg: error });
      }

      view.on('submit-form', this.forwardSubmit, this);
      this.container.show(view);
    },

    showRegisterSuccessView: function() {
      var view = new SuccessView({ title: 'Registration Successful' });
      this.container.show(view);
    },

    showResetPasswordSuccessView: function() {
      var view = new SuccessView({ title: 'Password Reset Successful' });
      this.container.show(view);
    },

    forwardSubmit: function(viewModel) {
      this.trigger('submit-form', viewModel);
    },

    forwardActivateRecaptcha: function(view) {
      this.trigger('activate-recaptcha', view);
    },

    forwardGetRecaptchaToken: function() {
      this.trigger('get-recaptcha-token');
    },
  });

  var AuthenticationWidget = BaseWidget.extend({
    initialize: function(options) {
      options = options || {};

      this.stateModel = new StateModel();
      this.view = new AuthenticationContainer({
        controller: this,
        model: this.stateModel,
      });
      this.listenTo(this.view, 'submit-form', this.triggerCorrectSubmit);
      this.listenTo(this.view, 'navigateToLoginForm', this.navigateToLoginForm);
      this.listenTo(
        this.view,
        'navigateToRegisterForm',
        this.navigateToRegisterForm
      );
      this.listenTo(
        this.view,
        'navigateToResetPassword1Form',
        this.navigateToResetPassword1Form
      );
      this.listenTo(this.view, 'activate-recaptcha', this.activateRecaptcha);
      this.listenTo(this.view, 'get-recaptcha-token', this.getRecaptchaToken);

      this.nextNav = null;

      if (options.test) window.grecaptcha = null;
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      var pubsub = beehive.getService('PubSub');
      _.bindAll(this, ['handleUserAnnouncement']);
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.handleUserAnnouncement);
    },

    navigateToLoginForm: function() {
      this._navigate({ subView: 'login' });
    },

    navigateToRegisterForm: function() {
      this._navigate({ subView: 'register' });
    },

    navigateToResetPassword1Form: function() {
      this._navigate({ subView: 'reset-password-1' });
    },

    _navigate: function(opts) {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.NAVIGATE, 'authentication-page', opts);
    },

    setSubView: function(subView) {
      this.stateModel.set('subView', subView);
    },

    fireAnalytics: _.partial(analytics, 'send', 'event', 'user'),

    handleUserAnnouncement: function(name, msg) {
      // reset all views and view models
      this.resetAll();

      switch (name) {
        case User.prototype.USER_SIGNED_IN:
          // will immediately redirect
          this.fireAnalytics('login', 'status', 1);
          break;
        case 'login_fail':
          // will also see a relevant alert over the widget
          this.view.showLoginForm(msg);
          this.fireAnalytics('login', 'status', 0, {
            message: msg,
          });
          break;
        case 'register_success':
          this.view.showRegisterSuccessView();
          this.fireAnalytics('login', 'status', 0);
          break;
        case 'register_fail':
          // will also see a relevant alert over the widget
          this.view.showRegisterForm(msg);
          this.fireAnalytics('register', 'status', 0, {
            message: msg,
          });
          break;
        case 'reset_password_1_success':
          this.view.showResetPasswordSuccessView(msg);
          this.fireAnalytics('reset-password', 'status', 1, {
            message: msg,
          });
          break;
        case 'reset_password_1_fail':
          this.view.showResetPasswordForm1(msg);
          this.fireAnalytics('reset-password', 'status', 0, {
            message: msg,
          });
          break;
        case 'reset_password_2_fail':
          this.view.showResetPasswordForm2(msg);
          this.fireAnalytics('reset-password', 'status', 0, {
            message: msg,
          });
          break;
      }
    },

    resetAll: function() {
      this.view.logInModel.reset();
      this.view.registerModel.reset();
      this.view.resetPassword1Model.reset();
    },

    triggerCorrectSubmit: function(model) {
      const session = this.getBeeHive().getObject('Session');
      switch (model.target) {
        case 'REGISTER':
          session.register(
            _.extend({}, model.toJSON(), {
              verify_url:
                location.origin +
                '/#user/account/verify/' +
                ApiTargets.REGISTER,
            })
          );
          break;
        case 'USER':
          session.login(model.toJSON()).done(() => {
            if (this.nextNav) {
              const ps = this.getPubSub();
              ps.publish(ps.NAVIGATE, this.nextNav);
              this.nextNav = null;
            }
          });
          break;
        case 'RESET_PASSWORD': {
          model.method === 'POST'
            ? session.resetPassword1(model.toJSON())
            : session.resetPassword2(model.toJSON());
        }
      }
    },

    setNextNavigation: function(nav) {
      this.nextNav = nav;
    },

    onShow: function() {
      // force a clearing of the view every time the widget is shown again
      this.view.render();
    },

    activateRecaptcha: function(view) {
      this.getBeeHive()
        .getObject('RecaptchaManager')
        .activateRecaptcha({ view: view });
    },

    getRecaptchaToken: function() {
      this.getBeeHive()
        .getObject('RecaptchaManager')
        .execute();
    },
  });

  return AuthenticationWidget;
});
