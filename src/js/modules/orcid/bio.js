
define([
  'underscore',
  'jsonpath',
  'js/modules/orcid/work'
], function (_, jp, Work) {
  var PATHS = {
    firstName: '$.name["given-names"].value',
    lastName: '$.name["family-name"].value',
    orcid: '$.name.path'
  };

  var Bio = function Bio(bio) {
    this._root = bio || {};

    this.get = function (path) {
      var val = jp.query(this._root, path);
      return val[0];
    };

    this.toADSFormat = function () {
      return {
        responseHeader: {
          params: {
            orcid: this.getOrcid(),
            firstName: this.getFirstName(),
            lastName: this.getLastName()
          }
        }
      };
    };

    // generate getters for each path on PATHS
    _.reduce(PATHS, function (obj, p, k) {
      if (_.isString(k) && k.slice) {
        var prop = k[0].toUpperCase() + k.slice(1);
        obj['get' + prop] = _.partial(obj.get, p);
      }
      return obj;
    }, this);

  };
  return Bio;
});