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

  ],
  function (_, $, Backbone, Marionette, BaseWidget, OrcidApi, OrcidApiConstants, OrcidLoginTemplate) {

    var OrcidLoginView = Marionette.ItemView.extend({
      template: OrcidLoginTemplate,

      events: {
        "click .connect-orcid-button": "click"
      },

      constructor: function (options){


        return Marionette.ItemView.prototype.constructor.apply(this, arguments);
      },

      activate: function (beehive) {
        this.beehive = beehive;
      },

      click: function (e) {
        e.preventDefault();

        var orcidApi = this.beehive.getService('OrcidApi');

        orcidApi.showLoginDialog();
      },

      switchToProfileView: function(){
        // TODO
      },

      switchToLoginView: function(){
        // TODO
      }

    });

    var OrcidLogin = BaseWidget.extend({
      activate: function (beehive) {
        this.view.activate(beehive);
      },

      initialize: function (options) {
        this.view = new OrcidLoginView();

        Backbone.Events.on(OrcidApiConstants.Events.LoginSuccess, this.view.switchToProfileView);
        Backbone.Events.on(OrcidApiConstants.Events.SignOut, this.view.switchToLoginView);


        BaseWidget.prototype.initialize.call(this, options)
        return this;
      },
      render: function () {
        this.view.render();
        return this.view;
      }

    });

    return OrcidLogin;
  });
