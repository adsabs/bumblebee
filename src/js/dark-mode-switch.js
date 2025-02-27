define(['analytics'], function(analytics) {
  const STORAGE_KEY = 'darkSwitch';
  let darkSwitch;
  const getDarkSwitchValue = () => {
    try {
      localStorage.getItem('darkSwitch');
    } catch (e) {
      return null;
    }
  };

  const setDarkSwitchValue = (val) => {
    try {
      localStorage.setItem('darkSwitch', val);
    } catch (e) {
      // localStorage is disabled
    }
  };

  const turnOnDarkMode = (save) => {
    document.body.setAttribute('data-theme', 'dark');
    darkSwitch.classList.add('darkModeOn');
    darkSwitch.setAttribute('title', 'Turn off dark mode');
    if (save) {
      setDarkSwitchValue('on');
    }
  };

  const turnOffDarkMode = (save) => {
    document.body.removeAttribute('data-theme');
    darkSwitch.classList.remove('darkModeOn');
    darkSwitch.setAttribute('title', 'Turn on dark mode');
    if (save) {
      setDarkSwitchValue('off');
    }
  };

  const emitAnalytics = (action, label) => {
    analytics('send', 'event', 'uitheme', action, label);
  };

  const toggle = () => {
    if (darkSwitch.classList.contains('darkModeOn')) {
      turnOffDarkMode(true);
      emitAnalytics('appSetting', 'light');
    } else {
      turnOnDarkMode(true);
      emitAnalytics('appSetting', 'dark');
    }
  };

  const init = () => {
    darkSwitch = document.getElementById('darkSwitch');
    if (!darkSwitch) return;
    darkSwitch.classList.remove('hidden');

    const savedMode = getDarkSwitchValue();
    // 1. check app setting
    if (savedMode !== null) {
      // eslint-disable-next-line no-unused-expressions
      savedMode !== 'on' ? turnOffDarkMode(false) : turnOnDarkMode(false);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // 2. check system setting
      turnOnDarkMode(false);
    } else {
      // 3. default to light
      turnOffDarkMode(false);
    }
    darkSwitch.addEventListener('click', function() {
      toggle();
    });
  };

  init();
});
