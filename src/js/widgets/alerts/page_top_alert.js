define(['marionette', 'hbs!js/widgets/alerts/templates/page_top_alert'], function(Marionette, BannerTemplate) {
  var LIGHT_FG = '#ffffff';
  var DARK_FG = '#1f2d3d';
  var BLACK_FG = '#000000';
  var HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
  var MIN_CONTRAST = 4.5;
  var FG_CANDIDATES = [DARK_FG, LIGHT_FG, BLACK_FG];

  function channelLuminance(value) {
    var c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }

  function relativeLuminance(hex) {
    var n = parseInt(hex, 16);
    /* eslint-disable no-bitwise */
    var r = (n >> 16) & 255;
    var g = (n >> 8) & 255;
    var b = n & 255;
    /* eslint-enable no-bitwise */
    return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
  }

  function contrastRatio(a, b) {
    var hi = Math.max(a, b);
    var lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
  }

  function expandHex(hex) {
    if (hex.length !== 3) return hex;
    return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  function resolvePalette(bgColor) {
    var trimmed = typeof bgColor === 'string' ? bgColor.trim() : '';
    if (!HEX_RE.test(trimmed)) return null;

    var bgLuminance = relativeLuminance(expandHex(trimmed.slice(1)));
    var best = BLACK_FG;
    var bestRatio = 0;
    for (var i = 0; i < FG_CANDIDATES.length; i += 1) {
      var candidate = FG_CANDIDATES[i];
      var ratio = contrastRatio(bgLuminance, relativeLuminance(expandHex(candidate.slice(1))));
      if (ratio >= MIN_CONTRAST) return { bg: trimmed, fg: candidate };
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = candidate;
      }
    }
    return { bg: trimmed, fg: best };
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
      if (!palette) return;
      this.$('.alert').css({
        'background-color': palette.bg,
        color: palette.fg,
      });
      this.$('.alert a').css('color', palette.fg);
      this.$('.alert button.close').css({
        color: palette.fg,
        opacity: 1,
        'text-shadow': 'none',
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
