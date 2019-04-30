define([
  'underscore',
  'backbone',
  'react',
  'react-dom',
  'js/widgets/base/base_widget',
  'es6!./components/app.jsx'
], function (
    _, Backbone, React, ReactDOM, BaseWidget, App
  ) {

  const Model = Backbone.Model.extend({
    defaults: {
      items: [],
      loading: true,
      submitting: false
    }
  });

  const View = Backbone.View.extend({
    initialize: function (options) {
      // provide this with all the options passed in
      _.assign(this, options);
      this.listenTo(this.model, 'change', this.render);
      this.component = null;
    },
    render: function () {
      ReactDOM.render(<App
        loading={this.model.get('loading')}
        items={this.model.get('items')}
        submitting={this.model.get('submitting')}
        onSubmit={(data) => this.trigger('submit', data)}
        onRef={(ref) => (this.component = ref)}
      />, this.el);
      return this;
    },
    destroy: function () {
      // on destroy, make sure the React DOM is unmounted
      ReactDOM.unmountComponentAtNode(this.el);
    },
    reset: function () {
      this.destroy();
      this.model.set(this.model.defaults);
      this.render();
    }
  });

  const Widget = BaseWidget.extend({
    initialize: function () {
      this.model = new Model();

      // create the view, passing in store
      this.view = new View({ model: this.model });
      this.listenTo(this.view, 'submit', this.onSubmit);
    },
    reset: function () {
      this.view.reset();
      this.getData();
    },
    getData: function () {
      if (this.hasBeeHive()) {

        this.model.set('loading', true);
        this.getBeeHive().getObject('LibraryController').getLibraryMetadata()
          .done((data) => {
            if (!data || data.length === 0) {
              return this.close();
            }

            // only allow libraries where user has owner/admin/write permission
            let libs = _.reduce(data, (acc, d) => {
              if (/^(owner|admin|write)$/i.test(d.permission)) {
                acc.push(_.pick(d, ['id', 'name']));
              }
              return acc;
            }, []);

            // sort library items by name
            libs = _.sortBy(libs, 'name');

            this.model.set({
              items: libs,
              loading: false
            });
          })
          .fail(() => {
            this.close();
          });
      } else {
        this.close();
      }
    },
    close: function () {
      const ps = this.getPubSub();
      ps.publish(ps.NAVIGATE, 'AllLibrariesWidget');
    },
    onSubmit: function ({ action, secondary, source, target }) {
      const updateStatus = _.bind(this.view.component.updateStatus, this.view.component);
      this.model.set('submitting', true);
      this.getBeeHive().getObject('LibraryController').performLibraryOperation(source, {
        action: action,
        libraries: secondary,
        name: target || undefined
      })
      .done(({ id, name }) => {
        var ps = this.getPubSub();
        ps.publish(ps.CUSTOM_EVENT, 'invalidate-library-metadata');
        let message = '';
        if (id && name) {
          message += `<u><a href="#/user/libraries/${id}">${name}</a></u> created`;
          this.model.set('items', [ ...this.model.get('items'), { id, name } ]);
        }

        updateStatus({ result: 'success', message });
      })
      .fail((ev) => {
        const message = (ev.responseJSON && ev.responseJSON.error) || '';
        updateStatus({ result: 'error', message });
      })
      .always(() => {
        this.model.set('submitting', false);
      });
    }
  });

  return Widget;
});
