define(['backbone', 'js/widgets/alerts/page_top_alert'], function(Backbone, BannerView) {
  describe('Page Top Alert (page_top_alert.spec.js)', function() {
    var _render = function(attrs) {
      var view = new BannerView({ model: new Backbone.Model(attrs) });
      view.render();
      return view;
    };

    var _rgb = function(hex) {
      var h = hex.length === 4 ? hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex.slice(1);
      var n = parseInt(h, 16);
      /* eslint-disable no-bitwise */
      return 'rgb(' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(', ') + ')';
      /* eslint-enable no-bitwise */
    };

    it('leaves stylesheet colors alone when no bgColor is supplied', function() {
      var $alert = _render({ msg: 'hi', type: 'danger' }).$('.alert');
      expect($alert[0].style.backgroundColor).to.equal('');
      expect($alert[0].style.color).to.equal('');
    });

    it('ignores a bgColor that is not a hex color', function() {
      var $alert = _render({ msg: 'hi', bgColor: 'red; }' }).$('.alert');
      expect($alert[0].style.backgroundColor).to.equal('');
    });

    it('applies an operator-supplied bgColor', function() {
      var $alert = _render({ msg: 'hi', bgColor: '#15336f' }).$('.alert');
      expect($alert.css('background-color')).to.equal(_rgb('#15336f'));
    });

    it('picks a foreground meeting 4.5:1 on backgrounds that defeat brightness', function() {
      expect(
        _render({ msg: 'hi', bgColor: '#00ff00' })
          .$('.alert')
          .css('color')
      ).to.equal(_rgb('#1f2d3d'));
      expect(
        _render({ msg: 'hi', bgColor: '#808080' })
          .$('.alert')
          .css('color')
      ).to.equal(_rgb('#000000'));
    });

    it('overrides link and close-button colors so children cannot win', function() {
      var view = _render({
        msg: 'see <a href="/x">this</a>',
        bgColor: '#1f2d3d',
        dismissable: true,
      });
      var fg = _rgb('#ffffff');
      expect(view.$('.alert a').css('color')).to.equal(fg);
      var $close = view.$('.alert button.close');
      expect($close.css('color')).to.equal(fg);
      expect($close.css('opacity')).to.equal('1');
    });
  });
});
