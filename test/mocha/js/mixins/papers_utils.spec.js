define(['js/mixins/papers_utils'], function(Utils) {
  describe('Papers Utils Mixin (mixins/papers_utils.spec.js)', function() {
    it('returns formatted date with complete input', () => {
      const dateString = '2023-05-22';
      const format = 'YYYY/MM/DD';

      const result = Utils.formatDate(dateString, { format });

      expect(result).to.equal('2023/05/22');
    });

    it('returns formatted date with missing month', () => {
      const dateString = '2023-00-22';
      const missing = { month: 'YYYY', day: 'YYYY/MM' };

      const result = Utils.formatDate(dateString, { missing });

      expect(result).to.equal('2023');
    });

    it('returns formatted date with missing day', () => {
      const dateString = '2023-05-00';
      const missing = { day: 'YYYY/MM', month: 'YYYY' };

      const result = Utils.formatDate(dateString, { missing });

      expect(result).to.equal('2023/05');
    });

    it('returns formatted date with missing month and day', () => {
      const dateString = '2023-00-00';
      const missing = { dayAndMonth: 'YYYY' };

      const result = Utils.formatDate(dateString, { missing });

      expect(result).to.equal('2023');
    });

    it('returns year if parsed date is invalid', () => {
      const dateString = '2023-13-45';
      const format = 'YYYY/MM';

      const result = Utils.formatDate(dateString, { format });

      expect(result).to.equal('2023');
    });

    it('returns null if input does not match regex', () => {
      const dateString = 'invalid-date';

      const result = Utils.formatDate(dateString);

      expect(result).to.equal(null);
    });
  });
});
