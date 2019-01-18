define([
  'jquery',
  'js/components/alerts_mediator',
  'js/components/generic_module',
  'js/bugutils/minimal_pubsub',
  'js/components/alerts',
  'js/widgets/alerts/widget',
  'js/components/api_feedback'
], function (
  $,
  AlertsMediator,
  GenericModule,
  MinimalPubSub,
  Alerts,
  AlertsWidget,
  ApiFeedback
  ) {

  describe("Alerts Mediator (alerts_mediator.spec.js)", function () {

    var minsub;
    beforeEach(function (done) {
      minsub = new MinimalPubSub({verbose: false});
      done();
    });

    afterEach(function (done) {
      minsub.destroy();
      var ta = $('#test');
      if (ta) {
        ta.empty();
      }
      done();
    });

    var _getM = function() {
      var m = new AlertsMediator();
      var widget = new AlertsWidget();
      widget.activate(minsub.beehive.getHardenedInstance());
      sinon.spy(m, 'alert');
      sinon.spy(m, 'onAlert');
      var app = {
        _getWidget: function(name) {
          var defer = $.Deferred();
          if (name == 'AlertsWidget') {
            defer.resolve(widget);
          }
          return defer.promise();
        },
        getController: function(name) {
          if (name == 'AlertsController')
            return m;
        }
      };
      m.activate(minsub.beehive, app);
      return {m: m, app:app, widget:widget};
    };

    it("extends GenericModule", function () {
      expect(new AlertsMediator()).to.be.instanceof(GenericModule);
      var m = new AlertsMediator();
      expect(function() {m.activate(minsub.beehive, {getWidget: function() {}})}).to.throw.Error;
    });

    it("works with pubsub and alone", function(done) {
      var x = _getM();
      var m = x.m;

      m.getWidget().done(function(widget) {
        expect(widget).to.equal(x.widget);

        minsub.publish(minsub.ALERT, new ApiFeedback({code: 0, msg: 'foo'}));
        expect(m.onAlert.called).to.be.true;
        expect(m.alert.called).to.be.true;
  
        done();
      })

    });

    it("fails when message cannot be displayed", function(done) {
      var x = _getM();
      x.app._getWidget = function() {return $.Deferred().reject().promise()};
      x.m._widget = null;
      x.m.alert(new ApiFeedback({msg: 'foo'})).fail(function() {done()})
      
    });

    it("accepts different payload for events", function() {
      var x = _getM();
      var $w = x.widget.render().$el;
      $('#test').append($w);

      var promise;
      promise = x.m.onAlert(new ApiFeedback({
        msg: 'this is <a href="foo">html</a> message',
        events: {
          'click #page-top-alert a': 'foo-bar'
        }
      }))
      .done(function(x) {
        expect(x).to.be.eql('foo-bar');
      });
      $w.find('#page-top-alert a').click();
      expect(promise.state()).to.be.eql('resolved');


      // function
      var spy = sinon.spy();
      promise = x.m.onAlert(new ApiFeedback({
        msg: 'this is <a href="foo">html</a> message',
        events: {
          'click #page-top-alert a': spy
        }
      }));
      $w.find('#page-top-alert a').click();
      expect(promise.state()).to.eql('resolved');
      expect(spy.called).to.be.true;

      // actions
      sinon.spy(x.m.getPubSub(), 'publish');
      promise = x.m.onAlert(new ApiFeedback({
        msg: 'this is <a href="foo">html</a> message',
        events: {
          'click #page-top-alert a': {
            action: Alerts.ACTION.TRIGGER_FEEDBACK,
            arguments: {code: 0}
          }
        }
      }));
      $w.find('#page-top-alert a').click();
      expect(x.m.getPubSub().publish.called).to.be.true;

    });

  })

});