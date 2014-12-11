define([
    'underscore',
    'jquery',
    'marionette',
    'js/widgets/base/base_widget',
    'js/services/orcid_api',
    'hbs!./templates/actions_template',


],
function (_, $, Marionette, BaseWidget,  OrcidApi,  OrcidActionsTemplate) {
    var OrcidActionsView = Marionette.ItemView.extend({
        template: OrcidActionsTemplate,

        events:{
            "click" : "click"
        },

        activate: function(beehive){
            this.beehive = beehive;
        },

        click: function(e){
            e.preventDefault();

            this.orcidApi = new OrcidApi();

            var orcidApi = this.beehive.getService('OrcidApi');

            orcidApi.showLoginDialog();
        }
    });

    var OrcidActions = BaseWidget.extend({
        activate: function(beehive){
            this.view.activate(beehive);
        },

        initialize: function(options){
            this.view = new OrcidActionsView();

            BaseWidget.prototype.initialize.call(this, options)
            return this;
        },
        render : function(){
            this.view.render();
            return this.view;
        }

    });

    return OrcidActions;
});