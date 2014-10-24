define(["marionette",
    "hbs!./templates/landing-page-layout",
    "js/widgets/base/base_widget",
    'js/page_managers/page_manager_mixin'
  ],
  function (Marionette,
    fullLengthLayout,
    BaseWidget,
    PageManagerMixin) {


    var LandingPageView = Marionette.ItemView.extend({

      template : fullLengthLayout,

      className : "s-landing-page-layout",

      id : "landing-page-layout",

      onShow : function(){

        var searchBar = Marionette.getOption(this, "widgetDict").searchBar

        $(".search-bar-rows-container")
          .append(searchBar.render().el);

      }
      
    });


    var LandingPageController = BaseWidget.extend({

      initialize: function (options) {

        options = options || {};

        this.widgetDict = options.widgetDict;

        this.controllerView = new LandingPageView({widgetDict : this.widgetDict});

      },

      //don't need to activate this widget
      activate: function (beehive) {

      },

      //error unless this is overridden
      processResponse : function(){

      }

    });

    _.extend(LandingPageController.prototype, PageManagerMixin);

    return LandingPageController


  });