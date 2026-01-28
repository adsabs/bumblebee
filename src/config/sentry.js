(function () {
  'use strict';

  const tagSpans = (span) => {
    if (!span || !span.data || !span.data['http.url']) {
      return span;
    }
    const url = new URL(span.data['http.url']);
    const params = new URLSearchParams(url.search);
    const uiTag = params.get('ui_tag') || params.get('tag');
    if (uiTag) {
      span.description = uiTag;
      span.data['feature.ui_tag'] = uiTag;
      return span;
    }
    if (params.get('facet') === 'true' && params.has('facet.field')) {
      span.description = `${params.get('facet.field')} facet`;
      if (params.get('facet.pivot') === 'property,year') {
        span.description = 'years graph';
      }
    }
    if (params.get('stats') === 'true' && params.has('stats.field')) {
      const field = params.get('stats.field');
      if (field === 'citation_count') {
        span.description = 'citations graph';
      }
      if (field === 'read_count') {
        span.description = 'reads graph';
      }
    }
    return span;
  };

  const replayQuotaKey = 'sentry_replay_quota';
  const replayDateKey = 'sentry_replay_date';
  const replayDailyLimit = window.ENV === 'development' ? 1000 : 100;

  const checkDailyReplayQuota = () => {
    const today = new Date().toDateString();
    try {
      const savedDate = localStorage.getItem(replayDateKey);
      let replayCount = parseInt(localStorage.getItem(replayQuotaKey) || '0', 10);
      if (savedDate !== today) {
        replayCount = 0;
        localStorage.setItem(replayDateKey, today);
      }
      if (replayCount >= replayDailyLimit) {
        return false;
      }
      localStorage.setItem(replayQuotaKey, String(replayCount + 1));
      return true;
    } catch (_) {
      return Math.random() < 0.0001;
    }
  };

  const shouldCaptureReplay = (event) => {
    if (window.ENV === 'development') {
      return checkDailyReplayQuota();
    }
    if (!checkDailyReplayQuota()) {
      return false;
    }

    const errorMessage =
      event?.message || event?.exception?.values?.[0]?.value || '';
    const errorType = event?.exception?.values?.[0]?.type || '';
    const stacktrace = event?.exception?.values?.[0]?.stacktrace?.frames || [];
    const filename = stacktrace[0]?.filename || '';

    const noisyPatterns = [
      /Invalid or unexpected token/i,
      /SyntaxError.*Invalid.*token/i,
      /Unexpected token/i,
      /Script error for.*js\//i,
      /RequireJS.*scripterror/i,
      /Mismatched anonymous define/i,
      /needed by: router/i,
      /window\.__tcfapi is not a function/i,
      /gtag.*not.*function/i,
      /ga.*not.*function/i,
      /_gaCustomDimensionUserType.*not defined/i,
      /window\.ga.*appear/i,
      /gtag.*does not appear to load/i,
      /Maximum.*retries.*window\.ga/i,
      /jQuery.*not defined/i,
      /\$.*not defined/i,
      /Bootstrap.*requires jQuery/i,
      /Failed to fetch/i,
      /TypeError.*fetch/i,
      /Network request failed/i,
      /Empty values not allowed/i,
      /Search cycle failed to start/i,
      /Cannot read properties of undefined/i,
      /Cannot read properties of null/i,
      /pintrk.*not defined/i,
      /vbpx.*not defined/i,
      /efDataLayer.*not defined/i,
      /webVitals.*not defined/i,
      /Uncompressed Asset/i,
      /Large.*payload/i,
      /Large Render Blocking Asset/i,
      /ResizeObserver loop limit exceeded/i,
      /Non-Error promise rejection/i,
      /ChunkLoadError/i,
      /Loading chunk.*failed/i,
      /Script error/i,
      /Maximum call stack size exceeded/i,
      /Blocked.*from.*cross-origin/i,
      /SecurityError.*cross-origin/i,
      /Blocked 'connect'/i,
      /Blocked 'script'/i,
      /Blocked 'font'/i,
    ];

    const noisyFilenames = [
      /googletagmanager\.com/i,
      /google-analytics\.com/i,
      /gtm\.js/i,
      /analytics\.js/i,
      /pinterest\.com/i,
      /cubox\.pro/i,
      /sentry\.io/i,
      /cloudflare\.com/i,
      /cdn\./i,
    ];

    if (
      noisyPatterns.some(
        (pattern) => pattern.test(errorMessage) || pattern.test(errorType),
      )
    ) {
      return false;
    }

    if (noisyFilenames.some((pattern) => pattern.test(filename))) {
      return false;
    }

    const criticalErrors = [
      /ViewDestroyedError/i,
      /getBeeHive.*getService.*not a function/i,
      /Services\.get.*not a function/i,
    ];

    const isCritical = criticalErrors.some(
      (pattern) => pattern.test(errorMessage) || pattern.test(errorType),
    );

    const sampleRate = isCritical ? 0.05 : 0.001;
    return Math.random() < sampleRate;
  };

  const enableFeedbackIntegration = (feedbackFactory) => {
    if (typeof feedbackFactory !== 'function') {
      return;
    }
    try {
      const integration = feedbackFactory({
        autoInject: false,
        colorScheme: 'system',
      });
      if (
        integration &&
        window.Sentry &&
        typeof window.Sentry.addIntegration === 'function'
      ) {
        window.Sentry.addIntegration(integration);
      }
    } catch (_) {
      // ignore feedback initialization errors
    }
  };

  const initSentry = () => {
    if (typeof window.Sentry === 'undefined') {
      return;
    }

    window.Sentry.init({
      dsn: 'https://46062cbe0aeb7a3b2bb4c3a9b8cd1ac7@o1060269.ingest.us.sentry.io/4507341192036352',
      tracesSampleRate: window.ENV === 'development' ? 1.0 : 0.75,
      debug: false,
      enableLogs: true,
      initialScope: {
        tags: {
          app: 'bumblebee',
        },
      },
      _experiments: {
        enableStandaloneLcpSpans: true,
        enableStandaloneClsSpans: true,
      },
      allowUrls: [
        /https:\/\/.*\.adsabs\.harvard\.edu\/.*/,
        /https:\/\/code\.jquery\.com\/.*/,
        /https:\/\/cdn\.jsdelivr\.net\/.*/,
      ],
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      environment: window.ENV ?? 'production',
      integrations: [
        window.Sentry.browserTracingIntegration(),
        window.Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: true,
          blockClass: 'sentry-block',
          ignoreClass: 'sentry-ignore',
          unmask: ['[name=q]', '.search-field', '.query-input'],
          networkDetailAllowUrls: [
            /\/api\/v1\//,
            /\/search\/query/,
            /\/resolver\//,
            /\/export\//,
            /\/user\//,
            /\/myads\//,
          ],
          networkCaptureBodies: false,
          networkRequestHeaders: [],
          networkResponseHeaders: [],
          maxReplayDuration: 300000,
          sessionSampleRate: 0,
          errorSampleRate: 0,
          recordCanvas: false,
          collectFonts: false,
          inlineStylesheet: false,
          inlineImages: false,
          mutationBreadcrumbLimit: 750,
          mutationLimit: 10000,
        }),
      ],
      beforeSend(event, hint) {
        if (hint.originalException && shouldCaptureReplay(event)) {
          if (
            window.Sentry &&
            typeof window.Sentry.getReplay === 'function'
          ) {
            const replay = window.Sentry.getReplay();
            if (replay && !replay.isEnabled()) {
              replay.start();
            }
          }
        }
        return event;
      },
      beforeSendSpan: tagSpans,
    });

    if (window.Sentry && typeof window.Sentry.lazyLoadIntegration === 'function') {
      window.Sentry.lazyLoadIntegration('feedbackIntegration')
        .then(enableFeedbackIntegration)
        .catch(() => {});
    } else if (
      window.Sentry &&
      typeof window.Sentry.feedbackIntegration === 'function'
    ) {
      enableFeedbackIntegration(window.Sentry.feedbackIntegration);
    }
  };

  const waitForSentry = (callback, errorCallback = () => {}) => {
    if (typeof window.Sentry !== 'undefined') {
      try {
        callback(window.Sentry);
      } catch (err) {
        errorCallback(err);
      }
      return;
    }
    setTimeout(() => waitForSentry(callback, errorCallback), 50);
  };

  window.whenSentryReady = function () {
    return new Promise((resolve) => {
      if (typeof window.Sentry !== 'undefined') {
        resolve(window.Sentry);
      } else {
        waitForSentry(resolve);
      }
    });
  };

  window.getSentry = function (callback, errorCallback = () => {}) {
    if (typeof callback !== 'function') {
      return;
    }
    if (typeof window.Sentry !== 'undefined') {
      try {
        callback(window.Sentry);
      } catch (err) {
        errorCallback(err);
      }
      return;
    }
    waitForSentry(callback, errorCallback);
  };

  window.initSentry = initSentry;
})();
