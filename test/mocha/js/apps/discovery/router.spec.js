define([
  'underscore',
  'js/apps/discovery/router',
  'js/components/beehive',
  'js/services/api',
  'js/services/pubsub',
  'js/components/session'
], function (
  _,
  Router,
  Beehive,
  Api,
  PubSub,
  Session
) {


  describe("Router", function () {

    it("all endpoints", function () {

      var r = new Router();

      var beehive = new Beehive();

      var fakePubSub = new PubSub();
      sinon.spy(fakePubSub, "publish");
      beehive.addService("PubSub", fakePubSub);

      r.activate(beehive.getHardenedInstance());


      r.routerNavigate('foo')
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("foo");
      expect(fakePubSub.publish.lastCall.args[3]).to.eql({})

      r.index('foo')
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("index-page");
      expect(fakePubSub.publish.lastCall.args[3]).to.eql({})

      r.classicForm();
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("ClassicSearchForm");

      r.paperForm();
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("PaperSearchForm");

      r.search("q=foo", "metrics");
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("search-page");
      expect(fakePubSub.publish.lastCall.args[3]['q'].url()).to.eql('q=foo');
      expect(fakePubSub.publish.lastCall.args[3]['page']).to.eql('show-metrics');

      r.executeQuery('queryid');
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("execute-query");
      expect(fakePubSub.publish.lastCall.args[3]).to.eql('queryid');

      r.view('bibcooode/metrics')
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("ShowMetrics");
      expect(fakePubSub.publish.lastCall.args[3]).to.eql({
        href: "#abs/bibcooode/metrics",
        bibcode: "bibcooode",
      });

      r.view('test/test/test/test/test/metrics')
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("ShowMetrics");
      expect(fakePubSub.publish.lastCall.args[3]).to.eql({
        href: "#abs/test%2Ftest%2Ftest%2Ftest%2Ftest/metrics",
        bibcode: "test/test/test/test/test",
      });

      r.routeToVerifyPage('subview', 'token')
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("user-action");
      expect(fakePubSub.publish.lastCall.args[3]).to.eql({
        subView: "subview",
        token: "token",
      })

      r.orcidPage()
      expect(fakePubSub.publish.lastCall.args[1]).to.eql(fakePubSub.NAVIGATE);
      expect(fakePubSub.publish.lastCall.args[2]).to.eql("orcid-page");
      expect(fakePubSub.publish.lastCall.args[3]).to.not.eql({
        replace: true
      })

      // TODO: add other endpoints
    })



  })

});
