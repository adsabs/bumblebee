define([
  'underscore'
], function (_) {

  const qs = function (key, str, separator) {
    const k = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var pattern = '(^|[\\?&])' + k + '=[^&]*';
    var match = (str || location.hash).match(new RegExp(pattern, 'g'));
    if (!match) {
      return null;
    } else {
      var clean = []
      // remove 'key=' from string, combine with optional separator and unquote spaces
      for (var i = 0 ; i < match.length ; i++) {
        clean.push(match[i].replace(new RegExp('(^|[\\?&])' +  k + '='), ''));
      }
      msg = clean.join(separator);  // works even if separator is undefined
      return decodeURIComponent(msg.replace(/\+/g, " "));
    }
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
