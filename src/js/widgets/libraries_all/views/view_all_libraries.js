define([
  'marionette',
  'hbs!js/widgets/libraries_all/templates/libraries-list-container',
  'hbs!js/widgets/libraries_all/templates/library-item',
  'hbs!js/widgets/libraries_all/templates/no-libraries',
  'hbs!js/widgets/libraries_all/templates/loading-libraries',
  'hbs!js/widgets/libraries_all/templates/error-libraries',
  'moment'
], function (
  Marionette,
  LibraryContainer,
  LibraryItem,
  NoLibrariesTemplate,
  LoadingTemplate,
  ErrorTemplate,
  moment

) {
  var LibraryItemView = Marionette.ItemView.extend({

    // time is returned from library endpoint as utc time, but without info that it is utc
    formatDate: function (d) {
      return moment.utc(d).local().format('MMM D YYYY, h:mma');
    },

    serializeData: function () {
      var data = this.model.toJSON();
      data.libNum = Marionette.getOption(this, 'libNum');
      data.date_last_modified = this.formatDate(data.date_last_modified);
      return data;
    },

    template: LibraryItem,

    tagName: 'tr',

    triggers: {
      click: 'navigateToLibrary'
    }

  });


  var LibraryCollectionView = Marionette.CompositeView.extend({

    initialize: function (options) {
      options = options || {};
    },

    template: LibraryContainer,

    childViewContainer: '.libraries-list-container tbody',

    childView: LibraryItemView,

    childViewOptions: function (model, index) {
      return {
        libNum: index + 1
      };
    },

    childEvents: {
      navigateToLibrary: 'triggerNavigate'
    },

    events: {
      'click thead button': 'sortCollection'
    },


    modelEvents: {
      change: function () {
        this.collection.sort();
        this.render();
      }
    },

    collectionEvents: {
      reset: function () {
        this.collection.sort();
        this.render();
      }
    },

    triggerNavigate: function (childView) {
      this.trigger('navigate:library', childView.model.get('id'));
    },

    sortCollection: function (e) {
      var sortData = $(e.currentTarget).data('sort'),
        sort = sortData.sort;

      var order = (sort !== this.model.get('sort')) ? 'asc' : (this.model.get('order') == 'asc') ? 'desc' : 'asc';
      this.model.set({ sort: sort, type: sortData.type, order: order });
    },

    render: function () {
      if (this.collection.length > 0) {
        return Marionette.CompositeView.prototype.render.apply(this, arguments);
      }

      if (this.model.get('loading')) {
        this.$el.html(LoadingTemplate());
        return this;
      }

      if (this.model.get('error')) {
        this.$el.html(ErrorTemplate());
        return this;
      }

      this.$el.html(NoLibrariesTemplate());
      return this;
    }
  });

  return LibraryCollectionView;
});
