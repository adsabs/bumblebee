define(['marionette', 'js/widgets/footer/footer.hbs'], function(Marionette, FooterTemplate) {
  var Footer = Marionette.ItemView.extend({
    template: FooterTemplate,
    className: 'footer s-footer',
  });

  return Footer;
});
