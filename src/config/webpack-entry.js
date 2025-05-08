import './sentry.config';
import Router from '../js/apps/discovery/router';
import Application from '../js/components/application';
import DiscoveryBootstrap from '../js/mixins/discovery_bootstrap';
import analytics from '../js/components/analytics';
import { setupUserPreferences } from './setup/preferences-setup';
import { setupUI } from './setup/ui-setup';
import staticConfig from './static-config';
import '../styles/manifest.scss';
import './shims';
import '../js/dark-mode-switch';

const updateProgress = typeof window.__setAppLoadingProgress === 'function' ? window.__setAppLoadingProgress : () => {};

Application.prototype.shim();

const debug = window.location.href.includes('debug=true');
const app = new (Application.extend(DiscoveryBootstrap))({ debug, timeout: 60000 });

function startApp() {
  updateProgress(80, 'App Loaded');

  const { core, widgets } = staticConfig;

  ['controllers', 'services', 'objects', 'modules'].forEach((section) => {
    app._registerLoadedModules(section, core[section]);
  });

  app._registerLoadedModules('widgets', widgets);
  app
    .getBeeHive()
    .getObject('AppStorage')
    .setConfig(app.getObject('DynamicConfig'));

  app.activate();

  const pubsub = app.getService('PubSub');
  pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_LOADED);

  app.configure();
  updateProgress(95, 'Finishing Up...');

  app.bootstrap().done((data) => {
    updateProgress(100);
    app.onBootstrap(data);

    // expose the app instance to the global scope
    window.bbb = app;

    pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_BOOTSTRAPPED);
    pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTING);

    app.start(Router).done(() => {
      pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTED);
      setupUserPreferences(app, analytics);
      setupUI(app);

      // Optionally record load timing
      if (window.__PAGE_LOAD_TIMESTAMP) {
        const time = new Date() - window.__PAGE_LOAD_TIMESTAMP;
        analytics('send', 'timing', {
          timingCategory: 'Application',
          timingVar: 'Loaded',
          timingValue: time,
        });
      }
    });
  });
}

startApp();
