
define([
  'jquery',
  'es6!js/widgets/resources/widget.jsx',
  'js/widgets/base/base_widget',
  'js/bugutils/minimal_pubsub'
], function ($, Widget, BaseWidget, MinPubSub) {

  const init = function () {
    this.sb = sinon.sandbox.create();
    this.pubsub = new (MinPubSub.extend({
      request: this.sb.stub()
    }))({ verbose: false });
    this.state = function (w) {
      return w.store.getState().get('ResourcesApp').toJS();
    };
  };

  const teardown = function () {
    this.sb.restore();
    this.pubsub.destroy();
    this.state = null;
    $('test-area').empty();
  };

  describe('Resources Widget (resources_widget.spec.js)', function () {
    describe('Widget Essentials', function () {
      beforeEach(init);
      afterEach(teardown);
      it('instance of base widget', function () {
        expect((new Widget()) instanceof BaseWidget).to.eql(true);
      });
      it('makes all necessary subscriptions', function (done) {
        const w = new Widget();
        const getPubSub = this.sb.stub(w, 'getPubSub');
        // activateWidget makes an extra subscription, we won't count that
        this.sb.stub(w, 'activateWidget');
        this.sb.stub(w, 'attachGeneralHandler');
        const stubs = {
          DISPLAY_DOCUMENTS: 1,
          DELIVERING_RESPONSE: 2,
          subscribe: this.sb.spy()
        };
        getPubSub.returns(stubs);
        w.activate(this.pubsub.beehive);
        expect(stubs.subscribe.callCount).to.eql(2);
        expect(stubs.subscribe.args[0][0]).to.eql(1);
        expect(stubs.subscribe.args[1][0]).to.eql(2);
        done();
      });
    });
    describe('Communicating with the API', function () {
      beforeEach(init);
      afterEach(teardown);
      it('fires off request for sources after display docs', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = { toJSON: _.constant({ q: ['bibcode:foo'] })};
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        const rSpy = this.pubsub.request;
        expect(rSpy.calledOnce).to.eql(true);
        expect(rSpy.args[0][0].get('target')).to.eql('search/query');
        expect(rSpy.args[0][0].get('query').get('q')).to.eql(mockQuery.toJSON().q);
        done();
      });
      it('handles not getting a query', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = null;
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).error).to.eql('No query');
        done();
      });
      it('handles not being able to find a bibcode in query', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = { toJSON: _.constant({ q: [] })};
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).error).to.eql('Did not receive a bibcode');
        done();
      });
      it('handles parsing issue with bibcode', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = { toJSON: _.constant({ q: ['bibBAZ:foo'] })};
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).error).to.eql('Could not parse bibcode');
        done();
      });
      it('fully updates state after getting bibcode/query', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = { toJSON: _.constant({ q: ['bibcode:foo'] })};
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).identifier).to.eql('foo');
        expect(this.state(w).fetching).to.eql(true);
        expect(this.state(w).query).to.eql(mockQuery.toJSON());
        done();
      });
    });
    describe('Processing Api Response, parsing docs into links', function () {
      beforeEach(init);
      afterEach(teardown);
      it('properly gathers information from docs, and updates state', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        w.parseResourcesData = this.sb.stub();
        const mockResponse = {
          toJSON: _.constant({
            response: { docs: [{ foo: 'bar' }] }
          })
        };
        w.parseResourcesData.returns({
          fullTextSources: [{ 'test': 'foo' }],
          dataProducts: [{}]
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).fullTextSources).to.eql([{ 'test': 'foo' }]);
        expect(this.state(w).dataProducts).to.eql([{}]);
        done();
      });
      it('handles not getting a response', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockResponse = undefined;
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).error).to.eql('No response');
        done();
      });
      it('handles not getting any docs', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockResponse = { toJSON: _.constant({ response: { docs: [] }})};
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).error).to.eql('No docs');
        done();
      });
      it('handles link generator parsing error', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        w.parseResourcesData = this.sb.stub();
        const mockResponse = { toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})};
        w.parseResourcesData.throws();
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).error).to.eql('Unable to parse resource data');
        done();
      });
    });

    describe('Updates the link server', function () {
      beforeEach(init);
      afterEach(teardown);
      it('updates the state with the link server', function (done) {
        const w = new Widget();
        const getBeeHive = this.sb.stub(w, 'getBeeHive');
        getBeeHive.returns({ getObject: _.constant({ link_server: 'TEST' }) });
        w._updateLinkServer();
        expect(this.state(w).linkServer).to.eql('TEST');
        done();
      });
      it('updates nothing, if the user beehive/user/link_server is not present', function (done) {
        const w = new Widget();
        const getBeeHive = this.sb.stub(w, 'getBeeHive');
        // no User object
        getBeeHive.returns({ getObject: _.constant({}) });
        w._updateLinkServer();
        expect(this.state(w).linkServer).to.eql(null);
        // no beehive
        getBeeHive.returns(null);
        w._updateLinkServer();
        expect(this.state(w).linkServer).to.eql(null);
        done();
      });
    });
    describe('UI', function () {
      beforeEach(init);
      afterEach(teardown);
      it('Updates the UI with full text links', function (done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockResponse = ({
          toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})
        });
        w.parseResourcesData = this.sb.stub();
        w.parseResourcesData.returns({
          fullTextSources: [{ url: 'test', name: 'foo', description: 'bar', open: false }],
          dataProducts: []
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const link = $('a:first', $el);
        expect(link.length).to.eql(1);
        expect(link.attr('title')).to.eql('bar');
        expect(link.attr('href')).to.eql('test');
        expect(link.text()).to.eql('foo');
        done();
      });
      it('Updates the UI with data products', function (done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockResponse = ({
          toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})
        });
        w.parseResourcesData = this.sb.stub();
        w.parseResourcesData.returns({
          fullTextSources: [],
          dataProducts: [{ url: 'test', name: 'foo', description: 'bar', open: false }]
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const link = $('a:first', $el);
        expect(link.length).to.eql(1);
        expect(link.attr('title')).to.eql('bar');
        expect(link.attr('href')).to.eql('test');
        expect(link.text()).to.eql('foo');
        done();
      });
      it('Shows an icon if the link is open access', function (done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockResponse = ({
          toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})
        });
        w.parseResourcesData = this.sb.stub();
        w.parseResourcesData.returns({
          fullTextSources: [{ url: 'test', name: 'foo', description: 'bar', open: true }],
          dataProducts: []
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const icon = $('i.s-open-access-image', $el);
        expect(icon.length).to.eql(1);
        done();
      });
      it('Shows an icon if the link is openUrl', function (done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockResponse = ({
          toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})
        });
        w.parseResourcesData = this.sb.stub();
        w.parseResourcesData.returns({
          fullTextSources: [{ url: 'test', name: 'foo', description: 'bar', openUrl: true }],
          dataProducts: []
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const icon = $('i.fa-university', $el);
        expect(icon.length).to.eql(1);
        done();
      });
      it('Shows a "Show All" button if there are more than 3 of either kind of source', function (done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockResponse = ({
          toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})
        });
        w.parseResourcesData = this.sb.stub();
        w.parseResourcesData.returns({
          fullTextSources: [
            { url: 'test', name: 'foo', description: 'bar' },
            { url: 'test', name: 'foo', description: 'bar' },
            { url: 'test', name: 'foo', description: 'bar' },
            { url: 'test', name: 'foo', description: 'bar' },
            { url: 'test', name: 'foo', description: 'bar' }
          ],
          dataProducts: []
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const button = $('button', $el);
        expect(button.length).to.eql(1);
        expect(button.text()).to.eql('Show All');
        done();
      });
      it('Clicking Show All button should display a modal with all the sources listed', function (done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockResponse = ({
          toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})
        });
        w.parseResourcesData = this.sb.stub();
        w.parseResourcesData.returns({
          fullTextSources: [
            { url: 'test', name: '0', description: 'bar' },
            { url: 'test', name: '1', description: 'bar' },
            { url: 'test', name: '2', description: 'bar' },
            { url: 'test', name: '3', description: 'bar' },
            { url: 'test', name: '4', description: 'bar' },
            { url: 'test', name: '5', description: 'bar' }
          ],
          dataProducts: [
            { url: 'test', name: '6', description: 'bar' },
            { url: 'test', name: '7', description: 'bar' },
            { url: 'test', name: '8', description: 'bar' }
          ]
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const button = $('button', $el);
        button.click();
        const links = $('a', '.modal');
        expect(links.length).to.eql(9);
        links.each(function (i) {
          const el = $(this);
          expect(el.text()).to.eql(i + '');
          expect(el.attr('href')).to.eql('test');
          expect(el.attr('title')).to.eql('bar');
        });
        $('div[role="dialog"] .close').click();
        done();
      });
      it('Clicking on a link fires an analytics event', function (done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        this.sb.stub(w, 'emitAnalytics');
        w.activate(this.pubsub.beehive);
        const mockResponse = ({
          toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})
        });
        w.parseResourcesData = this.sb.stub();
        w.parseResourcesData.returns({
          fullTextSources: [{ url: 'test', name: '0', description: 'bar' }],
          dataProducts: []
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const link = $('a', $el);
        link.on('click', function (e) { e.preventDefault(); });
        link[0].click();
        expect(w.emitAnalytics.calledWith('0')).to.eql(true);
        done();
      });
    });
  });
});
