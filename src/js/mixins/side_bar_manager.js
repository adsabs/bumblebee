/**
 * manages the state of the side bars
 */
define([
  'backbone',
  'js/components/api_feedback'
], function (Backbone, ApiFeedback) {

  var state = new (Backbone.Model.extend({
    defaults: {
      hide: true
    }
  }));

  var SideBarManager = {
    _getUpdateFromUserData: function () {
      try {
        var ud = this.getBeeHive().getObject('User').getUserData();
        if (!ud) return false;

        return /hide/i.test(ud.defaultHideSidebars);
      } catch (e) {
        return false;
      }
    },

    init: function () {
      state.set('hide', this._getUpdateFromUserData());
      _.bindAll(this, ['_onFeedback', '_onUserAnnouncement', '_update']);
      var ps = this.getPubSub();
      if (!ps) return;
      ps.subscribe(ps.FEEDBACK, this._onFeedback);
      ps.subscribe(ps.USER_ANNOUNCEMENT, this._onUserAnnouncement);
      state.on('change:hide', this._update);
    },

    _update: function () {
      var val = this.getSidebarState();
      var view = this.view;
      if (view && view.showCols) {
        view.showCols({ left: val, right: val });
      }
      this.broadcast('page-manager-message', 'side-bars-update', val);
      this.trigger('page-manager-message', 'side-bars-update', val);
    },

    _onUserAnnouncement: function () {
      state.set('hide', this._getUpdateFromUserData());
    },

    _onFeedback: function (feedback) {
      switch(feedback.code) {
        case ApiFeedback.CODES.MAKE_SPACE:
        case ApiFeedback.CODES.UNMAKE_SPACE:
          this._update();
      };
    },

    toggleSidebarState: function () {
      this.setSidebarState(!this.getSidebarState());
    },

    setSidebarState: function (value) {
      state.set('hide', value);
      state.trigger('change:hide');
    },

    getSidebarState: function () {
      return state.get('hide');
    }
  };

  return SideBarManager;
});
