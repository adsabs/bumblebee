export function setupUI(app) {
  const $ = window.jQuery;
  const pubsub = app.getService('PubSub');

  const toggle = ($sidebar, $content, $button) => {
    $sidebar.toggleClass('show');
    const isShown = $sidebar.hasClass('show');
    $content.toggleClass('full-width', !isShown);
    $button.html(
      isShown
        ? '<i class="fa fa-close" aria-hidden="true"></i> Close Menu'
        : '<i class="fa fa-bars" aria-hidden="true"></i> Show Menu'
    );
  };

  $('body').on('click', 'button.toggle-menu', function (e) {
    const $button = $(e.target);
    const $sidebar = $button.parents().eq(1).find('.nav-container');
    const $content = $button.parents().eq(1).find('.user-pages__main-content');

    toggle($sidebar, $content, $button);

    $('a', $sidebar).on('click', () => {
      toggle($sidebar, $content, $button);
    });
  });

  $('body').on('click', '#abs-full-txt-toggle', function () {
    $('#resources-container').toggleClass('show');
    $('#abs-full-txt-toggle').text(
      $('#resources-container').hasClass('show') ? 'Hide Sources' : 'Full Text Sources'
    );
  });

  $('body').on('click', '#results-actions-toggle', function () {
    $('#query-info-container').toggleClass('show');
    $('#results-actions-toggle').html(
      $('#query-info-container').hasClass('show')
        ? '<i class="fa fa-times" title="close actions" aria-hidden="true"></i> Actions'
        : '<i class="fa fa-book" title="open actions" aria-hidden="true"></i> Actions'
    );
  });

  $('body').on('click', '#skip-to-main-content', function () {
    $('#main-content').trigger('focus');
    return false;
  });

  // Proxied alert handling
  if ($('body').hasClass('is-proxied')) {
    const url = window.getCanonicalUrl?.() ?? '';
    const msg = `
      <p>You are using a proxied version of ADS. Please switch to the regular version:
      <a href="${url}${location.pathname}">${url}</a></p>
      <p>Configure access via your
      <a href="${url}/user/settings/librarylink">preferences</a>.</p>`;

    const ApiFeedback = require('js/components/api_feedback');
    pubsub.publish(
      pubsub.getCurrentPubSubKey(),
      pubsub.ALERT,
      new ApiFeedback({ type: 'danger', msg })
    );
  }
}
