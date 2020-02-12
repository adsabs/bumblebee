define([
  'js/widgets/query_info/query_info_widget',
  'js/widgets/base/base_widget',
  'hbs!js/wraps/abstract_page_library_add/template',
], function(QueryInfoWidget, BaseWidget, template) {
  var AbstractLibraryWidget = QueryInfoWidget.extend({
    // flag for functions that send bibs to library
    abstractPage: true,

    // add new template
    initialize: function(options) {
      options = options || {};
      this.model = new this.modelConstructor();
      this.view = new this.viewConstructor({
        model: this.model,
        template: template,
      });
      BaseWidget.prototype.initialize.call(this, options);
    },

    // don't need to subscribe to storage paper update, do need to subscribe to display_documents
    activate: function(beehive) {
      this.setBeeHive(beehive);
      _.bindAll(this);

      var that = this;

      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.LIBRARY_CHANGE, this.processLibraryInfo);
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.handleUserAnnouncement);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);

      // check if user is signed in (because widget was just instantiated, but app might have been running for a while
      if (
        this.getBeeHive()
          .getObject('User')
          .isLoggedIn()
      ) {
        // know whether to show library panel
        this.model.set('loggedIn', true);
        // fetch list of libraries
        var libraryData = this.getBeeHive()
          .getObject('LibraryController')
          .getLibraryMetadata()
          .done(function(data) {
            that.processLibraryInfo(data);
          });
      }
    },

    onDisplayDocuments: function(apiQuery) {
      const id = this.parseIdentifierFromQuery(apiQuery);

      if (id === 'null') {
        return;
      }

      this._bibcode = id;
    },
  });

  return AbstractLibraryWidget;
});
