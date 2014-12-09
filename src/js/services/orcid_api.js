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

        showLoginDialog: function() {
          var ORCID_OAUTH_CLIENT_ID = 'APP-P5ANJTQRRTMA6GXZ';
          var ORCID_API_ENDPOINT = 'https://sandbox.orcid.org';
          var ORCID_REDIRECT_URI = 'http://localhost:3000/oauthRedirect.html';

          var url = ORCID_API_ENDPOINT
            + "/oauth/authorize?scope=/orcid-profile/read-limited&response_type=code&access_type=offline"
            + "&client_id=" + ORCID_OAUTH_CLIENT_ID
            + "&redirect_uri=" + ORCID_REDIRECT_URI;


          var WIDTH = 600;
          var HEIGHT = 650;
          var left = (screen.width / 2) - (WIDTH / 2);
          var top = (screen.height / 2) - (HEIGHT / 2);

          window.open(url, "ORCID Login", 'width=' + WIDTH + ', height=' + HEIGHT + ', top=' + top + ', left=' + left);
        },

        exchangeOAuthCode: function(){
            var opts = {
                url: this.orcidProxyUri + 'exchangeAuthCode',
                done: function(){},
                fail: function(){},
                data: {scope: '/orcid-profile/read-limited'}
            }

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