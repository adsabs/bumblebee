define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'js/widgets/base/base_widget',
    'js/services/orcid_api_constants',
    'hbs!./templates/orcid_work_template',
    'hbs!./templates/orcid_works_template'

  ],
  function (_, $, Backbone, Marionette, BaseWidget, OrcidApiConstants, OrcidWorkTemplate, OrcidWorksTemplate) {

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

          item: undefined,
          //isLoaded: false,
          //isLoading: false
        };

        return result;
      }
    });

    var OrcidWorkView = Marionette.ItemView.extend({
      template: OrcidWorkTemplate,

      modelEvents: {
        //"change:isLoaded": 'render',
        //"change:isLoading": 'render'
      },

      events: {
        'mouseenter .letter-icon': "showLinks",
        'mouseleave .letter-icon': "hideLinks",
        'click .orcid-action': "orcidAction"
      },
      constructor: function (options) {
        this.model = new OrcidWorkModel();
        return Marionette.ItemView.prototype.constructor.apply(this, arguments);
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
        // notify on orcid action on orcid items
        // data should be picked from model
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

        return Marionette.CompositeView.prototype.constructor.apply(this, arguments);

      },

      initialize: function (options) {

      },

      template: OrcidWorksTemplate,
      itemView: OrcidWorkView,

      onAllInternalEvents: function(ev, arg1, arg2) {
        if (ev == 'orchidWorksWidget:stateChanged'){
          this.stateChanged(arg1);
        }
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
          var item = {
            publicationData: work['publication-date']['year'],
            workExternalIdentifiers: [],
            workTitle: work['work-title']['title'],
            workType: work['work-type'],
            workSourceUri: work['work-source']['uri'],
            workSourceHost: work['work-source']['host']
          };

          works.push(item);

          var workIdentifierNode = work['work-external-identifiers']['work-external-identifier'];

          var identifier = {
            id: workIdentifierNode['work-external-identifier-id'],
            type: workIdentifierNode['work-external-identifier-type']
          };

          item.workExternalIdentifiers.push(identifier);

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
        this.view.model.set('items', works);

        this.view.trigger('orchidWorksWidget:stateChanged', 'loaded');
      },
      onAllInternalEvents: function (ev, arg1, arg2) {
        // TODO actions on works will be routed here

        //if (ev === 'orchidWorksWidget:update') {
        //  // trigger update on passed data
        //}
      }
    });

    return OrcidWorks;

  });