define([], function () {
  var f = {};

  /*
  * takes a number or string, returns a string
  * */

  f.formatNum = function (num) {
    var withCommas = [];
    num += '';
    var parts = num.split('.');
    var extra = '';
    if (parts.length === 2) {
      num = parts[0];
      extra = '.' + parts[1];
    }
    if (num.length < 4) {
      return num + extra;
    }
    num = num.split('').reverse();
    _.each(num, function (n, i) {
      withCommas.unshift(n);
      if ((i + 1) % 3 === 0 && i !== num.length - 1) {
        withCommas.unshift(',');
      }
    });

    return withCommas.join('') + extra;
  };


  return f;
});
