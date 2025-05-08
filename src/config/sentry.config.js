import { init, browserTracingIntegration, replayIntegration } from '@sentry/browser';

init({
  dsn: 'https://46062cbe0aeb7a3b2bb4c3a9b8cd1ac7@o1060269.ingest.us.sentry.io/4507341192036352',
  tracesSampleRate: window.ENV === 'development' ? 1.0 : 0.75,
  debug: false,
  // only allow the `sentry-baggage` header to be sent if the origin is the same as the current page (CORS policy)
  tracePropagationTargets: [window.location.origin],
  allowUrls: [
    /https:\/\/.*\.adsabs\.harvard\.edu\/.*/,
    /https:\/\/code\.jquery\.com\/.*/,
    /https:\/\/cdn\.jsdelivr\.net\/.*/,
  ],
  replaysSessionSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 0.5,
  environment: process.env.NODE_ENV,
  integrations: [
    browserTracingIntegration(),
    replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      unmask: ['[name=q]'],
    }),
  ],
});
