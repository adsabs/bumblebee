define([
  'underscore',
  'jquery',
  'js/widgets/associated/widget.jsx',
  'js/widgets/base/base_widget',
  'js/bugutils/minimal_pubsub',
], function(_, $, Widget, BaseWidget, MinPubSub) {
  const mockResponse = function(n) {
    return {
      links: {
        records: _.map(_.range(n || 0), function(i) {
          const bib = 'foobar' + i;
          return {
            url: '/link_gateway/' + bib + '/associated/baz',
            bibcode: bib,
            title: 'testtest' + i,
          };
        }),
      },
    };
  };

  const init = function() {
    this.sb = sinon.sandbox.create();
    this.pubsub = new (MinPubSub.extend({
      request: this.sb.stub(),
    }))({
      verbose: false,
    });
    this.state = function(w) {
      return w.store.getState();
    };
  };

  const teardown = function() {
    this.sb.restore();
    this.pubsub.destroy();
    this.state = null;
    $('test-area').empty();
  };

  describe('Associated Widget (associated_widget.spec.js)', function() {
    describe('Widget Essentials', function() {
      beforeEach(init);
      afterEach(teardown);
      it('instance of base widget', function() {
        expect(new Widget() instanceof BaseWidget).to.eql(true);
      });
      it('makes all necessary subscriptions', function(done) {
        const w = new Widget();
        const getPubSub = this.sb.stub(w, 'getPubSub');
        // activateWidget makes an extra subscription, we won't count that
        this.sb.stub(w, 'activateWidget');
        this.sb.stub(w, 'attachGeneralHandler');
        const stubs = {
          CUSTOM_EVENT: 1,
          DELIVERING_RESPONSE: 2,
          subscribe: this.sb.spy(),
        };
        getPubSub.returns(stubs);
        w.activate(this.pubsub.beehive);
        expect(stubs.subscribe.callCount).to.eql(2);
        expect(stubs.subscribe.args[0][0]).to.eql(1);
        expect(stubs.subscribe.args[1][0]).to.eql(2);
        done();
      });
    });
    describe('Communicating with the API', function() {
      beforeEach(init);
      afterEach(teardown);
      it('waits for abstract to fire event before attempting to load', function(done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const rSpy = this.pubsub.request;
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect(rSpy.calledOnce).to.eql(true);
        expect(rSpy.args[0][0].get('target')).to.eql('resolver/foo/associated');
        expect(rSpy.args[0][0].get('query').get('q')).to.eql(undefined);
        done();
      });

      it('works if bibcode is array', function(done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const rSpy = this.pubsub.request;
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: ['foo'],
          property: ['ASSOCIATED'],
        });
        expect(rSpy.calledOnce).to.eql(true);
        expect(rSpy.args[0][0].get('target')).to.eql('resolver/foo/associated');
        expect(rSpy.args[0][0].get('query').get('q')).to.eql(undefined);
        done();
      });

      it('attempts to find identifier if bibcode is missing', function(done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const rSpy = this.pubsub.request;
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          identifier: ['foo', 'bar'],
          property: ['ASSOCIATED'],
        });
        expect(rSpy.calledOnce).to.eql(true);
        expect(rSpy.args[0][0].get('target')).to.eql('resolver/foo/associated');
        expect(rSpy.args[0][0].get('query').get('q')).to.eql(undefined);
        done();
      });

      it('does not fire if associated is not present on property', function(done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const rSpy = this.pubsub.request;
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          identifier: ['foo', 'bar'],
          property: ['REFEREED'],
        });
        expect(rSpy.calledOnce).to.eql(false);
        done();
      });

      it('does not fire if data is not present', function(done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const rSpy = this.pubsub.request;
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data');
        expect(rSpy.calledOnce).to.eql(false);
        done();
      });

      it('does not fire if the current bibcode equals the new one', function(done) {
        const w = new Widget();
        w.activate(this.pubsub.beehive);
        const rSpy = this.pubsub.request;
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect(rSpy.calledOnce).to.eql(true);
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect(rSpy.calledTwice).to.eql(false);
        done();
      });
    });

    describe('User Interface', function() {
      beforeEach(init);
      afterEach(teardown);
      it('if loading, do not render', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockQuery = {
          toJSON: _.constant({
            q: ['bibcode:foo'],
          }),
        };
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect(this.state(w).ui.loading).to.eql(true);
        expect($el.find('.fa-spinner').length).to.eql(0);
        expect($el.find('#associated_works').length).to.eql(0);
        expect($el.find('.associated_work').length).to.eql(0);
        expect($el.find('#associated_works_btn').length).to.eql(0);
        done();
      });
      it('if no items, do not render', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        const mockQuery = {
          toJSON: _.constant({
            q: ['bibcode:foo'],
          }),
        };
        this.pubsub.request.returns(mockResponse(0)); // no docs
        this.pubsub.publish(this.pubsub.DISPLAY_DOCUMENTS, mockQuery);
        expect($el.find('.fa-spinner').length).to.eql(0);
        expect($el.find('#associated_works').length).to.eql(0);
        expect($el.find('.associated_work').length).to.eql(0);
        expect($el.find('#associated_works_btn').length).to.eql(0);
        done();
      });
      it('if error, do not render', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        this.pubsub.request.returns('nothing here'); // the error
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect($el.find('.fa-spinner').length).to.eql(0);
        expect($el.find('#associated_works').length).to.eql(0);
        expect($el.find('.associated_work').length).to.eql(0);
        expect($el.find('#associated_works_btn').length).to.eql(0);
        done();
      });
      it('if items count less than or equal to max, do not show button', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        this.pubsub.request.returns(mockResponse(3)); // 3 docs
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect($el.find('#associated_works_btn').length).to.eql(0);
        done();
      });
      it('if items count greater than max do show button', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        this.pubsub.request.returns(mockResponse(10)); // 10 docs
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect($el.find('#associated_works_btn').length).to.eql(1);
        done();
      });
      it('if has more items than max, make sure to show full count at top', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        this.pubsub.request.returns(mockResponse(10)); // 10 docs
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect(/\((.*)\)/.exec($el.text())[1]).to.eql('10');
        done();
      });
      it('if button is "show all", only show the first (max) records', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        this.pubsub.request.returns(mockResponse(10)); // 10 docs
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        expect($el.find('#associated_works').length).to.eql(1);
        expect($el.find('.associated_work').length).to.eql(4);
        expect($el.find('#associated_works_btn').prop('value')).to.eql(
          'Show All'
        );
        done();
      });
      it('if "show all" button is clicked, button is toggled and show all records', function(done) {
        const w = new Widget();
        const $el = $(w.view.render().$el).appendTo('#test-area');
        w.activate(this.pubsub.beehive);
        this.pubsub.request.returns(mockResponse(10)); // 10 docs
        this.pubsub.publish(this.pubsub.CUSTOM_EVENT, 'latest-abstract-data', {
          bibcode: 'foo',
          property: ['ASSOCIATED'],
        });
        $('#associated_works_btn', $el).click();
        expect($el.find('.fa-spinner').length).to.eql(0);
        expect($el.find('#associated_works').length).to.eql(1);
        expect($el.find('.associated_work').length).to.eql(10);
        expect($el.find('#associated_works_btn').prop('value')).to.eql(
          'Show Less'
        );
        $('#associated_works_btn', $el).click();
        expect($el.find('.fa-spinner').length).to.eql(0);
        expect($el.find('#associated_works').length).to.eql(1);
        expect($el.find('.associated_work').length).to.eql(4);
        expect($el.find('#associated_works_btn').prop('value')).to.eql(
          'Show All'
        );
        done();
      });
    });
  });
});
