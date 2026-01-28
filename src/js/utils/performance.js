/**
 * Performance tracking utilities for Sentry instrumentation.
 * Provides consistent span names and tags for comparison with Nectar (SciX).
 */
define([], function () {
  'use strict';

  /**
   * Span name constants for performance tracking.
   * Naming convention: {domain}.{action}.{phase}
   */
  var PERF_SPANS = {
    SEARCH_SUBMIT_TOTAL: 'search.submit.total',
    SEARCH_QUERY_REQUEST: 'search.query.request',
    SEARCH_RESULTS_RENDER: 'search.results.render',
    SEARCH_FACETS_RENDER: 'search.facets.render',
    SEARCH_PAGINATION_TOTAL: 'search.pagination.total',
    ABSTRACT_LOAD_TOTAL: 'abstract.load.total',
    ABSTRACT_METRICS_REQUEST: 'abstract.metrics.request',
    ABSTRACT_CITATIONS_LOAD: 'abstract.citations.load',
    ABSTRACT_REFERENCES_LOAD: 'abstract.references.load',
    EXPORT_GENERATE_TOTAL: 'export.generate.total',
    EXPORT_API_REQUEST: 'export.api.request',
    LIBRARY_LIST_LOAD: 'library.list.load',
    LIBRARY_ADD_TOTAL: 'library.add.total',
    LIBRARY_CREATE_TOTAL: 'library.create.total',
    AUTH_LOGIN_TOTAL: 'auth.login.total',
    AUTH_REGISTER_TOTAL: 'auth.register.total',
    AUTH_SESSION_VALIDATE: 'auth.session.validate',
    ORCID_OAUTH_TOTAL: 'orcid.oauth.total',
    ORCID_SYNC_TOTAL: 'orcid.sync.total',
    ORCID_CLAIM_TOTAL: 'orcid.claim.total',
    ORCID_PROFILE_LOAD: 'orcid.profile.load',
  };

  /**
   * Get the result count bucket for tagging.
   * @param {number} count - The number of results.
   * @returns {string} The bucket label.
   */
  function getResultCountBucket(count) {
    if (count === 0) {
      return '0';
    }
    if (count <= 10) {
      return '1-10';
    }
    if (count <= 100) {
      return '11-100';
    }
    return '100+';
  }

  /**
   * Get the query type based on query string analysis.
   * @param {string} query - The search query string.
   * @returns {string} The query type: 'simple', 'fielded', or 'boolean'.
   */
  function getQueryType(query) {
    if (!query || typeof query !== 'string') {
      return 'simple';
    }
    if (/\b(AND|OR|NOT)\b/.test(query)) {
      return 'boolean';
    }
    if (/\w+:/.test(query)) {
      return 'fielded';
    }
    return 'simple';
  }

  /**
   * Track a user flow by wrapping an async operation in a Sentry span.
   * Works with both Promises and jQuery Deferreds.
   *
   * @param {string} name - The span name from PERF_SPANS.
   * @param {Function} fn - Function returning a Promise or Deferred.
   * @param {Object} [tags] - Optional tags to attach to the span.
   * @returns {Promise|Deferred} The result of fn().
   */
  function trackUserFlow(name, fn, tags) {
    if (typeof window.whenSentryReady !== 'function') {
      return fn();
    }

    var result;
    var spanRef = { span: null };

    window.whenSentryReady().then(function (Sentry) {
      if (typeof Sentry.startSpan !== 'function') {
        return;
      }

      Sentry.startSpan(
        {
          name: name,
          op: 'user.flow',
          attributes: tags || {},
        },
        function (span) {
          spanRef.span = span;
        }
      );
    });

    try {
      result = fn();
    } catch (err) {
      if (spanRef.span) {
        spanRef.span.setStatus({ code: 2, message: err.message || 'Error' });
        spanRef.span.end();
      }
      throw err;
    }

    if (result && typeof result.then === 'function') {
      var handleSuccess = function (data) {
        if (spanRef.span) {
          spanRef.span.setStatus({ code: 1 });
          spanRef.span.end();
        }
        return data;
      };

      var handleError = function (err) {
        if (spanRef.span) {
          var msg = err && err.message ? err.message : 'Unknown error';
          spanRef.span.setStatus({ code: 2, message: msg });
          spanRef.span.end();
        }
        throw err;
      };

      if (typeof result.done === 'function' && typeof result.fail === 'function') {
        result.done(handleSuccess).fail(handleError);
      } else {
        result.then(handleSuccess, handleError);
      }
    } else {
      if (spanRef.span) {
        spanRef.span.setStatus({ code: 1 });
        spanRef.span.end();
      }
    }

    return result;
  }

  /**
   * Start a render span for tracking UI rendering performance.
   * Returns an object with an end() method to call when rendering completes.
   *
   * @param {string} name - The span name from PERF_SPANS.
   * @param {Object} [tags] - Optional tags to attach to the span.
   * @returns {Object} Object with end() method.
   */
  function startRenderSpan(name, tags) {
    var spanRef = { span: null };

    if (typeof window.whenSentryReady === 'function') {
      window.whenSentryReady().then(function (Sentry) {
        if (typeof Sentry.startInactiveSpan === 'function') {
          spanRef.span = Sentry.startInactiveSpan({
            name: name,
            op: 'ui.render',
            attributes: tags || {},
          });
        }
      });
    }

    return {
      end: function () {
        if (spanRef.span && typeof spanRef.span.end === 'function') {
          spanRef.span.end();
        }
      },
    };
  }

  /**
   * Wrap a jQuery Deferred-returning function with performance tracking.
   *
   * @param {string} name - The span name from PERF_SPANS.
   * @param {Function} fn - Function returning a jQuery Deferred.
   * @param {Object} [tags] - Optional tags to attach to the span.
   * @returns {jQuery.Deferred} The Deferred from fn().
   */
  function trackDeferred(name, fn, tags) {
    return trackUserFlow(name, fn, tags);
  }

  return {
    PERF_SPANS: PERF_SPANS,
    getResultCountBucket: getResultCountBucket,
    getQueryType: getQueryType,
    trackUserFlow: trackUserFlow,
    startRenderSpan: startRenderSpan,
    trackDeferred: trackDeferred,
  };
});
