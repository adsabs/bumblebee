/*
Example module that simply prints 'hello x'
as a main page
*/

define(['lodash/dist/lodash.compat', 'jquery'], function(_, $) {
  var showName = function(selector, n) {
    console.log(selector);
    console.log(n);
    var temp = _.template('Hello <%= name %>');
    $(selector).html(temp({ name: n }));
  };
  return {
    showName: showName,
  };
});
