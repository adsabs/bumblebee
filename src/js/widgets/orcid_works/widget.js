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
          isLoaded: false,
          isLoading: false
        };

        return result;
      }
    });

    var OrcidWorkView = Marionette.ItemView.extend({
      template: OrcidWorkTemplate,

      modelEvents:{
        "change:isLoaded": 'render',
        "change:isLoading": 'render'
      },


      events:{
        'mouseenter .letter-icon': "showLinks",
        'mouseleave .letter-icon': "hideLinks",
        'click .orcid-action': "orcidAction"
      },
      constructor: function (options){
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

      orcidAction : function(e){
        // notify on orcid action on orcid items
        // data should be picked from model
      }
    });

    var OrcidWorksModel = Backbone.Model.extend({
      defaults: function () {

        var result = {

          items: [],
          isLoaded: false,
          isLoading: false
        };

        return result;
      }
    });

    var OrcidWorksCollection = Backbone.Collection.extend({

      initialize: function (models, options) {
        this.on("change:selected", this.removeOtherSelected)
      },

      model: OrcidWorkModel

    });

    var OrcidListOfWorks = Marionette.CompositeView.extend({

      constructor: function(options){
        this.model = new OrcidWorksModel();
        return Marionette.CompositeView.prototype.constructor.apply(this, arguments);

      },

      initialize: function (options) {

      },

      template: OrcidWorksTemplate,
      itemView: OrcidWorkView,
      itemViewContainer: '.items'

    });

    var OrcidWorks = BaseWidget.extend({
      activate: function (beehive) {
        this.pubsub = beehive.Services.get('PubSub');
      },

      initialize: function (options) {
        this.view = new OrcidListOfWorks();

        this.listenTo(this.view, "all", this.onAllInternalEvents);

        var _that = this;

        Backbone.Events.on(OrcidApiConstants.Events.LoginSuccess, function(data){ _that.showWorks(data); });
        Backbone.Events.on(OrcidApiConstants.Events.LoginRequested, function(){_that.showLoading(); });

        BaseWidget.prototype.initialize.call(this, options);

        return this;
      },
      render: function () {
        return this.view;
      },

      showLoading: function(){
        this.view.model.set('isLoaded', false, {silent: true} );
        this.view.model.set('isLoading', true);
      },

      showWorks: function(personalProfile){

        var orcidWorks = personalProfile['orcid-activities']['orcid-works']['orcid-work'];

        var works = [];

        _.each(orcidWorks, function(work){
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
        this.view.model.set('isLoading', false, {silent: true} );

        this.view.model.set('isLoaded', true);

        this.view.render();
      },
      onAllInternalEvents: function(ev, arg1, arg2) {
        // TODO actions on works will be routed here

        //if (ev === 'loginwidget:loginRequested') {
        //  this.view.model.set('isWaitingForProfileInfo', true);
        //  this.view.model.set('currentState', 'waitingForProfileInfo');
        //
        //  Backbone.Events.trigger(OrcidApiConstants.Events.LoginRequested);
        //}
      }
    });

    return OrcidWorks;

  });