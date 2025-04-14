define([
  'underscore',
  'marionette',
  'js/widgets/base/base_widget',
  './views/openurl',
  './views/orcid',
  './views/application',
  './views/export',
  'js/components/api_feedback',
  'hbs!js/widgets/preferences/templates/orcid-form-submit-modal',
], function(
  _,
  Marionette,
  BaseWidget,
  OpenURLView,
  OrcidView,
  ApplicationView,
  ExportView,
  ApiFeedback,
  OrcidModalTemplate
) {
  var PreferencesModel = Backbone.Model.extend({
    defaults: function() {
      return {
        openURLConfig: undefined,
        orcidLoggedIn: undefined,
      };
    },
  });

  var PreferencesView = Marionette.LayoutView.extend({
    template: function() {
      return '<div class="content-container"></div>';
    },

    className: 's-preferences preferences-widget',

    regions: {
      content: '.content-container',
    },

    setSubView: function(viewConstructor) {
      // providing all views with a copy of the model
      var view = new viewConstructor({ model: this.model });

      this.getRegion('content').show(view);

      // forward events
      this.listenTo(view, 'all', function() {
        this.trigger.apply(this, arguments);
      });
    },
  });

  /*
   * the rule is that preferences widget provides sub views with its model,
   * and widgets do not touch the model-- instead, they emit form submitted events
   * with a json structure representing the form data
   * */

  var PreferencesWidget = BaseWidget.extend({
    initialize: function(options) {
      options = options || {};

      this.model = new PreferencesModel();
      this.view = new PreferencesView({ model: this.model });
      this.listenTo(this.view, 'all', this.handleViewEvents);

      BaseWidget.prototype.initialize.apply(this, arguments);

      this.fetchNecessaryData = _.debounce(
        _.bind(this.fetchNecessaryData, this),
        300
      );
    },

    activate: function(beehive) {
      var that = this;
      this.setBeeHive(beehive);
      _.bindAll(this);
      var pubsub = beehive.getService('PubSub');
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.handleUserAnnouncement);
      pubsub.subscribe(pubsub.ORCID_ANNOUNCEMENT, this.handleOrcidAnnouncement);

      this.updateFromUser();
    },

    updateFromUser: function() {
      var model = this.model;
      var user = this.getBeeHive().getObject('User');

      // as soon as preferences widget is activated, get the open url config
      user
        .getOpenURLConfig()
        .done(function(config) {
          model.set({
            openURLConfig: config,
            openURLError: false,
          });
        })
        .fail(function() {
          model.set('openURLError', true);
        });

      // and the user data (which contains user's open url selection)
      model.set(user.getUserData());
    },

    // translates what comes from toc widget (e.g. userPreferences__orcid) to view name
    views: {
      orcid: OrcidView,
      librarylink: OpenURLView,
      application: ApplicationView,
      export: ExportView,
    },

    setSubView: function(subView) {
      if (_.isArray(subView)) {
        // XXX:figure out why array
        subView = subView[0];
      }
      var viewConstructor = this.views[subView];
      if (!viewConstructor) {
        console.warn("don't recognize this subview: ", subView);
        return;
      }
      this.view.setSubView(viewConstructor);

      this.fetchNecessaryData.apply(this, arguments);
    },

    fetchNecessaryData: function(subView) {
      var that = this;

      this.updateFromUser();

      this.model.set(
        'orcidLoggedIn',
        this.getBeeHive()
          .getService('OrcidApi')
          .hasAccess()
      );
      /* right now only orcid view needs extra data */

      if (subView === 'orcid' && this.model.get('orcidLoggedIn')) {
        this.model.set('loading', true);

        // get main orcid name
        var orcidProfile = this.getBeeHive()
          .getService('OrcidApi')
          .getUserBio();
        var adsOrcidUserInfo = this.getBeeHive()
          .getService('OrcidApi')
          .getADSUserData();

        // doing it at once so there's no flicker of rapid rendering as different vals change
        $.when(orcidProfile, adsOrcidUserInfo).done(function(profile, ads) {
          var data = {
            userSubmitted: _.isArray(ads) ? ads[0] : ads,
          };
          try {
            var firstName = profile.getFirstName();
            var lastName = profile.getLastName();
            // unchangeable orcid name
            data.orcidName = lastName + ', ' + firstName;
            data.prettyOrcidName = firstName + ' ' + lastName;
          } catch (e) {
            data.orcidName = 'unknown';
            data.prettyOrcidName = 'unknown';
          }
          data.loading = false;
          that.model.set(data);
        });
      }
    },

    handleViewEvents: function(event, arg1, arg2) {
      var that = this;

      if (event === 'change:link_server') {
        this.getBeeHive()
          .getObject('User')
          .setUserData({ link_server: arg1 });
      } else if (event === 'orcid-authenticate') {
        this.getBeeHive()
          .getService('OrcidApi')
          .signIn();
      } else if (event === 'orcid-form-submit') {
        this.getBeeHive()
          .getService('OrcidApi')
          .setADSUserData(arg1)
          .done(function() {
            // show the success modal
            that.getPubSub().publish(
              that.getPubSub().ALERT,
              new ApiFeedback({
                code: ApiFeedback.CODES.ALERT,
                msg: OrcidModalTemplate(),
                type: 'success',
                title:
                  'Thanks for submitting your supplemental ORCID information',
                modal: true,
              })
            );

            // this will re-render the form
            that.setSubView('orcid');
          })
          .fail(function() {
            // show the success modal
            that.getPubSub().publish(
              that.getPubSub().ALERT,
              new ApiFeedback({
                code: ApiFeedback.CODES.ALERT,
                msg: 'Please try again later.',
                type: 'danger',
                title: 'Your ORCID information was not submitted',
                modal: true,
              })
            );
          });
      } else if (event === 'change:applicationSettings') {
        const subView = this.view.content.currentView;
        this.getBeeHive()
          .getObject('User')
          .setUserData(arg1)
          .done(_.bind(subView.onSuccess, subView))
          .fail(_.bind(subView.onError, subView));
      } else if (event === 'change:exportSettings') {
        const subView = this.view.content.currentView;
        this.getBeeHive()
          .getObject('User')
          .setUserData(arg1)
          .done(_.bind(subView.onSuccess, subView))
          .fail(_.bind(subView.onError, subView));
      }
    },

    handleUserAnnouncement: function(event, data) {
      // update the user model if it changes
      var user = this.getBeeHive().getObject('User');
      if (event == user.USER_INFO_CHANGE) {
        this.model.set(data);
      }
    },

    handleOrcidAnnouncement: function(event) {
      // update the user model if it changes
      if (event === 'login') {
        this.model.set('orcidLoggedIn', false);
      } else if (event === 'logout') {
        this.model.set('orcidLoggedIn', false);
      }
    },
  });

  return PreferencesWidget;
});
