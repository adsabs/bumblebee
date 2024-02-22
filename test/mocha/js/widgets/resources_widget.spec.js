
define([
  'jquery',
  'js/widgets/resources/widget.jsx',
  'js/widgets/base/base_widget',
  'js/bugutils/minimal_pubsub'
], function ($, Widget, BaseWidget, MinPubSub) {

  const init = function () {
    this.sb = sinon.sandbox.create();
    this.pubsub = new (MinPubSub.extend({
      request: this.sb.stub()
    }))({ verbose: false });
    this.state = function (w) {
      return w.store.getState();
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
        const mockQuery = { toJSON: _.constant({ q: ['identifier:foo'] })};
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
        expect(this.state(w).ui.hasError).to.eql('did not receive query');
        done();
      });
      it('handles not being able to find a bibcode in query', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = { toJSON: _.constant({ q: [] })};
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).ui.hasError).to.eql('did not receive a bibcode in query');
        done();
      });
      it('handles parsing issue with bibcode', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = { toJSON: _.constant({ q: ['bibBAZ:foo'] })};
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).ui.hasError).to.eql('unable to parse bibcode from query');
        done();
      });
      it('fully updates state after getting bibcode/query', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockQuery = { toJSON: _.constant({ q: ['identifier:foo'] })};
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).ui.loading).to.eql(true);
        expect(this.state(w).ui.noResults).to.eql(false);
        expect(this.state(w).ui.hasError).to.eql(false);
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
          fullTextSources: [{ shortName: 'blah', 'test': 'foo' }],
          dataProducts: [{}]
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).ui.fullTextSources).to.eql({
          blah: [{
            test: 'foo',
            shortName: 'blah'
          }]
        });
        expect(this.state(w).ui.dataProducts).to.eql([{}]);
        done();
      });
      it('handles not getting a response', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockResponse = undefined;
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).ui.hasError).to.eql('did not receive response from server');
        done();
      });
      it('handles not getting any docs', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const mockResponse = { toJSON: _.constant({ response: { docs: [] }})};
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).ui.hasError).to.eql('did not receive docs');
        done();
      });
      it('handles link generator parsing error', function (done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        w.parseResourcesData = this.sb.stub();
        const mockResponse = { toJSON: _.constant({ response: { docs: [{ foo: 'bar' }] }})};
        w.parseResourcesData.throws();
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        expect(this.state(w).ui.hasError).to.eql('unable to parse resource data');
        done();
      });
    });

    describe('Updates the link server', function () {
      beforeEach(init);
      afterEach(teardown);
      it('updates the state with the link server', function (done) {
        const w = new Widget();
        const getBeeHive = this.sb.stub(w, 'getBeeHive');
        getBeeHive.returns({
          getObject: _.constant({
            getUserData: _.constant({ link_server: 'TEST' })
          })
        });
        w._updateLinkServer();
        expect(this.state(w).api.linkServer).to.eql('TEST');
        done();
      });
      it('updates nothing, if the user beehive/user/link_server is not present', function (done) {
        const w = new Widget();
        const getBeeHive = this.sb.stub(w, 'getBeeHive');
        // no User object
        getBeeHive.returns({
          getObject: _.constant({
            getUserData: _.constant({})
          })
        });
        w._updateLinkServer();
        expect(this.state(w).api.linkServer).to.eql(null);
        // no beehive
        getBeeHive.returns(null);
        w._updateLinkServer();
        expect(this.state(w).api.linkServer).to.eql(null);
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
          fullTextSources: [{
            url: 'test', name: 'foo', shortName: 'test',
            description: 'bar', open: false, type: 'HTML'
          },
          {
            url: 'test', name: 'foo', shortName: 'test',
            description: 'bar', open: false, type: 'PDF'
          },
          {
            url: 'test', name: 'foo', shortName: 'test',
            description: 'bar', open: false, type: 'SCAN'
          }],
          dataProducts: []
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const link = $('a:first', $el);
        expect(link.length).to.eql(1);
        expect(link.attr('title')).to.eql('bar SIGN IN REQUIRED');
        expect(link.attr('href')).to.eql('test');
        expect($('i.fa.fa-file-text', $el).length).to.eql(1);
        expect($('i.fa.fa-file-pdf-o', $el).length).to.eql(1);
        expect($('i.fa.fa-file-image-o', $el).length).to.eql(1);
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
          dataProducts: [{ url: 'test', name: 'foo', count: 8, description: 'bar', open: false }]
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const link = $('a:first', $el);
        expect(link.length).to.eql(1);
        expect(link.attr('title')).to.eql('bar');
        expect(link.attr('href')).to.eql('test');
        expect(link.text()).to.eql('foo (8)');
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
        const unlockEl = $('.resources__content__link.unlock', $el);
        expect(unlockEl.length).to.eql(1);
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
          fullTextSources: [{
            url: 'test',
            name: 'foo',
            description: 'bar',
            type: 'INSTITUTION',
            openUrl: true,
            shortName: 'My Institution'
          }],
          dataProducts: []
        });
        this.pubsub.publish(this.pubsub.DELIVERING_RESPONSE, mockResponse);
        const icon = $('i.fa-university', $el);
        expect(icon.length).to.eql(1);
        done();
      });
    });
  });
});
