(function() {
  const darkSwitch = document.getElementById('darkSwitch');

  const turnOnDarkMode = (save) => {
    document.body.setAttribute('data-theme', 'dark');
    darkSwitch.classList.add('darkModeOn');
    darkSwitch.setAttribute('title', 'Turn off dark mode');
    if (save) localStorage.setItem('darkSwitch', 'dark');
  };

  const turnOffDarkMode = (save) => {
    document.body.removeAttribute('data-theme');
    darkSwitch.classList.remove('darkModeOn');
    darkSwitch.setAttribute('title', 'Turn on dark mode');
    if (save) localStorage.removeItem('darkSwitch');
  };

  const init = () => {
    const darkThemeSelected =
      localStorage.getItem('darkSwitch') !== null &&
      localStorage.getItem('darkSwitch') === 'dark';
    if (darkThemeSelected) {
      turnOnDarkMode(false);
    } else {
      turnOffDarkMode(false);
    }
  };

  const reset = () => {
    darkSwitch.classList.contains('darkModeOn') ? turnOffDarkMode(true) : turnOnDarkMode(true);
  };

  window.addEventListener('load', function() {
    if (darkSwitch) {
      init();
      darkSwitch.addEventListener('click', function() {
        reset();
      });
    }
  });
})();
