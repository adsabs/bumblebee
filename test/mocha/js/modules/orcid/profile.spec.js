define([
  'underscore',
  'js/modules/orcid/profile'
], function (_, Profile) {

  var test = function () {
    describe('Orcid Profile', function () {

      describe('constructor', function () {
        it('instantiates correctly', function () {
          expect(new Profile() instanceof Profile).to.equal(true);
        });
      });

    });
  };

  sinon.test(test)();
});
