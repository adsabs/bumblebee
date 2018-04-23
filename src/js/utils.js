define([
  'underscore'
], function (_) {

  const qs = function (key, str) {
    const k = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = (str || location.hash).match(new RegExp("&?"+ k +"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  };

  const updateHash = function (key, value, hash) {
    const k = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&");
    const h = _.isString(hash) ? hash : location.hash;
    const match = h.match(new RegExp("&?"+ k +"=([^&]+)(&|$)"));
    if (match) {
      const mat = match[0].replace(match[1], value);
      return h.replace(match[0], mat);
    }
    return hash;
  };

  return {
    qs: qs,
    updateHash: updateHash
  };
});
