define([], function() {
  "use strict";
  return {
    // if you are not running from /, set the absolute path
    // accordingly; eg. root: '/test' if it is deployed under
    // hostname:port/test/

    // to get more logging output on console
    debug: false,

    // the url to the API (our API allows for cross-domain
    // ajax requests for some sites, eg.
    // localhost:8000
    // adslabs.org
    // apiRoot: '//api.adslabs.org/v1/',
    apiRoot: '//localhost/v1/',

    // to let bumblebee discover oauth access_token at boot time
    // this can be absolute url; or url relative to the api path
    bootstrapUrls: ['/bumblebee/bootstrap'],

    // if you want to use pushState
    routerConf: {
      pushState: true,
      root: '/',
    },
  }
});
