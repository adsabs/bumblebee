define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'js/widgets/base/base_widget',
    'js/services/orcid_api_constants',
    'hbs!./templates/orcid_work_template',
    'hbs!./templates/orcid_works_template',
    'js/widgets/orcid_model_notifier/orcid_model'

  ],
  function (_, $, Backbone, Marionette, BaseWidget, OrcidApiConstants, OrcidWorkTemplate, OrcidWorksTemplate, OrcidModel) {

    var OrcidWorkModel = Backbone.Model.extend({
      defaults: function () {
        var workExternalItentifier = {
          id: undefined,
          type: undefined
        };

        var item = {
          publicationData: undefined,
          workExternalIdentifiers: [],
          workTitle: undefined,
          workType: undefined,
          workSourceUri: undefined,
          workSourceHost: undefined
        };

        var result = {

          item: undefined
        };

        return result;
      }
    });

    var OrcidWorkView = Marionette.ItemView.extend({
      template: OrcidWorkTemplate,

      events: {
        'mouseenter .letter-icon': "showLinks",
        'mouseleave .letter-icon': "hideLinks",
        'click .orcid-action': "orcidAction",
        'click .letter-icon': "pinLinks"
      },
      constructor: function (options) {
        this.model = new OrcidWorkModel();

        this.listenTo(this, "item:rendered", this.onItemRendered);

        return Marionette.ItemView.prototype.constructor.apply(this, arguments);
      },

      onItemRendered: function(ev, arg1, arg2) {
          this.showOrcidActions();
      },

      showOrcidActions: function(){
        var $orcidActions = this.$('.orcid-actions');
        $orcidActions.removeClass('hidden');
        $orcidActions.removeClass('orcid-wait');
        var $update = $orcidActions.find('.orcid-action-update');
        //var $insert = $orcidActions.find('.orcid-action-insert');
        var $delete = $orcidActions.find('.orcid-action-delete');

        $update.addClass('hidden');
        //$insert.addClass('hidden');
        $delete.addClass('hidden');

        if (OrcidModel.isOrcidItemAdsItem(this.model.attributes)){
          $update.removeClass('hidden');
          $delete.removeClass('hidden');
        }
        else {
          //$insert.removeClass('hidden');
          $orcidActions.addClass('hidden');
        }
      },

      pinLinks: function (e) {
        var $c = $(e.currentTarget);

        if (!$c.find(".active-link").length) {
          return
        }
        $c.toggleClass("pinned");
        if ($c.hasClass("pinned")) {
          this.deactivateOtherQuickLinks($c);
          this.addActiveQuickLinkState($c);
        }
        else {
          this.removeActiveQuickLinkState($c);
        }
      },

      showLinks: function (e) {
        var $c = $(e.currentTarget);
        if (!$c.find(".active-link").length) {
          return;
        }
        if ($c.hasClass("pinned")) {
          return;
        }
        else {
          this.deactivateOtherQuickLinks($c);
          this.addActiveQuickLinkState($c)
        }
      },

      hideLinks: function (e) {
        $c = $(e.currentTarget);
        if ($c.hasClass("pinned")) {
          return
        }
        this.removeActiveQuickLinkState($c)
      },

      removeActiveQuickLinkState: function ($node) {

        $node.removeClass("pinned");
        $node.find("i").removeClass("s-icon-draw-attention")
        $node.find(".link-details").addClass("hidden");
        $node.find('ul').attr('aria-expanded', false);

      },

      deactivateOtherQuickLinks: function ($c) {

        var $hasList = this.$(".letter-icon").filter(function () {
          if ($(this).find("i").hasClass("s-icon-draw-attention")) {
            return true
          }
        }).eq(0);

        if ($hasList.length && $hasList[0] !== $c[0]) {

          this.removeActiveQuickLinkState($hasList)
        }
      },
      addActiveQuickLinkState: function ($node) {

        $node.find("i").addClass("s-icon-draw-attention")
        $node.find(".link-details").removeClass("hidden");
        $node.find('ul').attr('aria-expanded', true);

      },

      orcidAction: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $c = $(e.currentTarget);
        var $orcidActions = this.$('.orcid-actions');
        $orcidActions.addClass('orcid-wait');

        var actionType = '';

        if ($c.hasClass('orcid-action-insert')){
          actionType = 'insert';
        } else if ($c.hasClass('orcid-action-update')){
          actionType = 'update';
        } else if ($c.hasClass('orcid-action-delete')){
          actionType = 'delete';
        }

        var msg = {
          actionType : actionType,
          model: this.model.attributes,
          modelType: 'orcidData'
        };

        this.trigger('OrcidAction', msg);
      }
    });

    var OrcidWorksModel = Backbone.Model.extend({
      defaults: function () {

        var result = {

          isLoaded: false,
          isLoading: false
        };

        return result;
      }
    });

    var OrcidWorksCollection = Backbone.Collection.extend({

      model: OrcidWorkModel

    });

    var OrcidListOfWorks = Marionette.CompositeView.extend({

      constructor: function (options) {
        this.model = new OrcidWorksModel();

        this.listenTo(this, "all", this.onAllInternalEvents);

        //OrcidModel.on('change:orcidProfile',
        //  _.bind(function(){
        //    this.children.call('showOrcidActions');
        //  }, this));


        return Marionette.CompositeView.prototype.constructor.apply(this, arguments);

      },

      initialize: function (options) {

      },


      events:{
        'click button[name=doBulkInsert]': "startBulkInsertClick",
        'click button[name=cancelBulkInsert]': "cancelBulkInsertClick",
        'click button[name=finishBulkInsert]': "finishBulkInsertClick"
      },

      template: OrcidWorksTemplate,
      itemView: OrcidWorkView,

      onAllInternalEvents: function(ev, arg1, arg2) {
        if (ev == 'orchidWorksWidget:stateChanged'){
          this.stateChanged(arg1);
        }
      },

      startBulkInsertClick: function(){
          $('button[name=doBulkInsert]').addClass('hidden');

          $('button[name=cancelBulkInsert]').removeClass('hidden');
          $('button[name=finishBulkInsert]').removeClass('hidden');

          OrcidModel.set('isInBulkInsertMode', true);

      },

      finishBulkInsertClick: function(){
        $('button[name=cancelBulkInsert]').addClass('hidden');
        $('button[name=finishBulkInsert]').addClass('hidden');

        $('button[name=doBulkInsert]').removeClass('hidden');

        OrcidModel.triggerBulkInsert();
      },

      cancelBulkInsertClick: function(){
        $('button[name=cancelBulkInsert]').addClass('hidden');
        $('button[name=finishBulkInsert]').addClass('hidden');
        $('button[name=doBulkInsert]').removeClass('hidden');

        OrcidModel.cancelBulkInsert();
      },

      stateChanged : function(state){
        this.model.set('isLoaded', false);
        this.model.set('isLoading', false);
        this.itemViewContainer = '';

        switch (state){
          case 'loaded':
            this.itemViewContainer = '.items';
            this.model.set('isLoaded', true);
            break;
          case 'loading':
            this.model.set('isLoading', true);
            break;
          case 'unloaded':
            this.collection = new OrcidWorksCollection();
            // both already set to false
            break;
        }

        this.render();
      }

    });

    var OrcidWorks = BaseWidget.extend({
      activate: function (beehive) {
        this.pubSub = beehive.Services.get('PubSub');
        this.pubSubKey = this.pubSub.getPubSubKey();

        this.pubSub.subscribe(this.pubSub.ORCID_ANNOUNCEMENT, _.bind(this.routeOrcidPubSub, this));
      },

      initialize: function (options) {
        this.view = new OrcidListOfWorks();

        this.listenTo(this.view, "all", this.onAllInternalEvents);

        BaseWidget.prototype.initialize.call(this, options);

        return this;
      },
      render: function () {
        return this.view;
      },

      routeOrcidPubSub : function(msg){

        switch (msg.msgType){
          case OrcidApiConstants.Events.UserProfileRefreshed:
          case OrcidApiConstants.Events.LoginSuccess:
            this.showWorks(msg.data);
            break;
          case OrcidApiConstants.Events.LoginRequested:
            this.showLoading();
            break;
          case OrcidApiConstants.Events.SignOut:
            this.hideWorks();
            break;
        }
      },

      showLoading: function () {
        this.view.trigger('orchidWorksWidget:stateChanged', 'loading');
      },
      hideWorks: function () {
        this.view.trigger('orchidWorksWidget:stateChanged', 'unloaded');
      },

      showWorks: function (personalProfile) {

        var orcidWorks = personalProfile['orcid-activities']['orcid-works']['orcid-work'];

        var works = [];

        _.each(orcidWorks, function (work) {

          var publicationData = work['publication-date'] != undefined ? work['publication-date']['year'] : "";
          var workTitle = work['work-title'] != undefined ? work['work-title']['title'] : "";
          var workSourceUri = work['work-source'] != undefined ? work['work-source']['uri'] : "";
          var workSourceHost = work['work-source'] != undefined ? work['work-source']['host'] : "";

          var item = {
            putCode: work['$']['put-code'],
            publicationData: publicationData,
            workExternalIdentifiers: [],
            workTitle: workTitle,
            workType: work['work-type'],
            workSourceUri: workSourceUri,
            workSourceHost: workSourceHost
          };

          works.push(item);

          var addExternalIdentifier = function(workIdentifierNode) {
            //var workExternalIdentifiers = work['work-external-identifiers'];
            //if (workExternalIdentifiers) {
            //
            //  var workIdentifierNode = workExternalIdentifiers['work-external-identifier'];
              if (workIdentifierNode) {

                var identifier = {
                  id: workIdentifierNode['work-external-identifier-id'],
                  type: workIdentifierNode['work-external-identifier-type']
                };
                item.workExternalIdentifiers.push(identifier);
              }
            //}
          };

          var workExternalIdentifiers = work['work-external-identifiers'];
          if (workExternalIdentifiers) {
            var workIdentifierNode = workExternalIdentifiers['work-external-identifier'];

            if (workIdentifierNode instanceof Array){
              _.each(workIdentifierNode, addExternalIdentifier)
            }
            else{
              addExternalIdentifier(workIdentifierNode);
            }
          }


          //_.each(work['work-external-identifiers'], function(workIdentifier){
          //  var workIdentifierNode = workIdentifier['work-external-identifier'];
          //
          //  var identifier = {
          //    id: workIdentifierNode['work-external-identifier-id'],
          //    type: workIdentifierNode['work-external-identifier-type']
          //  };
          //
          //  item.workExternalIdentifiers.push(identifier);
          //
          //});
        });

        this.view.collection = new OrcidWorksCollection(works);

        this.view.trigger('orchidWorksWidget:stateChanged', 'loaded');

        this.view.model.set('items', works);


      },
      onAllInternalEvents: function (ev, arg1, arg2) {
        if (ev == 'itemview:OrcidAction'){
          this.pubSub.publish(this.pubSub.ORCID_ANNOUNCEMENT, {msgType: OrcidApiConstants.Events.OrcidAction, data: arg2});
        }
      }
    });

    return OrcidWorks;

  });