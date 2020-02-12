define([
  'marionette',
  'hbs!js/widgets/preferences/templates/openurl',
  'bootstrap',
  'select2',
], function(Marionette, OpenURLTemplate, Bootstrap, Select2) {
  var OpenURLView = Marionette.ItemView.extend({
    template: OpenURLTemplate,

    className: 'panel panel-default s-form-container',

    onRender: function() {
      this.$('select[name=set-link-server]').select2();
    },

    serializeData: function() {
      var data = this.model.toJSON();

      if (data.openURLError) {
        data.loading = false;
        return data;
      }

      // if this is true, there was an issue getting it from the server
      if (_.isEmpty(data.openURLConfig) || _.isEmpty(data.user)) {
        data.loading = true;
        return data;
      }

      if (_.isEmpty(data.openURLName)) {
        data.openURLName = 'None';
        this.editing = true;
      }

      // in weird/buggy cases, the previously selected open url might not exist in our openURLCOnfig data
      // available now. So just act like there is no openURLName, which will prompt the user to select a new
      // openURL
      var current = _.find(data.openURLConfig, { link: data.link_server });
      data.openURLName = current ? current.name : false;
      return data;
    },

    modelEvents: {
      'change:link_server': 'render',
      'change:user': 'render',
      'change:openURLConfig': 'render',
      'change:editing': 'render',
      'change:confirming': 'render',
      'change:loading': 'render',
      'change:openURLError': 'render',
    },

    events: {
      'click #link-server-apply': 'changeLinkServer',
      'click #link-server-cancel': 'onCancelLinkServer',
      'click #change-link-server': 'onChangeClick',
      'click #clear-link-server': 'onClearClick',
      'click #clear-link-server-confirm': 'onConfirmClear',
      'click #clear-link-server-cancel': 'onConfirmCancel',
    },

    changeLinkServer: function(e) {
      var newVal = this.$('#set-link-server').val();

      // check for a re-apply
      if (
        this.model.has('link_server') &&
        newVal === this.model.get('link_server')
      ) {
        return this.model.set('editing', false);
      }

      this.$(e.currentTarget).html(
        '<i class="fa fa-spinner fa-pulse"></i> Loading'
      );

      // otherwise, trigger the update
      this.trigger('change:link_server', newVal);
      this.model.set('editing', false);
      return false;
    },

    onCancelLinkServer: function() {
      this.model.set({
        editing: false,
        confirming: false,
        showConfirm: false,
      });
    },

    onChangeClick: function() {
      if (this.model.get('editing')) {
        return this.model.set('editing', false);
      }
      this.model.set({
        confirming: false,
        editing: true,
      });
    },

    onClearClick: function() {
      this.model.set({
        editing: false,
        confirming: true,
      });
    },

    onConfirmCancel: function() {
      this.model.set({
        editing: false,
        confirming: false,
      });
    },

    onConfirmClear: function() {
      this.trigger('change:link_server', '');
      this.model.set({
        openURLName: '',
        editing: false,
        confirming: false,
      });
    },
  });

  return OpenURLView;
});
