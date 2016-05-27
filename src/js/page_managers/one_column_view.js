define([
    "marionette",
    'js/widgets/base/base_widget'
  ],
  function (
    Marionette
            ) {

    var OneColumnView = Marionette.ItemView.extend({

      initialize : function(options){
        var options = options || {};
        this.widgets = options.widgets;
      },


      onRender : function(){

      }



    });
    return OneColumnView;

  });