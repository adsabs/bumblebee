define([
    'underscore',
    'js/widgets/list_of_things/details_widget',
    'js/bugutils/minimal_pubsub',
    '../../widgets/test_json/test1',
    '../../widgets/test_json/test2',
    'js/modules/orcid/extension'
  ],
  function(
    _,
    DetailsWidget,
    MinimalPubsub,
    Test1,
    Test2,
    OrcidExtension
    ) {
    describe("Orcid Extension (orcid_extension.spec.js)", function() {
      var minsub;
      beforeEach(function (done) {
        minsub = new (MinimalPubsub.extend({
          request: function (apiRequest) {
            var fakeSolrResponse = this.requestCounter % 2 == 0 ? Test2() : Test1();
            if (apiRequest.get("query").get("start"))
             fakeSolrResponse.response.start = apiRequest.get("query").get("start")[0];
            return fakeSolrResponse;
          }
        }))({verbose: false});

        minsub.beehive.addService('OrcidApi', {
          hasAccess: function() {return true;},
          getOrcidProfileInAdsFormat: function() {
            var defer = $.Deferred();
            defer.resolve({
              response: {
                docs: []
              }
            })
            return defer.promise();
          },
          getRecordInfo: function(data) {
            var defer = $.Deferred();

            if (data.bibcode == '2013arXiv1305.3460H') {
              defer.resolve({
                isCreatedByUs: true,
                isCreatedByOthers: false
              });
            }
            else if (data.bibcode == '2008PhDT.......169R') {
              defer.resolve({
                isCreatedByUs: true,
                isCreatedByOthers: true
              });
            }
            else if (data.bibcode == '1987sbge.proc..355F') {
              defer.resolve({
                isCreatedByUs: false,
                isCreatedByOthers: true
              });
            }
            else {
              defer.resolve({
                isCreatedByUs: false,
                isCreatedByOthers: false
              });
            }
            return defer.promise();
          },
          getHardenedInstance: function() {
            return this;
          }
        });
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

      var _getWidget = function() {
        var Widget = OrcidExtension(DetailsWidget);
        var widget = new Widget();

        minsub.beehive.addObject('User', {getHardenedInstance: function() {return this}, isOrcidModeOn: function() {return true;}});

        widget.activate(minsub.beehive.getHardenedInstance());
        minsub.publish(minsub.DISPLAY_DOCUMENTS, minsub.createQuery({
         q : "bibcode:star"
        }));

        var $w = $(widget.render().el);
        $('#test').append($w);
        return {widget: widget, '$w': $w};
      };


      it("Should wrap the widget (adding orcid actions)", function(done) {
        var w = _getWidget();
        expect(w.$w.find('.orcid-update').length).to.be.gt(1);
        done();
      });

      it("has methods to manipulate records", function(done) {
        var w = _getWidget();

        var oApi = minsub.beehive.getService('OrcidApi');
        sinon.spy(w.widget, 'mergeADSAndOrcidData');

        oApi.updateOrcid = function(action, data) {
          expect(action).to.eql(expectedAction);
          expect(data.bibcode).to.eql(expectedBibcode);
          var d = $.Deferred();
          return d.promise();
        };

        var expectedAction = 'update';
        var expectedBibcode = '2013arXiv1305.3460H'; // our rec
        expect(w.widget.view.children.findByIndex(0).$el.find('.orcid-add').length).to.eql(0);
        expect(w.widget.view.children.findByIndex(0).$el.find('.orcid-update').length).to.eql(1);
        expect(w.widget.view.children.findByIndex(0).$el.find('.orcid-delete').length).to.eql(1);
        expect(w.widget.view.children.findByIndex(0).$el.find('.orcid-view').length).to.eql(0);

        w.widget.view.children.findByIndex(0).$el.find('.orcid-update').click();
        expect(w.widget.mergeADSAndOrcidData.called).to.eql(true);

        expectedAction = 'delete';
        w.widget.view.children.findByIndex(0).$el.find('.orcid-delete').click();

        expectedBibcode = '2008PhDT.......169R'; // both have it
        expect(w.widget.view.children.findByIndex(1).$el.find('.orcid-add').length).to.eql(0);
        expect(w.widget.view.children.findByIndex(1).$el.find('.orcid-update').length).to.eql(1);
        expect(w.widget.view.children.findByIndex(1).$el.find('.orcid-delete').length).to.eql(1);
        expect(w.widget.view.children.findByIndex(1).$el.find('.orcid-view').length).to.eql(1);

        expectedAction = 'view';
        w.widget.view.children.findByIndex(1).$el.find('.orcid-view').click();

        expectedBibcode = '1987sbge.proc..355F'; // they have it
        expect(w.widget.view.children.findByIndex(2).$el.find('.orcid-add').length).to.eql(1);
        expect(w.widget.view.children.findByIndex(2).$el.find('.orcid-update').length).to.eql(0);
        expect(w.widget.view.children.findByIndex(2).$el.find('.orcid-delete').length).to.eql(0);
        expect(w.widget.view.children.findByIndex(2).$el.find('.orcid-view').length).to.eql(1);

        expectedAction = 'add';
        w.widget.view.children.findByIndex(2).$el.find('.orcid-add').click();


        done();
      });

      it("when displaying a record, it can handle the 'pending' state", function(done) {
        var w = _getWidget();
        var spy = sinon.spy();
        w.widget.on('orcid-update-finished', spy);

        var oApi = minsub.beehive.getService('OrcidApi');
        var d = $.Deferred();

        oApi.getRecordInfo = function() {
          return d.promise();
        };

        // force new batch (render)
        minsub.publish(minsub.DISPLAY_DOCUMENTS, minsub.createQuery({
          q: "bibcode:star"
        }));

        // widgets are in the 'loading' state
        expect(w.widget.view.children.findByIndex(1).$el.find('.s-orcid-loading').length).to.eql(1);
        expect(spy.called).to.eql(false);

        // simulate the data has arrived
        d.resolve({
          isCreatedByUs: true,
          isCreatedByOthers: true
        });

        // the widget displays orcid actions
        expect(w.widget.view.children.findByIndex(1).$el.find('.s-orcid-loading').length).to.eql(0);
        expect(w.widget.view.children.findByIndex(1).$el.find('.orcid-update').length).to.eql(1);
        expect(spy.called).to.eql(true);

        // now test errors
        d = $.Deferred();
        spy.reset();

        minsub.publish(minsub.DISPLAY_DOCUMENTS, minsub.createQuery({
          q: "bibcode:star"
        }));

        // widgets are in the 'loading' state
        expect(w.widget.view.children.findByIndex(1).$el.find('.s-orcid-loading').length).to.eql(1);
        expect(spy.called).to.eql(false);

        // simulate error
        d.reject();

        // the widget displays orcid actions
        expect(w.widget.view.children.findByIndex(1).$el.find('.s-orcid-loading').length).to.eql(0);
        expect(spy.called).to.eql(true);

        // but the style is 'danger'
        expect(w.widget.view.children.findByIndex(1).$el.find('button.btn-danger').length).to.eql(1);
        done();
      });

      it("merges ADS data before sending them to orcid", function(done) {
        var w = _getWidget();
        var widget = w.widget;
        var spy = sinon.spy();
        sinon.spy(widget.getPubSub(), 'publish');

        var model = widget.model;
        widget.mergeADSAndOrcidData(model);
        expect(widget.getPubSub().publish.called).to.eql(false);

        model.set('bibcode', 'foo');
        widget.mergeADSAndOrcidData(model);
        expect(widget.getPubSub().publish.called).to.eql(false);

        model.set('bibcode', null);
        model.set('source_name', 'ads');
        model.set('identifier', 'foo');

        widget.mergeADSAndOrcidData(model);

        expect(widget.getPubSub().publish.called).to.eql(true);
        expect(widget.getPubSub().publish.lastCall.args[1].get('query').get('q')).to.eql(['identifier:foo']);


        // test of the internal logic

        widget.mergeADSAndOrcidData = function() {
          var d = $.Deferred();
          d.resolve(widget.model);
          return d.promise();
        };
        widget.getBeeHive().getService = function() {return {
          updateOrcid: function() {
            expect(model.get('orcid').pending).to.eql(true);
            var d = $.Deferred();
            d.resolve({});
            return d.promise();
          }
        }};
        var uSpy = sinon.spy();
        widget.once('orcidAction:add', uSpy);

        widget.onAllInternalEvents('childview:OrcidAction', null, {model: model, action: 'add'});
        expect(model.get('orcid').actions.add).to.be.defined;
        expect(uSpy.called).to.eql(true);

        uSpy.reset();
        widget.once('orcidAction:delete', uSpy);
        model.attributes.source_name = 'external; NASA ADS';
        widget.onAllInternalEvents('childview:OrcidAction', null, {model: model, action: 'delete'});
        expect(model.attributes.source_name).to.eql('external');
        expect(uSpy.called).to.eql(false); // when there is still something, keep the rec

        model.attributes.source_name = 'NASA ADS';
        widget.onAllInternalEvents('childview:OrcidAction', null, {model: model, action: 'delete'});
        expect(uSpy.called).to.eql(true);

        done();
      });
    })
  }
);