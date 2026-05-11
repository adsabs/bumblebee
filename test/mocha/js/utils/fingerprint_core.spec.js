define(['js/utils/fingerprint_core'], function(fingerprintCore) {
  describe('FingerprintCore (fingerprint_core.spec.js)', function() {
    var sb;

    beforeEach(function() {
      sb = sinon.sandbox.create();
      fingerprintCore._reset();
    });

    afterEach(function() {
      sb.restore();
      fingerprintCore._reset();
      delete window.FingerprintJS;
    });

    // Stub appendChild to trigger onload with a given FingerprintJS mock.
    // Uses sinon 1.x 3-arg form: stub(obj, method, fn).
    function stubAppendWithLoad(fpMock) {
      sb.stub(document.head, 'appendChild', function(el) {
        window.FingerprintJS = fpMock;
        el.onload();
      });
    }

    function stubAppendWithError() {
      sb.stub(document.head, 'appendChild', function(el) {
        el.onerror(new Error('network error'));
      });
    }

    describe('load()', function() {
      it('is a no-op and returns a resolved promise when apiKey is falsy', function(done) {
        var spy = sb.spy(document.head, 'appendChild');
        fingerprintCore.load('').then(function() {
          expect(spy.called).to.equal(false);
          expect(fingerprintCore.getVisitorId()).to.equal(null);
          done();
        });
      });

      it('injects a script tag with the FingerprintJS Pro CDN src', function(done) {
        var getStub = sb.stub();
        getStub.returns(Promise.resolve({ visitorId: 'test-visitor-id-123' }));
        var loadStub = sb.stub();
        loadStub.returns(Promise.resolve({ get: getStub }));
        stubAppendWithLoad({ load: loadStub });

        fingerprintCore.load('MY-API-KEY').then(function() {
          var appendedEl = document.head.appendChild.args[0][0];
          expect(appendedEl.src).to.contain('fpjscdn.net/v3/MY-API-KEY');
          expect(appendedEl.id).to.equal(fingerprintCore.SCRIPT_ID);
          done();
        });
      });

      it('caches the visitorId after successful resolution', function(done) {
        var getStub = sb.stub();
        getStub.returns(Promise.resolve({ visitorId: 'visitor-abc' }));
        var loadStub = sb.stub();
        loadStub.returns(Promise.resolve({ get: getStub }));
        stubAppendWithLoad({ load: loadStub });

        fingerprintCore.load('KEY').then(function() {
          expect(fingerprintCore.getVisitorId()).to.equal('visitor-abc');
          done();
        });
      });

      it('returns the same promise if called multiple times', function() {
        sb.stub(document.head, 'appendChild'); // pending — never fires onload
        var p1 = fingerprintCore.load('KEY');
        var p2 = fingerprintCore.load('KEY');
        expect(p1).to.equal(p2);
        expect(document.head.appendChild.callCount).to.equal(1);
      });

      it('keeps visitorId null and clears loadingPromise on script load failure', function(done) {
        stubAppendWithError();

        fingerprintCore.load('KEY').then(function() {
          expect(fingerprintCore.getVisitorId()).to.equal(null);
          done();
        });
      });

      it('keeps visitorId null and clears loadingPromise when FingerprintJS.load() rejects', function(done) {
        var loadStub = sb.stub();
        loadStub.returns(Promise.reject(new Error('init failure')));
        stubAppendWithLoad({ load: loadStub });

        fingerprintCore.load('KEY').then(function() {
          expect(fingerprintCore.getVisitorId()).to.equal(null);
          done();
        });
      });

      it('keeps visitorId null and clears loadingPromise when fp.get() rejects', function(done) {
        var getStub = sb.stub();
        getStub.returns(Promise.reject(new Error('get failure')));
        var loadStub = sb.stub();
        loadStub.returns(Promise.resolve({ get: getStub }));
        stubAppendWithLoad({ load: loadStub });

        fingerprintCore.load('KEY').then(function() {
          expect(fingerprintCore.getVisitorId()).to.equal(null);
          done();
        });
      });

      it('allows retry after a transient failure', function(done) {
        stubAppendWithError();

        fingerprintCore.load('KEY').then(function() {
          expect(fingerprintCore.getVisitorId()).to.equal(null);

          // restore and set up a successful second attempt
          document.head.appendChild.restore();
          var getStub = sb.stub();
          getStub.returns(Promise.resolve({ visitorId: 'retry-visitor' }));
          var loadStub = sb.stub();
          loadStub.returns(Promise.resolve({ get: getStub }));
          stubAppendWithLoad({ load: loadStub });

          return fingerprintCore.load('KEY');
        }).then(function() {
          expect(fingerprintCore.getVisitorId()).to.equal('retry-visitor');
          done();
        });
      });

      it('keeps visitorId null when result has no visitorId field', function(done) {
        var getStub = sb.stub();
        getStub.returns(Promise.resolve({}));
        var loadStub = sb.stub();
        loadStub.returns(Promise.resolve({ get: getStub }));
        stubAppendWithLoad({ load: loadStub });

        fingerprintCore.load('KEY').then(function() {
          expect(fingerprintCore.getVisitorId()).to.equal(null);
          done();
        });
      });
    });

    describe('getVisitorId()', function() {
      it('returns null before load() is called', function() {
        expect(fingerprintCore.getVisitorId()).to.equal(null);
      });

      it('returns null while load() is still pending', function() {
        sb.stub(document.head, 'appendChild'); // never fires onload
        fingerprintCore.load('KEY');
        expect(fingerprintCore.getVisitorId()).to.equal(null);
      });

      it('never throws', function() {
        expect(function() { fingerprintCore.getVisitorId(); }).to.not.throw();
      });
    });
  });
});
