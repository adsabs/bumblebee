define([
  'js/page_managers/toc_controller',
  'js/page_managers/toc_widget',
  'js/page_managers/three_column_view',
  'hbs!js/wraps/libraries_page_manager/libraries-page-layout',
  'hbs!js/wraps/libraries_page_manager/libraries-nav'
], function (
  TOCController,
  TOCView,
  PageManagerView,
  PageManagerTemplate,
  TOCTemplate
) {
  var PageManager = TOCController.extend({

    TOCTemplate: TOCTemplate,

    TOCEvents: {

      'click button.create-library': function () {
        function createLib() {
          var that = this;

          // prompt the user for the name of the new library
          var name = window.prompt('Enter name for new library: ');

          // if user cancels the prompt, just kill it here
          if (name === null) return;

          // don't allow a super long string
          name = name.slice(0, 30);

          this.getBeeHive().getObject('LibraryController')
            .createLibrary({ name: name })
            .done(function (data) {
              that.getPubSub().publish(that.getPubSub().NAVIGATE, 'IndividualLibraryWidget', { sub: 'library', id: data.id });
            })
            .fail(function (res) {
              if (res.responseJSON && res.responseJSON.error) {
                alert('Library Not Created\n' + res.responseJSON.error);
              }
            });
        }
        this.trigger('page-manager-event', 'apply-function', { func: createLib });
      }
    },

    createView: function (options) {
      options = options || {};
      options.template = options.template || PageManagerTemplate;

      return new PageManagerView({
        template: PageManagerTemplate,
        className: 's-libraries-layout s-100-height',
        id: 'libraries-layout'
      });
    },

    navConfig: []

  });
  return PageManager;
});
