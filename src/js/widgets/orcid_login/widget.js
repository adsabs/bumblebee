//noinspection Annotator
define([
    'underscore',
    'jquery',
    'marionette',
    'js/widgets/base/base_widget',
    'js/components/orcid_mediator',
    'js/services/orcid_api',
    'hbs!./templates/orcid_login_template',
    'bootstrap',
    'hoverIntent',

],
function (_, $, Marionette, BaseWidget, OrcidMediator, OrcidApi,  OrcidLoginTemplate) {

    var OrcidLoginView = Marionette.ItemView.extend({
        template: OrcidLoginTemplate,

        render: function(){
            Marionette.ItemView.prototype.render.apply(this, arguments);

            this.render = function(){ return this}
        },
        events:{
            "click" : "click"
        },

        initialize: function(options){

        },

        activate: function(beehive){
            this.beehive = beehive;
        },

        click: function(e){
            e.preventDefault();

            this.orcidApi = new OrcidApi();

            var orcidApi = this.beehive.getService('OrcidApi');
            var result = orcidApi.getOAuthCode();
        }
    });

    var OrcidLogin = BaseWidget.extend({
        activate: function(beehive){
            this.view.activate(beehive);
        },

        initialize: function(options){
            this.view = new OrcidLoginView();
        }

    });

    return OrcidLogin;
});
