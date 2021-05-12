(function() {
  const darkSwitch = document.getElementById('darkSwitch');

  const turnOnDarkMode = (save) => {
    document.body.setAttribute('data-theme', 'dark');
    darkSwitch.classList.add('darkModeOn');
    darkSwitch.setAttribute('title', 'Turn off dark mode');
    if (save) localStorage.setItem('darkSwitch', 'on');
  };

  const turnOffDarkMode = (save) => {
    document.body.removeAttribute('data-theme');
    darkSwitch.classList.remove('darkModeOn');
    darkSwitch.setAttribute('title', 'Turn on dark mode');
    if (save) localStorage.setItem('darkSwitch', 'off');
  };

  const init = () => {
    // 1. check app setting
    if (
      localStorage.getItem('darkSwitch') !== null &&
      localStorage.getItem('darkSwitch') === 'on'
    ) {
      turnOnDarkMode(false);
    }
    // 2. check system setting
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      turnOnDarkMode(false);
    } else {
      turnOffDarkMode(false);
    }
  };

  const toggle = () =>
    darkSwitch.classList.contains('darkModeOn')
      ? turnOffDarkMode(true)
      : turnOnDarkMode(true);

  window.addEventListener('load', function() {
    if (darkSwitch) {
      init();
      darkSwitch.addEventListener('click', function() {
        toggle();
      });
    }
  });
})();
