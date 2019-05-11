define([
  'js/components/second_order_controller',
  'js/bugutils/minimal_pubsub',
  'js/components/api_request',
  'js/components/api_query'
], function (SOController, MinSub, ApiRequest, ApiQuery) {

  const init = function () {
    this.requestSpy = sinon.spy();
    const minsub = this.minsub = new (MinSub.extend({
      request: this.requestSpy
    }))({ verbose: false });
    this.addAppStorage = (items, queryData) => {
      minsub.beehive.addObject('AppStorage', {
        getSelectedPapers: () => items,
        getCurrentQuery: () => { return new ApiQuery(queryData); }
      });
    };
    this.createTestItem = function (cb) {
      const c = new SOController({ transformDebounce: 0 });
      cb && cb(c);
      c.activate(minsub.beehive);
      c.getBeeHive = () => minsub.beehive;
      return c;
    }
  };

  describe('Second Order Controller', function () {
    beforeEach(init);

    it('listens for custom event', function () {
      this.minsub.pubsub.subscribe = sinon.spy();
      // this will call activate
      this.createTestItem();
      expect(this.minsub.pubsub.subscribe.called).to.eql(true);
    });

    it('properly splits the field information from the pubsub event', function () {
      const ti = this.createTestItem();
      ti.transform = sinon.spy();
      _.forEach(_.values(ti.FIELDS), (field) => {
        this.minsub.publish('second-order-search/' + field);
        expect(ti.transform.lastCall.lastArg[0]).to.eql(field);
      });
    });

    it('sends a request using selected items for a qid from vault', function () {
      this.addAppStorage(['foo', 'bar']);
      this.minsub.pubsub.publish = sinon.spy();
      const ti = this.createTestItem();
      ti.transform('references', { onlySelected: true });
      const req = this.minsub.pubsub.publish.lastCall.args[2];
      expect(req).is.instanceof(ApiRequest);
      expect(req.get('target')).to.eql('vault/query');
      expect(req.get('options').type).to.eql('POST');
      expect(req.get('query').toJSON()).to.eql({
        "bigquery": [
          "bibcode\nfoo\nbar"
        ],
        "q": [
          "*:*"
        ],
        "fq": [
          "{!bitset}"
        ],
        "sort": [
          "date desc"
        ]
      });
    });

    it('requests first N papers using the currentQuery', function () {
      this.addAppStorage(['foo', 'bar'], { q: 'star' });
      const pubSpy = sinon.spy();
      this.minsub.pubsub.publish = pubSpy;
      const ti = this.createTestItem();
      const docsResponse = {
        response: { 
          docs: [
            { bibcode: 'foo' },
            { bibcode: 'bar' },
            { bibcode: 'baf' }
          ],
          numFound: 100
        }
      }
      const qidPromise = $.Deferred().resolve(999).promise();
      const docsPromise = $.Deferred().resolve(docsResponse).promise();
      ti.getBigQueryResponse = sinon.stub().returns(qidPromise);
      ti.sendQuery = sinon.stub().returns(docsPromise);
      ti.transform('references');
      expect(ti.sendQuery.calledOnce).to.eql(true);
      expect(ti.sendQuery.lastCall.args[0].toJSON()).to.eql({
        "q": [
          "star"
        ],
        "fl": [
          "bibcode"
        ],
        "start": [
          0
        ],
        "rows": [
          1000
        ]
      });
      expect(ti.getBigQueryResponse.lastCall.args[0]).to.eql(['foo', 'bar', 'baf']);
    });

    it('properly paginates currentQuery to a set max', function () {
      this.addAppStorage(['foo', 'bar'], { q: 'star' });
      const ti = this.createTestItem();
      const docsResponse = {
        response: { 
          docs: [
            { bibcode: 'foo' }
          ],
          numFound: 10000
        }
      };
      const qidPromise = $.Deferred().resolve(999).promise();
      const docsPromise = $.Deferred().resolve(docsResponse).promise();
      ti.getBigQueryResponse = sinon.stub().returns(qidPromise);
      ti.sendQuery = sinon.stub().returns(docsPromise);
      ti.transform('references');
      expect(ti.sendQuery.callCount).to.eql(6);
      expect(_.invoke(_.flatten(ti.sendQuery.args), 'toJSON')).to.eql([
        {"q":["star"],"fl":["bibcode"],"start":[0],"rows":[1000]},
        {"q":["star"],"fl":["bibcode"],"start":[1000],"rows":[1000]},
        {"q":["star"],"fl":["bibcode"],"start":[2000],"rows":[1000]},
        {"q":["star"],"fl":["bibcode"],"start":[3000],"rows":[1000]},
        {"q":["star"],"fl":["bibcode"],"start":[4000],"rows":[1000]},
        {"q":["star"],"fl":["bibcode"],"start":[5000],"rows":[1000]}
      ]);
      expect(ti.getBigQueryResponse.lastCall.args[0]).to.eql(['foo', 'foo', 'foo', 'foo', 'foo', 'foo']);
    });

    it('pagination will stop short, if records are below max', function () {
      this.addAppStorage(['foo', 'bar'], { q: 'star' });
      const ti = this.createTestItem();
      const docsResponse = {
        response: { 
          docs: [
            { bibcode: 'foo' }
          ],
          numFound: 2594
        }
      };
      const qidPromise = $.Deferred().resolve(999).promise();
      const docsPromise = $.Deferred().resolve(docsResponse).promise();
      ti.getBigQueryResponse = sinon.stub().returns(qidPromise);
      ti.sendQuery = sinon.stub().returns(docsPromise);
      ti.transform('references');
      expect(ti.sendQuery.callCount).to.eql(3);
      expect(_.invoke(_.flatten(ti.sendQuery.args), 'toJSON')).to.eql([
        {"q":["star"],"fl":["bibcode"],"start":[0],"rows":[1000]},
        {"q":["star"],"fl":["bibcode"],"start":[1000],"rows":[1000]},
        {"q":["star"],"fl":["bibcode"],"start":[2000],"rows":[1000]}
      ]);
      expect(ti.getBigQueryResponse.lastCall.args[0]).to.eql(['foo', 'foo', 'foo']);
    });

    it('uses qid and field to create new query, and navigates to search-page', function () {
      this.addAppStorage(['foo', 'bar']);
      const pubSpy = sinon.spy();
      this.minsub.pubsub.publish = pubSpy;
      const ti = this.createTestItem();
      const promise = $.Deferred().resolve(999).promise();
      ti.getBigQueryResponse = sinon.stub().returns(promise);

      // run each field through it to make sure they make it
      _.forEach(_.values(ti.FIELDS), (field) => {
        ti.transform(field);
        const args = pubSpy.lastCall.args;
        expect(args[2]).to.eql('search-page');
        expect(args[3].q.toJSON()).to.eql({
          q: [`${field}(docs(999))`]
        });
      })
    });

    it('will throw error if no records are found', function () {
      this.addAppStorage(['foo', 'bar'], { q: 'star' });
      const ti = this.createTestItem();
      const docsResponse = {
        response: { 
          docs: [],
          numFound: 0
        }
      };
      const docsPromise = $.Deferred().resolve(docsResponse).promise();
      ti.sendQuery = sinon.stub().returns(docsPromise);
      expect(ti.transform.bind(ti, 'references')).to.throw('no records found');
      expect(ti.sendQuery.callCount).to.eql(1);
      expect(_.invoke(_.flatten(ti.sendQuery.args), 'toJSON')).to.eql([
        {"q":["star"],"fl":["bibcode"],"start":[0],"rows":[1000]}
      ]);
    });

    it('throws if field is invalid', function () {
      const ti = this.createTestItem();
      _.forEach(['foo', 'bar', 'test', '1', '2', '3', undefined, 1, 2], (field) => {
        expect(ti.transform.bind(ti, field)).to.throw('must pass in a valid field');
      });
    });

    it('throws error if no qid response from vault', function () {
      this.addAppStorage(['foo', 'bar']);
      const ti = this.createTestItem();
      const promise = $.Deferred().resolve(undefined).promise();
      ti.getBigQueryResponse = sinon.stub().returns(promise);
      expect(ti.transform.bind(ti, 'references', { onlySelected: true })).to.throw('no qid from vault');
    });

    it('throws error if an error occurred during request to vault', function () {
      this.addAppStorage(['foo', 'bar']);
      const ti = this.createTestItem();
      const errResponse = { responseJSON: { error: 'something bad happened' }};
      const promise = $.Deferred().reject(errResponse).promise();
      ti.getBigQueryResponse = sinon.stub().returns(promise);
      expect(ti.transform.bind(ti, 'references', { onlySelected: true })).to.throw(errResponse.error);
    });
  });
});
