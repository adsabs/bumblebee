define([
        'underscore',
        'bootstrap',
        'jquery',
        'js/components/generic_module',
        'js/mixins/dependon'
],
function(
    _,
    Bootstrap,
    $,
    GenericModule,
    Mixins
){
    var OrcidApi = GenericModule.extend({
        orcidProxyUri: '',

        activate: function(beehive){
            this.setBeeHive(beehive);
        },
        initialize : function(options){

        },
        getOAuthCode : function(){
            var opts = {
                url: this.orcidProxyUri + 'getAuthCode',
                done: function(){},
                fail: function(){},
                data: {scope: '/orcid-profile/read-limited'}
            }

            return this.sendData(opts);
        },

        exchangeOAuthCode: function(){
            var opts = {
                url: this.orcidProxyUri + 'exchangeAuthCode',
                done: function(){},
                fail: function(){},
                data: {scope: '/orcid-profile/read-limited'}
            };

            return this.sendData(opts);
        },

        sendData: function(opts){

            var request = '';

            var _opts = {
                type: 'GET',
                url: opts.url,
                dataType: 'json',
                data: opts.data,
                contentType: 'application/x-www-form-urlencoded',
                cache: false,
                headers: opts.headers || {},
                context: {request: request, api: self },
                done: opts.done,
                fail: opts.fail,
                always: opts.always
            };

            var jqXhr = $.ajax(opts)
                .always(_opts.always ? [this.always, _opts.always] : this.always)
                .done(_opts.done || this.done)
                .fail(_opts.fail || this.fail);

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