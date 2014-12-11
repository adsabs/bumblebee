//noinspection Annotator
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'js/widgets/base/base_widget',
    'js/services/orcid_api',
    'js/services/orcid_api_constants',
    'hbs!./templates/orcid_login_template',
    './model'

  ],
  function (_, $, Backbone, Marionette, BaseWidget, OrcidApi, OrcidApiConstants, OrcidLoginTemplate, Model) {

    var OrcidLoginView = Marionette.ItemView.extend({
      template: OrcidLoginTemplate,

      events: {
        "click .login-orcid-button": "loginClick",
        "click .signout-orcid-button": "signoutClick"
      },

      modelEvents:{
        "change:currentState": 'render'
      },

      constructor: function (options){
        this.model = new Model();
        return Marionette.ItemView.prototype.constructor.apply(this, arguments);
      },


      loginClick: function (e) {
        e.preventDefault();

        this.trigger('loginwidget:loginRequested');
      },
      signoutClick: function(e){
        e.preventDefault();

        this.trigger('loginwidget:signoutRequested');

      }
    });

    var OrcidLogin = BaseWidget.extend({
      activate: function (beehive) {
        this.pubsub = beehive.Services.get('PubSub');
      },

      initialize: function (options) {
        this.view = new OrcidLoginView();

        this.listenTo(this.view, "all", this.onAllInternalEvents);

        var _that = this;

        Backbone.Events.on(OrcidApiConstants.Events.LoginSuccess, function(data){ _that.switchToProfileView(data); });
        Backbone.Events.on(OrcidApiConstants.Events.SignOut, function(data){_that.switchToLoginView(data); });

        BaseWidget.prototype.initialize.call(this, options);

        return this;
      },
      render: function () {
        this.view.render();
        return this.view;
      },

      switchToProfileView: function(personalDetails){

        this.view.model.set('familyName', personalDetails['family-name']);
        this.view.model.set('givenName', personalDetails['given-names']);
        this.view.model.set('isSignedOut', false);
        this.view.model.set('isWaitingForProfileInfo', false);

        this.view.model.set('isSignedIn', true);
        this.view.model.set('currentState', 'signedIn');

      },
      switchToLoginView : function(){
        this.view.model.set('familyName', undefined);
        this.view.model.set('givenName', undefined);
        this.view.model.set('isSignedIn', false);
        this.view.model.set('isWaitingForProfileInfo', false);
        this.view.model.set('isSignedOut', true);

        this.view.model.set('currentState', 'signedOut');

      },
      onAllInternalEvents: function(ev, arg1, arg2) {
        if (ev === 'loginwidget:loginRequested') {
          this.view.model.set('isWaitingForProfileInfo', true);
          this.view.model.set('currentState', 'waitingForProfileInfo');

          Backbone.Events.trigger(OrcidApiConstants.Events.Login);
        }
        else if (ev === 'loginwidget:signoutRequested') {
          this.switchToLoginView();

          Backbone.Events.trigger(OrcidApiConstants.Events.SignOut);
        }
      }
    });

    return OrcidLogin;
  });
