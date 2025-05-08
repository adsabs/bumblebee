import Backbone from 'backbone';
import BackboneValidation from 'backbone-validation';
import _ from 'lodash/dist/lodash.compat';

window.Backbone = Backbone;
window.Backbone.Validation = BackboneValidation;
_.extend(window.Backbone.Validation.callbacks, {
  valid: function(view, attr) {
    const $el = view.$('input[name=' + attr + ']');

    $el
      .closest('.form-group')
      .removeClass('has-error')
      .find('.help-block')
      .html('')
      .addClass('no-show');
  },
  invalid: function(view, attr, error) {
    const $el = view.$('[name=' + attr + ']');
    const $group = $el.closest('.form-group');

    if (view.submit === true) {
      // only show error states if there has been a submit event
      $group.addClass('has-error');
      $group
        .find('.help-block')
        .html(error)
        .removeClass('no-show');
    }
  },
});
