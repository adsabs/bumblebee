'use strict';
(function () {
  /*
    Dynamically pick which configuration to use based on the url.
    Then attempt to load the resource, using require, upon failure we
    load a known resource (discovery.config.js)
  */
  var paths = {
    '': 'landing-page',
    'search': 'search-page',
    'abs': 'abstract-page'
  };

  var load;
  try {
    var loc = window.location;
    var parts = loc[loc.pathname === '/' ? 'hash' : 'pathname'].replace(/#/g, '').split('/');
    var path = parts.reverse().filter(function (p) {
      return Object.keys(paths).indexOf(p) > -1;
    });
    path = path.length && path[0];
    load = function () {
      // attempt to get bundle config
      require([paths[path] + '.config'], function () {}, function() {
        // on failure to load specific bundle; load generic one
        require(['discovery.config']);
      });
    };
  } catch (e) {
    load = function () {
      // on errors, just fallback to normal config
      require(['discovery.config']);
    };
  }

  (function checkLoad() {
    if (window.requirejs) {
      return load();
    }
    setTimeout(checkLoad, 10);
  })();

/**
 * Copyright 2015 Google Inc. All rights reserved.
/* eslint-env browser */

if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  // Delay registration until after the page has loaded, to ensure that our
  // precaching requests don't degrade the first visit experience.
  // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
  window.addEventListener('load', function() {
    // Your service-worker.js *must* be located at the top-level directory relative to your site.
    // It won't be able to control pages unless it's located at the same level or higher than them.
    // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
    // See https://github.com/slightlyoff/ServiceWorker/issues/468
    navigator.serviceWorker.register('sw.js').then(function(reg) {

      // update the service worker on a regular schedule (every hour)
      setInterval(function () {
        reg.update();
      }, 3.6e+6);

      // updatefound is fired if service-worker.js changes.
      reg.onupdatefound = function() {
        // The updatefound event implies that reg.installing is set; see
        // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
        var installingWorker = reg.installing;

        installingWorker.onstatechange = function() {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                // At this point, the old content will have been purged and the fresh content will
                // have been added to the cache.
                console.log('New or updated content is available.');
              } else {
                // At this point, everything has been precached.
                console.log('Content is now available offline!');
              }
              break;

            case 'redundant':
              console.error('The installing service worker became redundant.');
              break;
          }
        };
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  });
}
})();
