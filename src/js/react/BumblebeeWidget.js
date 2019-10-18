// this module is not loaded directly, it must be loaded using reactify!
// in order for the view to be dynamically injected

define([
  'underscore',
  'js/widgets/base/base_widget',
  'https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js',
  'js/components/api_request',
  'js/components/api_query'
], function (_, BaseWidget, Faker, ApiRequest, ApiQuery) {

  const templateTypes = [ 'arxiv', 'citations', 'keywords', 'authors'];

  const getFakeNotification = (data = {}) => {
    const tmpl = templateTypes[Math.floor(Math.random() * templateTypes.length)];

    const {
      id = Faker.random.uuid(),
      type = 'template',
      template = tmpl,
      created = Faker.date.recent().toISOString(),
      frequency = tmpl === 'arxiv' ? 'daily' : 'weekly',
      name = Faker.lorem.text().substr(0, 30),
      active = Math.random() >= 0.5
    } = data;
    return { id, type, template, created, frequency, name, active};
  };

  let mockData = {
    notifications: _.range(100).map(getFakeNotification)
  }

  const BumblebeeWidget = BaseWidget.extend({
    initialize: function ({ componentId }) {
      this.view.on({
        sendRequest: _.bind(this.onSendRequest, this)
      });

      this.listenTo(this, 'page-manager-message', (ev, data) => {
        if (ev === 'widget-selected' && data.idAttribute === componentId) {
          this.view.destroy().render();
        }
      });
    },
    activate: function (beehive) {
      this.setBeeHive(beehive);
    },
    onSendRequest: function (options) {
      console.log('SENDING REQUEST', options);
      const targetParts = options.target.split('/');
      if (options.options.type === 'GET' && targetParts.length === 3) {
        setTimeout(() => {
          options.options.done(mockData.notifications[targetParts[targetParts.length - 1]]);
        }, 3000);
      } else if (options.options.type === 'GET') {
        setTimeout((hasError) => {
          if (hasError) {
            options.options.fail({ responseJSON: { error: 'there was an error' }});
          } else {
            options.options.done(mockData.notifications);
          }
        }, 500, Math.random() >= 0.9999);
      } else if (options.options.type === 'DELETE') {
        const _id = targetParts[targetParts.length - 1];
        const idx = mockData.notifications.findIndex(({ id }) => id === _id);
        mockData.notifications = [
          ...mockData.notifications.slice(0, idx),
          ...mockData.notifications.slice(idx + 1)
        ];
        setTimeout(() => {
          options.options.done({});
        }, 500);
      } else if (options.options.type === 'PUT') {
        const { id: _id } = options.options.data;
        const idx = mockData.notifications.findIndex(({ id }) => id === _id);
        mockData.notifications[idx] = options.options.data;
        setTimeout(() => {
          options.options.done({});
        }, 500);
      } else {
        mockData.notifications.push(getFakeNotification({ active: true }));
        setTimeout(() => {
          options.options.done({});
        }, 3000);
      }

      // const ps = this.getPubSub();
      // const request = new ApiRequest({
      //   ...options,
      //   query: new ApiQuery(options.query || {})
      // });
      // ps.publish(ps.EXECUTE_REQUEST, request);
    },
  });

  return BumblebeeWidget;
})
