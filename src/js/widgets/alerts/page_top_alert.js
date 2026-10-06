define(['marionette', 'hbs!js/widgets/alerts/templates/page_top_alert'], function(Marionette, BannerTemplate) {
  var DEFAULT_BG = '#e8edf7';
  var DEFAULT_FG = '#15336f';
  var LIGHT_FG = '#ffffff';
  var DARK_FG = '#1f2d3d';
  var HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

  // Derives the foreground from the background so no value Vault supplies can
  // produce unreadable text. Only the background is configurable.
  function resolvePalette(bgColor) {
    var trimmed = typeof bgColor === 'string' ? bgColor.trim() : '';
    if (!HEX_RE.test(trimmed)) {
      return { bg: DEFAULT_BG, fg: DEFAULT_FG };
    }
    var hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var n = parseInt(hex, 16);
    /* eslint-disable no-bitwise */
    var r = (n >> 16) & 255;
    var g = (n >> 8) & 255;
    var b = n & 255;
    /* eslint-enable no-bitwise */
    var y = (r * 299 + g * 587 + b * 114) / 1000;
    return { bg: trimmed, fg: y > 150 ? DARK_FG : LIGHT_FG };
  }

  var AlertView = Marionette.ItemView.extend({
    tagName: 'span',
    className: 'alert-banner',
    template: BannerTemplate,

    modelEvents: {
      change: 'render',
    },

    events: {
      'click #page-top-alert button.close': 'close',
    },

    close: function() {
      if (!this.model.get('dismissable')) return;
      this.model.set('msg', null);
    },

    serializeData: function() {
      var data = this.model.toJSON();
      var isUrgent = data.type === 'danger' || data.dismissable === false;
      data.role = isUrgent ? 'alert' : 'status';
      data.ariaLive = isUrgent ? 'assertive' : 'polite';
      return data;
    },

    onRender: function() {
      var palette = resolvePalette(this.model.get('bgColor'));
      this.$('.alert').css({
        'background-color': palette.bg,
        color: palette.fg,
      });
    },

    render: function() {
      if (this.model.get('modal')) return this;
      if (!this.model.get('msg') && !this.model.get('title')) {
        this.$el.html('');
        return this;
      }
      return Marionette.ItemView.prototype.render.apply(this, arguments);
    },
  });

  return AlertView;
});
