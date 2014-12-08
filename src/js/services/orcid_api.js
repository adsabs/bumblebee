define([
        'underscore',
        'bootstrap',
        'jquery',
        'js/components/generic_module',
        'js/mixins/dependon',
        'js/mixins/hardened',
        'js/components/api_query',
        'js/components/api_request'
],
function(
    _,
    Bootstrap,
    $,
    GenericModule,
    Mixins,
    Hardened,
    ApiQuery,
    ApiRequest
){
    var OrcidApi = GenericModule.extend({
        orcidProxyUri: '',

        activate: function(beehive){
            this.setBeeHive(beehive);
            this.api = beehive.Services.get('Api');
        },
        initialize : function(options){

        },
        getOAuthCode : function(){
            return this.sendData({scope: '/orcid-profile/read-limited'});
        },

        sendData: function(data){

            // rewrite using API.js
            // now part of beehive

            //var opts = {
            //    done: this.done,
            //    fail: this.fail,
            //    type: 'GET'
            //};
            //
            //this.api.request(
            //    new ApiRequest({
            //        query: new ApiQuery({}),
            //        target: ''})
            //    , opts
            //);


            var request = '';

            var opts = {
                type: 'GET',
                url: this.orcidProxyUri,
                dataType: 'json',
                data: data,
                contentType: 'application/x-www-form-urlencoded',
                cache: false,
                headers: {},
                context: {request: request, api: self }
            };

            var jqXhr = $.ajax(opts)
                .always(opts.always ? [this.always, opts.always] : this.always)
                .done(opts.done || this.done)
                .fail(opts.fail || this.fail);

            jqXhr = jqXhr.promise(jqXhr);

            return jqXhr;
        },

        done: function(){

        },
        fail: function(){

        },
        always: function(){

        },

        getHardenedInstance: function(){
            return this;
        }
    });

    _.extend(OrcidApi.prototype, Mixins.BeeHive);

    return OrcidApi;
});