/**
 * Created by rchyla on 3/16/14.
 */

define(['js/components/facade', 'underscore'], function(Facade, _) {

  var test = function () {
    describe("Facade protection (Component)", function () {

      it("should wrap an instance protecting all of its methods", function () {
        var spy = sinon.spy();

        // The interface itself
        var interface = {
          start: 'method to start',
          stop: 'method to stop',
          valueX: 'variable copied over',
          facade: 'this should be allowed',
          methodX: function () {
            return this.hidden
          },
          complexObject: '',
          methodZ: function () {
            return this.methodZValue;
          }
        };

        // An implelemntation of the interface
        var imp = {
          start: function () {
            spy('start', _.toArray(arguments));
            return this;
          },
          stop: function () {
            spy('stop', _.toArray(arguments));
            return this;
          },
          valueX: 'foo',
          private: 'bar',
          array: [1, 2],
          object: {foo: 'boo'},
          facade: new Facade(),
          hidden: 42,
          complexObject: {
            getHardenedInstance: function () {
              return {
                answer: function () {
                  return 42;
                }
              }
            }
          },
          methodZ: function () {
            throw new Error("This should have been redefined");
          },
          methodZValue: 42
        };

        var facade = new Facade(interface, imp);

        expect(facade.private).to.be.undefined;
        expect(facade.valueX).to.be.eql('foo');
        facade.valueX = 'bar'; // only local value will be changed
        expect(facade.getValueX()).to.be.equal('foo');
        expect(facade.start({foo: 'bar'})).to.be.eql(imp);
        expect(facade.stop({foo: 'baz'})).to.be.eql(imp);
        expect(spy.firstCall.args).to.be.eql(['start', [{foo: 'bar'}]]);
        expect(spy.secondCall.args).to.be.eql(['stop', [{foo: 'baz'}]]);
        expect(facade.facade.__facade__).to.be.true;
        expect(facade.methodX()).equals(42);
        expect(facade.hidden).to.be.undefined;
        expect(facade.complexObject.answer()).equals(42);
        expect(facade.complexObject.getHardenedInstance).to.be.undefined;
        expect(facade.methodZ()).to.be.eql(42);

        expect(function () {
          new Facade({array: 'should fail'}, imp)
        }).to.throw(Error);
        expect(function () {
          new Facade({object: 'should fail'}, imp)
        }).to.throw(Error);
        expect(function () {
          new Facade({objectx: 'should fail'}, imp)
        }).to.throw(Error);

      });

    });
  };

  sinon.test(test)();
});
