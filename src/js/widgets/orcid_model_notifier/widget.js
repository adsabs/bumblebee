define([
    'underscore',
    'marionette',
    'backbone',
    'js/widgets/base/base_widget',
    'js/services/orcid_api_constants',
    './orcid_model'
  ],

  function (_,
            Marionette,
            Backbone,
            BaseWidget,
            OrcidApiConstants,
            OrcidModel
  ) {
    var OrcidNotifier = BaseWidget.extend({
      activate: function (beehive) {
        this.pubsub = beehive.Services.get('PubSub');

        _.bindAll(this, 'routeOrcidPubSub');

        this.pubsub.subscribe(this.pubsub.ORCID_ANNOUNCEMENT, this.routeOrcidPubSub);
      },

      routeOrcidPubSub : function(msg){
        switch (msg.msgType){
          case OrcidApiConstants.Events.LoginSuccess:

            OrcidModel.set('actionsVisible', true);

            break;
          case OrcidApiConstants.Events.SignOut:
            OrcidModel.set('actionsVisible', false);
            break;
        }
      }

    });

    return OrcidNotifier;
  });
