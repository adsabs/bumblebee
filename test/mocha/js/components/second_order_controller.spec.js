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
      ti.transform('useful', { onlySelected: true });
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

    it('transforms current query into a fielded query', function () {
      this.addAppStorage(['foo', 'bar'], { q: 'star' });
      const pubSpy = sinon.spy();
      this.minsub.pubsub.publish = pubSpy;
      const ti = this.createTestItem();
      _.forEach(_.values(ti.FIELDS), (field) => {
        ti.transformCurrentQuery(field);
        const args = pubSpy.lastCall.args;
        expect(args[2]).to.eql('search-page');
        expect(args[3].q.toJSON()).to.eql({
          q: [`${field}((star))`]
        });
      });
    });

    it('transforms complex current query into a fielded query', function () {
      this.addAppStorage(['foo', 'bar'], {"filter_property_fq_property":["AND","property:\"notrefereed\""],"fq":["{!type=aqp v=$fq_database}","{!type=aqp v=$fq_author}","{!type=aqp v=$fq_property}","{!type=aqp v=$fq_bibstem_facet}"],"fq_author":["((author_facet_hier:\"0/Geller, M\" OR author_facet_hier:\"0/Mould, J\") NOT author_facet_hier:\"0/Madore, B\")"],"fq_bibstem_facet":["(*:* NOT bibstem_facet:\"yCat\" NOT bibstem_facet:\"AAS\" NOT bibstem_facet:\"IAUS\")"],"fq_database":["(database:astronomy)"],"fq_property":["(property:\"notrefereed\")"],"q":["author:\"huchra, john\""],"sort":["date desc, bibcode desc"],"p_":["0"]});
      const pubSpy = sinon.spy();
      this.minsub.pubsub.publish = pubSpy;
      const ti = this.createTestItem();
      _.forEach(_.values(ti.FIELDS), (field) => {
        ti.transformCurrentQuery(field);
        const args = pubSpy.lastCall.args;
        expect(args[2]).to.eql('search-page');
        expect(args[3].q.toJSON()).to.eql({
          q: [`${field}((author:"huchra, john") AND (database:astronomy) AND ((author_facet_hier:"0/Geller, M" OR author_facet_hier:"0/Mould, J") NOT author_facet_hier:"0/Madore, B") AND (property:"notrefereed") AND (*:* NOT bibstem_facet:"yCat" NOT bibstem_facet:"AAS" NOT bibstem_facet:"IAUS"))`]
        });
      });
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
      });
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
      expect(ti.transform.bind(ti, 'useful', { onlySelected: true })).to.throw('no qid from vault');
    });

    it('throws error if an error occurred during request to vault', function () {
      this.addAppStorage(['foo', 'bar']);
      const ti = this.createTestItem();
      const errResponse = { responseJSON: { error: 'something bad happened' }};
      const promise = $.Deferred().reject(errResponse).promise();
      ti.getBigQueryResponse = sinon.stub().returns(promise);
      expect(ti.transform.bind(ti, 'useful', { onlySelected: true })).to.throw(errResponse.error);
    });
  });
});
