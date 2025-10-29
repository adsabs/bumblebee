// listen for route changes in an SPA
function onPathChange(callback) {
  // Keep a reference to the original methods
  const pushState = window.history.pushState;
  const replaceState = window.history.replaceState;

  // trigger callback
  const trigger = () => callback(window.location.pathname);

  // Patch pushState
  window.history.pushState = function(...args) {
    pushState.apply(this, args);
    trigger();
  };

  // Patch replaceState
  window.history.replaceState = function(...args) {
    replaceState.apply(this, args);
    trigger();
  };

  // Listen for back/forward navigation
  window.addEventListener('popstate', trigger);

  // Initial call
  trigger();
}

const css = `
@keyframes bounce {
  100% {
    margin-bottom: 30px;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 10px 10px rgba(0, 123, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}
`;

(function() {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // floating link button on all other pages
  const pageButton = document.createElement('button');
  pageButton.id = 'floating-page-btn';
  pageButton.innerText = 'View page in SciX';
  pageButton.style.position = 'fixed';
  pageButton.style.bottom = '32px';
  pageButton.style.right = '32px';
  pageButton.style.zIndex = '9999';
  pageButton.style.borderRadius = '5px';
  pageButton.style.width = '16rem';
  pageButton.style.height = '3rem';
  pageButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  pageButton.style.background = '#4073dd';
  pageButton.style.color = '#fff';
  pageButton.style.border = 'none';
  pageButton.style.cursor = 'pointer';
  pageButton.style.animation = 'pulse 2s infinite';

  // stop the page button animation
  setTimeout(() => {
    pageButton.style.animation = 'none';
  }, 5000);

  // convert the ADS page path to SciX page path and open the page
  pageButton.onclick = () => {
    const currentUrl = window.location.href;
    let correspondingUrl = currentUrl.replace('adsabs.harvard.edu', 'scixplorer.org');
    correspondingUrl = correspondingUrl.replace('http://localhost:8000', 'https://scixplorer.org');
    const pathname = window.location.pathname;
    let newpath = window.location.pathname;
    if (pathname.match(/\/export-([a-zA-Z]+)$/)) {
      // this check must come before /search/
      // scix does not use query in the export citation path
      // so this must be redirected to the search results
      newpath = pathname
        .replace('/search/', '/search?')
        .replace('sort=bibcode', 'sort=date')
        .replace(/\/export-([a-zA-Z]+)$/, '');
    } else if (pathname.match(/\/metrics$/)) {
      newpath = pathname
        .replace('/search/', '/search/metrics?')
        .replace('sort=bibcode', 'sort=date')
        .replace(/\/metrics$/, '');
    } else if (pathname.match(/\/author-network$/)) {
      newpath = pathname
        .replace('/search/', '/search/author_network?')
        .replace('sort=bibcode', 'sort=date')
        .replace(/\/author-network$/, '');
    } else if (pathname.match(/\/paper-network$/)) {
      newpath = pathname
        .replace('/search/', '/search/paper_network?')
        .replace('sort=bibcode', 'sort=date')
        .replace(/\/paper-network$/, '');
    } else if (pathname.match(/\/concept-cloud$/)) {
      newpath = pathname
        .replace('/search/', '/search/concept_cloud?')
        .replace('sort=bibcode', 'sort=date')
        .replace(/\/concept-cloud$/, '');
    } else if (pathname.match(/\/bubble-chart$/)) {
      newpath = pathname
        .replace('/search/', '/search/results_graph?')
        .replace('sort=bibcode', 'sort=date')
        .replace(/\/bubble-chart$/, '');
    } else if (pathname.startsWith('/search/')) {
      newpath = pathname.replace('/search/', '/search?').replace('sort=bibcode', 'sort=date');
    } else if (pathname === '/user/libraries/') {
      newpath = '/user/libraries';
    } else if (pathname === '/user/settings/myads') {
      newpath = '/user/notifications';
    } else if (pathname === '/feedback/correctabstract') {
      newpath = '/feedback/missingrecord';
    }
    correspondingUrl = correspondingUrl.replace(pathname, newpath);
    window.open(correspondingUrl, '_blank');
  };

  onPathChange((path) => {
    if (path === '/user/settings/libraryimport') {
      // no corresponding page, hide button
      pageButton.style.display = 'none';
    } else {
      pageButton.style.display = 'inline-block';
    }
  });

  document.body.appendChild(pageButton);
})();
