define([
    'underscore',
    'jquery',
    'js/components/generic_module',
    'js/mixins/dependon',
    ],
    function(_, $, GenericModule, Mixins) {

        var OrchidMediator = GenericModule.extend({

            initialize: function (options) {

            },

            activate: function (beehive, app) {
                this.setBeeHive(beehive);

                var orcidApi = beehive.Services.get('OrchidApi');
                orcidApi.activate(beehive);
                this.orcidApi = orcidApi;
            },

            getOAuthCode: function () {
                var result = this.orcidApi.getOAuthCode();
            }

        });

        _.extend(OrchidMediator.prototype, Mixins.BeeHive);

        return OrchidMediator;

    }
);
