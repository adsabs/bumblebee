export function setupUserPreferences(app, analytics) {
  const pubsub = app.getService('PubSub');

  const getUserData = () => {
    try {
      const hive = app.getBeeHive?.();
      const user = hive?.getObject?.('User');
      return user?.getUserData('USER_DATA') || {};
    } catch {
      return {};
    }
  };

  const updateExternalLinkBehavior = _.debounce(() => {
    const userData = getUserData();
    const action = (userData.externalLinkAction || 'AUTO').toUpperCase();

    if (action === 'OPEN IN CURRENT TAB') {
      const max = 10;
      let timeout;
      (function updateLinks(count) {
        if (count < max) {
          $('a[target="_blank"]').attr('target', '');
          timeout = setTimeout(updateLinks, 1000, count + 1);
        }
      })(0);
    }
  }, 3000, { leading: true });

  pubsub.subscribe(pubsub.getCurrentPubSubKey(), pubsub.NAVIGATE, updateExternalLinkBehavior);
  updateExternalLinkBehavior();

  // Theme analytics
  const darkSwitch = localStorage.getItem('darkSwitch');
  let action = 'systemSetting';
  let label = 'light';
  if (darkSwitch === 'on') {
    action = 'appSetting';
    label = 'dark';
  } else if (darkSwitch === 'off') {
    action = 'appSetting';
    label = 'light';
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    label = 'dark';
  }

  analytics('send', 'event', 'uitheme', action, label);
}
