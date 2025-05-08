define([
  'lodash/dist/lodash.compat',
  'marionette',
  'js/widgets/user_navbar/nav_template.hbs',
  'js/mixins/dependon',
], function(_, Marionette, NavTemplate, Dependon) {
  var NavModel = Backbone.Model.extend({
    defaults: function() {
      return {
        page: undefined,
        userName: undefined,
      };
    },
  });

  var NavView = Marionette.ItemView.extend({
    template: NavTemplate,

    modelEvents: {
      change: 'render',
    },
  });

  var NavWidget = Marionette.Controller.extend({
    initialize: function(options) {
      options = options || {};
      this.model = new NavModel();
      this.view = new NavView({ model: this.model });
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      var pubsub = beehive.getService('PubSub');

      // custom dispatchRequest function goes here
      pubsub.subscribe(pubsub.PAGE_CHANGE, this.updateCurrentView.bind(this));
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.updateUser.bind(this));
    },

    updateCurrentView: function(page) {
      this.model.set('page', page);
    },

    updateUser: function(event, arg) {
      var user = this.getBeeHive().getObject('User');
      if (event == user.USER_SIGNED_IN) {
        var userName = arg;
        if (userName && userName.indexOf('@') > -1) {
          userName = userName.split('@')[0];
        }
        this.model.set('user', userName);
      } else if (event == user.USER_SIGNED_OUT) {
        this.model.set('user', undefined);
      }
    },

    render: function() {
      this.view.render();
      return this.view.el;
    },
  });

  _.extend(NavWidget.prototype, Dependon.BeeHive);

  return NavWidget;
});
