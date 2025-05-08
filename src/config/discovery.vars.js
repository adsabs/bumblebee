define('discovery.vars', function() {
  return {
    clientVersion: process.env.CLIENT_VERSION || '',
    apiRoot: process.env.API_ROOT || 'https://devapi.adsabs.harvard.edu/v1/',
    orcidProxy: process.env.ORCID_PROXY || '/oauth/',
    bootstrapUrls: JSON.parse(process.env.BOOTSTRAP_URLS || '["/accounts/bootstrap"]'),
    routerConf: {
      pushState: process.env.ROUTER_PUSH_STATE === 'true',
      root: process.env.ROUTER_ROOT || '/',
    },
    debugExportBBB: process.env.DEBUG_EXPORT_BBB === 'true',
    debug: process.env.DEBUG === 'true',
    useCache: process.env.USE_CACHE === 'true',
    googleTrackingCode: process.env.GOOGLE_TRACKING_CODE || 'UA-XXXXXXXX-X',
    googleTrackingOptions: process.env.GOOGLE_TRACKING_OPTIONS || 'auto',
    orcidClientId: process.env.ORCID_CLIENT_ID || 'APP-P5ANJTQRRTMA6GXZ',
    orcidLoginEndpoint: process.env.ORCID_LOGIN_ENDPOINT || 'https://sandbox.orcid.org/oauth/authorize',
    orcidApiEndpoint: process.env.ORCID_API_ENDPOINT || 'https://devapi.adsabs.harvard.edu/v1/orcid/',
    recaptchaKey: process.env.RECAPTCHA_KEY || '6LcpTuUnAAAAAD6YCBdr_2-0b1AH8N6nXkYEG5G5',
    hourly: process.env.HOURLY === 'true',
  };
});
