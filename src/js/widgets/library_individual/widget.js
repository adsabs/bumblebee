
define([

    "marionette",
    "js/components/api_query",
    "js/widgets/base/base_widget",
    "js/components/api_feedback",
    "./views/library_header",
    "./views/manage_permissions",
    "./views/view_library",
    "hbs!./templates/layout-container",
    "hbs!./templates/loading-library"

  ],
  function(

    Marionette,
    ApiQuery,
    BaseWidget,
    ApiFeedback,
    HeaderView,
    AdminView,
    LibraryView,
    ContainerTemplate,
    LoadingTemplate

    ){

    var LoadingView = Marionette.ItemView.extend({
      template : LoadingTemplate
    });

    var ContainerView  = Marionette.LayoutView.extend({

      className : "library-widget s-library-widget",
      template : ContainerTemplate,
      regions : {
        header  : ".header",
        main : ".main"
      }

    });

    var StateModel = Backbone.Model.extend({

      defaults : function(){
        return {
          id : undefined,
          subView : undefined,
          publicView : false
        }
      }

    });

    var Library = BaseWidget.extend({

      initialize :function(options){
        options = options || {};
        this.view = new ContainerView();
        this.model = new StateModel();

        //need access to it persistently, this is a collection of records within a library
        this.libraryCollection = new LibraryView.Collection();
        this.headerModel = new HeaderView.Model();

        //need to make sure view is rendered at least 1x before it shows a subview
        this.view.render();
      },

      activate: function(beehive) {
        this.setBeeHive(beehive);
        _.bindAll(this);
        var pubsub = beehive.getService('PubSub');
        pubsub.subscribe(pubsub.LIBRARY_CHANGE, this.onLibraryChange);
        pubsub.subscribe(pubsub.ORCID_ANNOUNCEMENT, this.onOrcidAnnouncement);

        //set initial orcidSignedIn status
        var orcidLoggedIn = this.getBeeHive().getService("OrcidApi").hasAccess();
        this.headerModel.set("orcidSignedIn", orcidLoggedIn);
        //views need to be updated manually, they do not listen to change events
        this.syncHeader(this.libraryCollection.toJSON());
      },

      onOrcidAnnouncement : function(msg){
        //headerview automatically listens to change event on orcidSignedIn

        var orcidApi = this.getBeeHive().getService("OrcidApi");
        if (msg === orcidApi.ORCID_SIGNED_OUT){
          this.headerModel.set("orcidSignedIn", false);
        }
        else if (msg === orcidApi.ORCID_SIGNED_IN){
          this.headerModel.set("orcidSignedIn", true);
        }

      },

      onLibraryChange : function(collectionJSON, info){

        if (info.ev == "change" &&
            info.id ==  this.model.get("id") &&
            _.findWhere(collectionJSON, {id : info.id}).num_documents > this.headerModel.get("num_documents")
          ){
          this.updateWidget();
        }
        //record was deleted from within widget, just update metadata
        else if (info.ev == "change" &&  info.id ==  this.model.get("id")){
          this.syncHeader(collectionJSON);
        }
      },

      //called when ID changes
      updateWidget : function() {
        this.switchToNewLib();
        this.updateSubView();
      },

      //reset widget, update header view
      switchToNewLib : function(){

        var LibraryController = this.getBeeHive().getObject("LibraryController"),
            id = this.model.get("id");

        this.libraryCollection.reset();
        this.view.header.empty();
        this.view.main.empty();

        //PUBLIC LIBRARY
        //return--> library data + metadata will be fetched in updateSubView,
        //which will call createHeader
        if (this.model.get("publicView")) return;

        // could be for any view -- library, export, metrics, etc--so insert
        // the correct header now
        //we will re-render when we get library info, but header will be visible for loading time

        var metadata = _.findWhere(LibraryController.getAllMetadata(), {id : id});
        this.createHeader(metadata);

      },

      createHeader : function(metadata){

        var that = this;
        //updating header
        that.headerModel.set(_.extend(metadata,
          { active : that.model.get("subView"),
            publicView : that.model.get("publicView")
          }
        ));

        var header = new HeaderView({model : this.headerModel});
        header.on("all", this.handleHeaderEvents, this);
        this.view.header.show( header );

      },

      //respond to library_collection change event

      syncHeader : function(data){
        var currentLibMetadata = _.findWhere(data, {id : this.model.get("id")});
        this.headerModel.set(currentLibMetadata);
        //only needs to render if it's currently in the DOM
        if (this.view.header.currentView && $("body").find(this.view.header.currentView.el).length > 0){
          this.view.header.currentView.render();
        }
      },

      updateSubView : function(){

        var that = this,
            id = this.model.get("id"),
            view = this.model.get("subView"),
            LibraryController = that.getBeeHive().getObject("LibraryController");

        if (!id || !view){
          console.warn("library widget's updateSubView called without requisite library id and view name");
          return
        }
        //let header model know
        that.headerModel.set("active", view);

        switch (view) {

          case "library":
            var public = this.model.get("publicView"),
                permission = that.headerModel.get("permission"),
                editRecords = !!_.contains(["write", "admin", "owner"], permission) && !public,
                subView = new LibraryView({collection : that.libraryCollection, permission : editRecords, perPage : Marionette.getOption(this, "perPage") });

            subView.on("all", that.handleLibraryEvents, that);

            //collection is  already loaded, just show the view
            if (this.libraryCollection.length) that.view.main.show(subView);

            //load the collection + then show the view
            if (this.libraryCollection.length === 0){

              that.view.main.show(new LoadingView());
              LibraryController.getLibraryData(id).done(function (data) {

                that.createHeader(data.metadata);
                that.libraryCollection.reset(data.solr.response.docs);
                //remove the loading view
                that.view.main.show(subView);
              }).fail(function(data){
                //the collection wasn't public
                that.getPubSub().publish(that.getPubSub().NAVIGATE, "404");
              });

            }
            break;

          case "admin":
            var subView = new AdminView({ model : this.headerModel });
            subView.on("all", that.handleAdminEvents, that);
            this.view.main.show( subView );
            break;

          //the following 3 cases insert different widgets, so empty the "main" container
          case "export":
            this.view.main.empty();
            break;

          case "metrics":
            this.view.main.empty();
            break;

          case "visualization":
            this.view.main.empty();
            break;

        }
      },

      /*
       * ****this is the only way to change the state of the view***
       * called by the navigator
       * a change of ID will trigger the function "switchToNewLib"
       * a change of view will only trigger "updateSubView"
       * */

      setSubView  : function(data) {

        //data must have {id : X, subview : X, publicView : X}
        data = _.extend({ subView : "library", publicView : false }, data);
        this.model.set(data);

        //if id or publicView changed, library changed --> need to destroy everything and start again
        if (this.model.changedAttributes().hasOwnProperty("id") ||  this.model.changedAttributes().hasOwnProperty("publicView")) {
          //this calls both switchToNewLib and updateSubView
          this.updateWidget();
        }
        else {
          //just update sub view info
          this.updateSubView();
        }
      },

      handleLibraryEvents : function (event, arg1, arg2){
        var that = this;

        switch (event) {
          case "removeRecord":
            //from library list view
            var data = {bibcode : [arg1], action : "remove"},
              id = this.model.get("id");
            this.getBeeHive().getObject("LibraryController").updateLibraryContents(id, data)
              .done(function(){
                var bibcode = data.bibcode[0],
                  modelToRemove = that.libraryCollection.get(bibcode);
                that.libraryCollection.remove(modelToRemove);
              });
            break;
        }
      },

      handleAdminEvents : function (event, arg1, arg2) {

        var that = this;

        switch (event) {

          case "update-public-status":
            var data = {"public": arg1},
              id = this.model.get("id");
            this.getBeeHive().getObject("LibraryController")
              .updateLibraryMetadata(id, data)
              .done(function(response, status){
                //re-render the admin view
                that.headerModel.set("public", response.public);
              })
              .fail(function(){
              });
            break
        }
      },

      handleHeaderEvents : function (event, arg1, arg2) {

        var that = this,
            id = this.model.get("id"),
            pubsub = this.getBeeHive().getService('PubSub'),
            query;

        switch (event) {

          case "updateVal":
            //from header view
            this.getBeeHive().getObject("LibraryController")
              .updateLibraryMetadata(id, arg1)
              .done(function(data){
                //make a new view
                that.headerModel.set(data);
                var header = new HeaderView({ model : that.headerModel });
                header.on("all", that.handleHeaderEvents, that);
                that.view.header.show( header );

              });
            break;

          case "navigate":
            //set the proper view value into the model
            this.model.set("subView", arg1);
            var other = ["export", "metrics", "visualization"];
            var publicView = this.model.get("publicView");
            if (_.contains(other, arg1)){

              //special handle of ORCID export
              if (arg1 === "export" && arg2 === "orcid"){
                this.exportLibToOrcid(this.libraryCollection.toJSON());
                return
              }

              var command =  "library-" + arg1;
              pubsub.publish(pubsub.NAVIGATE, command, {bibcodes : this.libraryCollection.pluck("bibcode"), subView : arg2, id : id, publicView : publicView});
            }
            else {
              pubsub.publish(pubsub.NAVIGATE, "IndividualLibraryWidget", { subView : arg1, id : id, publicView : publicView });
            }
            break;

          case "delete-library":
            this.getBeeHive().getObject("LibraryController").deleteLibrary(id, this.headerModel.get("name"));
            break;
          case "start-search":

            var query = new ApiQuery({
              __bigquery : this.libraryCollection.pluck("bibcode")
            });

            pubsub.publish(pubsub.START_SEARCH, query);
        }
      },

      exportLibToOrcid : function(library) {

        var pubsub = this.getPubSub();
        var feedback;

        //loading overlay so user knows something is happening
        pubsub.publish(pubsub.ALERT, new ApiFeedback({
          code: ApiFeedback.CODES.ALERT,
          msg: "<i class='icon-loading'></i> working...",
          title: "Please Wait, Sending Records To ORCID...",
          modal : true
        }));

        this.getBeeHive()
            .getService("OrcidApi")
            .batchUpdateOrcid(library)
            .done(function(data){

              if (data.fail.length){

                var failedRecords = data.fail.map(function(record){
                  return "<li>" + record.title + "</li>"
                });

                var msg = "Partial Success " + data.add.length + " record(s) added to ORCID, " +
                          data.update.length + " pre-existing record(s) updated " +
                          "and the following records caused an error and were not proccessed: <ul>" + failedRecords + "</ul>";

                feedback = new ApiFeedback({
                  code: ApiFeedback.CODES.ALERT,
                  msg:  msg,
                  modal : true,
                  type : "success"
                });

              }
              else {
                //all records were successfully added or updated, no failures
                feedback = new ApiFeedback({
                  code: ApiFeedback.CODES.ALERT,
                  msg: "If you add papers to this library in the future, you must export this library to ORCID again.",
                  title: "Success! " + data.add.length + " record(s) added to ORCID and " + data.update.length + " record(s) updated",
                  type: "success",
                  modal : true
                });
              }
              pubsub.publish(pubsub.ALERT, feedback);

            })
        .fail(function(){
          //this shouldn't happen, a resolved promise should always be returned by orcid api
          // (which should have caught the errors in the "fail" param returned by the resolved promise)
          feedback = new ApiFeedback({
            code: ApiFeedback.CODES.ALERT,
            msg: "Please try again later.",
            title: "There was an error adding papers to ORCID",
            type: "danger",
            modal : true
          })

          pubsub.publish(pubsub.ALERT, feedback);

        });
      }
    });

    return Library

  });
