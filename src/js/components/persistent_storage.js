define(['lodash/dist/lodash.compat', 'js/components/generic_module', 'js/mixins/dependon', 'lockr'], function(
  _,
  GenericModule,
  Mixins,
  Lockr
) {
  var LocalStorage = GenericModule.extend({
    constructor: function(opts) {
      opts = opts || {};
      this._store = this.createStore(opts || '');
    },

    createStore: function(name) {
      return this._createStore(name);
    },

    _createStore: function(name) {
      Lockr.setPrefix(`bumblebee_${name}_`);
      var keys = Lockr.get('#keys');
      if (!keys) {
        Lockr.set('#keys', '{}');
      } else {
        try {
          keys = JSON.parse(keys);
          if (!_.isObject(keys)) {
            Lockr.set('#keys', '{}');
          }
        } catch (e) {
          Lockr.set('#keys', '{}');
        }
      }
      return Lockr;
    },

    set: function(key, value) {
      this._checkKey(key);
      if (!_.isString(value)) {
        value = JSON.stringify(value);
      }
      this._store.set(key, value);
      this._setKey(key);
    },

    get: function(key) {
      this._checkKey(key);
      var v = this._store.get(key);
      if (!v) return v;
      try {
        return JSON.parse(v);
      } catch (e) {
        return v;
      }
    },

    remove: function(key) {
      this._checkKey(key);
      this._store.rm(key);
      this._delKey(key);
    },

    clear: function() {
      const keys = this.get('#keys');
      keys.forEach((key) => this._store.rm(key));
      this._store.set('#keys', '{}');
    },

    keys: function() {
      return JSON.parse(this._store.get('#keys'));
    },

    _setKey: function(key) {
      var keys = this.keys() || {};
      keys[key] = 1;
      this._store.set('#keys', JSON.stringify(keys));
    },

    _delKey: function(key) {
      var keys = this.keys() || {};
      delete keys[key];
      this._store.set('#keys', JSON.stringify(keys));
    },

    _checkKey: function(key) {
      if (!_.isString(key)) {
        throw new Error('key must be string, received: ' + key);
      }
    },
  });

  _.extend(LocalStorage.prototype, Mixins.BeeHive);

  return LocalStorage;
});
