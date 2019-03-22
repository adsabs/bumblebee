define([
  'js/widgets/base/base_widget',
  'js/components/api_request',
  'js/components/api_targets',
  'hbs!js/widgets/library_import/templates/tab-container',
  'hbs!js/widgets/library_import/templates/import-view-labs',
  'hbs!js/widgets/library_import/templates/import-view-classic',
  'hbs!js/widgets/library_import/templates/success-template',
  'bootstrap'

], function (BaseWidget,
  ApiRequest,
  ApiTargets,
  TabContainerTemplate,
  ADS2ImportView,
  ClassicImportView,
  SuccessTemplate,
  Bootstrap
) {
  /* config vars */

  var CLASSIC = 'classic';
  // this is used in the template for the name param -- is sent to server
  // 'twopointoh' is the name used on the server
  var ADS2 = 'twopointoh';

  var ImportModel = Backbone.Model.extend({

    defaults: function () {
      return {};
    }
  });


  var ImportView = Marionette.ItemView.extend({

    initialize: function (options) {
      if (options.endpoint !== CLASSIC && options.endpoint !== ADS2) {
        throw new Error('we don\'t recognize that endpoint: ' + options.endpoint);
      }
      this.model = new ImportModel({ endpoint: options.endpoint });
      this.template = (options.endpoint === CLASSIC) ? ClassicImportView : ADS2ImportView;
    },

    className: 'library-import-form',

    events: {
      'click button.submit-credentials': 'authenticate',
      'click button.bibtex-import': 'importBibtex',
    },

    triggers: {
      'click button.import-all-libraries': 'library-import',
    },

    modelEvents: {
      change: 'render'
    },

    importBibtex: function (e) {
      this.trigger('bibtex-import', { target: $(e.target).data('target') });
    },

    authenticate: function (e) {

      var data = this.$('form').serializeArray();
      var toReturn = {};
      data.forEach(function (obj) {
        toReturn[obj.name] = obj.value;
      });
      this.trigger('submit-credentials', toReturn);
      return false;
    }
  });

  var ContainerView = Marionette.LayoutView.extend({

    initialize: function (options) {
      this.classicView = new ImportView({ endpoint: CLASSIC });
    },

    regions: {
      classic: '#' + CLASSIC + '-import-tab'
    },

    template: TabContainerTemplate,

    onRender: function () {
      this.classic.show(this.classicView);
    }
  });


  var ImportWidget = BaseWidget.extend({

    initialize: function (options) {
      var options = options || {};
      this.view = new ContainerView();
      var that = this;

      /*
       * subscribe to 1) credential submit events
       * */
      function submitCredentials(endpoint, view, data) {
        this.getBeeHive().getService('Api').request(new ApiRequest({
          target: endpoint,
          options: {
            type: 'POST',
            data: data,
            done: function (data) {
              view.model.set(data, { silent: true });
              view.model.trigger('change');
            },
            fail: function (data) {
              view.model.set({
                successMessage: '',
                errorMessage: data.responseJSON.error
              }, { silent: true });
              view.model.trigger('change');
              // doing it this way (silent then trigger change)
              // so that user can close the alert and a new version of the
              // same alert can later still be shown if necessary
            }
          }
        }));
      }

      submitCredentials = submitCredentials.bind(this);

      this.view.classicView.on('submit-credentials', function (data) {
        submitCredentials(ApiTargets.LIBRARY_IMPORT_CLASSIC_AUTH, that.view.classicView, data);
      });

      /*
       * subscribe to library import events
       * this goes through the library controller as the controller
       * has to update its internal store of library metadata on successful import
       * */
      function importLibraries(endpoint, view) {
        var working = '<i class="fa fa-lg fa-spinner fa-pulse"></i> Working...';
        view.$('button.import-all-libraries')
          .addClass('disabled')
          .html(working);

        this.getBeeHive()
          .getObject('LibraryController')
          .importLibraries(endpoint)
          .done(function (data) {
            var successData = {};
            successData.updated = data.filter(function (d) { return d.action === 'updated'; })
              .map(function (d) { return { name: d.name, link: '#user/libraries/' + d.library_id }; });

            successData.created = data.filter(function (d) { return d.action === 'created'; })
              .map(function (d) { return { name: d.name, link: '#user/libraries/' + d.library_id }; });
            view.model.set({
              successMessage: SuccessTemplate(successData),
              errorMessage: ''
            }, { silent: true });

            view.model.trigger('change');
            // doing it this way so that user can close the alert and a new version of the
            // same alert can still be shown if necessary
          })
          .fail(function () {
            view.model.set({
              successMessage: '',
              errorMessage: 'There was a problem and libraries were not imported.'
            }, { silent: true });

            view.model.trigger('change');
          });
      }

      importLibraries = importLibraries.bind(this);

      this.view.classicView.on('library-import', function () {
        importLibraries(CLASSIC, that.view.classicView);
      });
    },

    activate: function (beehive) {
      this.setBeeHive(beehive);
      _.bindAll(this);

      var that = this;
      var pubsub = this.getPubSub();

      // need to load list of classic mirror sites
      that.getBeeHive().getService('Api').request(new ApiRequest(
        {
          target: ApiTargets.LIBRARY_IMPORT_CLASSIC_MIRRORS,
          options: {
            done: function (data) {
              // set the most used mirror as the default
              if (data.indexOf('adsabs.harvard.edu') > -1) {
                data = _.without(data, 'adsabs.harvard.edu');
                data.unshift('adsabs.harvard.edu');
              }
              that.view.classicView.model.set({
                mirrors: data
              });
            },
            fail: function () {
              console.error('couldn\'t load classic mirrors');
            }
          }
        }
      ));

      // need to check if already authenticated
      that.getBeeHive().getService('Api').request(new ApiRequest({
        target: ApiTargets.LIBRARY_IMPORT_CREDENTIALS,
        options: {
          done: function (data) {
            /*  returns data in the form
               * {"classic_email": "fake@fakitifake.com", "classic_mirror": "mirror", "twopointoh_email": "fakeads2@gmail.com"}
               */
            that.view.classicView.model.set(data);
          },
          fail: function (response, status) {
            // if user hasnt registered yet
            if (response.responseJSON.error == 'This user has not set up an ADS Classic account') return;
            console.error(response);
          }
        }
      }));
    }

  });

  return ImportWidget;
});
