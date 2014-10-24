define([
  "jquery"
], function(
  $
  ){


  /*
  * all general functionality for the page managers
  * */


  var m = {}

  m.insertControllerView  = function(){

    var $b = $("#body-template-container");

    var $former =  $b.children();

    $former.detach();

    $b.append(this.controllerView.el);

    this.triggerMethod("show");

    this.controllerView.triggerMethod("show");

  };

  /*
  * the most basic showPage function called by master page manager;
  * this can be overridden if necessary
  * */

  m.showPage = function (options) {

    var inDom = options.inDom;

    if (!inDom){
      this.insertControllerView();
    }

  }

  return m


})