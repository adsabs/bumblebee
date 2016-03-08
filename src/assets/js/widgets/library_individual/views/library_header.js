define([
  "marionette",
  "hbs!../templates/library-header",
  "bootstrap"

], function(
  Marionette,
  LibraryHeaderTemplate,
  Bootstrap

  ){


  var LibraryTitleModel = Backbone.Model.extend({

    initialize : function(vals, options){

      options = options  || {};
      this.on("change:permission", this.checkEditPermission);

    },

    defaults : function(){
      return {
        //admin, libraries,edit,metrics, or vis
        active : "library",

        //from api
        date_created : undefined,
        date_last_modified : undefined,
        description : undefined,
        id : undefined,
        name : undefined,
        num_documents : 0,
        num_users : 0,
        permission : "read",
        owner : undefined,
        public : false

      }
    },

    checkEditPermission : function(){

      if (this.get("permission") == "admin" || this.get("permission") == "owner"){
        this.set("edit", true);
      }
      else {
        this.set("edit", false)
      }
    }

  });

  var LibraryTitleView = Marionette.ItemView.extend({

    template : LibraryHeaderTemplate,

    events : {
      "click .editable-item .toggle-form" : "showForm",
      "click .editable-item .btn-success" : "submitEdit",
      "click .editable-item .btn-default" : "cancelEdit",
      "click li[data-tab]:not(.active)" : "triggerSubviewNavigate",
      "click .delete-library" : "triggerDeleteLibrary",
      "click .bigquery-export" : "triggerStartSearch"
    },

    modelEvents : {
      "change:active" : "highlightTab"
    },


    formatDate : function(d){

      var d = new Date(d);

      function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes  + ampm;
        return strTime;
      }

      var year = d.getFullYear().toString().slice(2,4),
        month = d.getMonth() + 1,
        day = d.getDay(),
        time = formatAMPM(d);

      return month + "/" + day + "/" + year + " " + time;

    },

    serializeData : function(){

      var data = this.model.toJSON();
      data.date_last_modified = this.formatDate(data.date_last_modified);
      data.date_created = this.formatDate(data.date_created);
      return data;

    },

    showForm: function(e){
      $(e.target).parents().eq(1).find("form").removeClass("hidden");
    },

    submitEdit : function(e){

      e.preventDefault();
      var $target = $(e.target),
        $editParent = $target.parent().parent(),
        $edited = $editParent.find("input").length ?  $editParent.find("input") : $editParent.find("textarea"),
        data = {};

      data[$editParent.data("field")] = $edited.val();
      this.trigger("updateVal", data);
      $target.html("<i class=\"fa fa-spinner fa-pulse\"></i>");

    },

    cancelEdit : function(e){

      e.preventDefault();
      var $target = $(e.currentTarget),
          $form = $target.parent();

      $form.find("input").val("");
      $form.find("textarea").val("");
      $form.addClass("hidden");

    },

    // whenever active tab changes

    highlightTab : function(){

      this.$(".tab.active").removeClass("active");
      //find the proper tab
      var activeString = this.model.get("active").split("-")[0];
      var $active = this.$("li[data-tab^=" + activeString + "]");

      if ($active.hasClass("tab")){
        $active.addClass("active");
      }
      else {
        //it's a dropdown, go up a level
        $active.eq(0).parent().prev().parent().addClass("active");
      }
    },

    triggerSubviewNavigate : function(e){

      var $current = $(e.currentTarget),
        subView  = $current.data("tab");

      var tabToShow, additional;
      //dropdowns have multiple sub-options
      if  (subView.indexOf("-") > -1) {
        tabToShow = subView.split("-")[0];
        //this tells other widget which view to show
        additional = subView.split("-")[1];
      }
      else {
        tabToShow = subView;
      }

      this.trigger("navigate", tabToShow, additional);
    },

    triggerDeleteLibrary : function(){
      this.trigger("delete-library");
    },

    triggerStartSearch : function(){
      this.trigger("start-search");
    }

  });

  LibraryTitleView.Model = LibraryTitleModel


  return LibraryTitleView;

});