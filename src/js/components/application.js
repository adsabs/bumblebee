/**
 * Application object contains methods for asynochronous loading of other modules
 * It will load BeeHive by default, and it recognizes the following types of
 * objects
 *
 *  core:
 *    modules - any module you want to load and give it access to the full
 *              BeeHive (these guys are loaded first)
 *    services - these instances will be inserted into Beehive.Services
 *              (loaded after modules)
 *    objects - these will be inserted into BeeHive.Objects
 *              (loaded after services)
 *
 *  plugins - any object you want to instantiate
 *  widgets - any visual object you want to instantiate
 *
 *
 *  this is the normal workflow
 *
 *  var app = new Application();
 *  var promise = app.loadModules({
 *       core: {
 *         services: {
 *           PubSub: 'js/services/pubsub',
 *           Api: 'js/services/api'
 *         },
 *         modules: {
 *           QueryMediator: 'js/components/query_mediator'
 *         }
 *       },
 *       widgets: {
 *         YearFacet: 'js/widgets/facets/factory'
 *       }
 *     });
 *   promise.done(function() {
 *     app.activate();
 *     //....continue setting up layout etc
 *   });
 *
 *
 */

define([
  'underscore',
  'jquery',
  'backbone',
  'module',
  'js/components/beehive',
  'js/mixins/api_access'
], function(
  _,
  $,
  Backbone,
  module,
  BeeHive,
  ApiAccess
  ) {


  var Application = function(options) {
    options || (options = {});
    this.aid = _.uniqueId('application');
    this.debug = true;
    _.extend(this, _.pick(options, ['timeout', 'debug']));
    this.initialize.apply(this, arguments);
  };

  var Container = function() {
    this.container = {};
  };
  _.extend(Container.prototype, {
    has: function(name) {
      return this.container.hasOwnProperty(name);
    },
    get: function(name) {
      return this.container[name];
    },
    remove: function(name) {
      delete this.container[name];
    },
    add: function(name, obj) {
      this.container[name] = obj;
    }
  });

  _.extend(Application.prototype, {

    initialize: function(config, options) {
      // these are core (elevated access)
      this.__beehive = new BeeHive();
      this.__modules = new Container();
      this.__controllers = new Container();

      // these are barbarians behind the gates
      this.__widgets = new Container();
      this.__plugins = new Container();
      this.__barbarianRegistry = {};
      this.__barbarianInstances = {};
    },

    /*
     * code that accounts for browser deficiencies
     */

    shim : function(){

      if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
      }
    },

    /**
     * Purpose of this call is to load dynamically all modules
     * that you pass in a configuration. We'll load them using
     * requirejs and set them into BeeHive
     *
     * This method returns 'Deferred' object, which tells you
     * whether initialization has finished. You *have to* use it
     * in the following way;
     *
     * app = new Application();
     * defer = app.loadModules(config, options);
     * defer.done(function() {
     *    // .... do something with the application
     * })
     *
     * @param config
     * @param options
     */
    loadModules: function(config, options) {

      var promises = [];
      var self = this;
      var promise;

      var core = config['core'];
      if (core) {
        _.each(['controllers', 'modules', 'services', 'objects'], function(name) {
          if (core[name]) {
            promise = self._loadModules(name, core[name]);
            if (promise)
              promises.push(promise);
          }
        });
      }

      var plugins = config['plugins'];
      if (plugins) {
        promise = self._loadModules("plugins", plugins);
        if (promise)
          promises.push(promise);
      }

      var widgets = config['widgets'];
      if (widgets) {
        promise = self._loadModules("widgets", widgets);
        if (promise)
          promises.push(promise);
      }

      if (promises.length == 1) {
        promises.push(promise); // hack, so that $.when() always returns []
      }

      var bigPromise = $.when.apply($, promises)
        .then(function () {
          _.each(arguments, function (promisedValues, idx) {
            if (_.isArray(promisedValues)) {
              if (self.debug) {
                console.log('application: registering ' + promisedValues[0]);
              }
              self._registerLoadedModules.apply(self, promisedValues);
            }
          })
        })
        .fail(function () {
          console.error("Generic error - we were not successul in loading all modules for config", config);
          if (arguments.length)
            console.error(arguments);
          //throw new Error("We are screwed!"); do not throw errors because then .fail() callbacks cannot be used
        });
      //.done(function() {
      //  console.log('DONE loading', this, config);
      //});

      return bigPromise;
    },

    getBeeHive: function() {
      return this.__beehive;
    },


    _registerLoadedModules: function(section, modules) {
      var beehive = this.getBeeHive();
      var key, module;
      var hasKey, addKey, removeKey, createInstance;
      var self = this;

      createInstance = function(key, module) {
        if (!module) {
          console.warn('Object ' + key + ' is empty, cannot instantiate it!');
          return;
        }
        if (self.debug) {
          console.log("Creating instance of: " + key);
        }
        if (module.prototype) {
          return new module()
        }
        if (module && module.hasOwnProperty(key)) {
          return module[key];
        }
        return module;
      };

      //console.log('registering', section, modules);

      if (section == "controllers") {
        hasKey = _.bind(this.hasController, this);
        removeKey = _.bind(function(key) {this.__controllers.remove(key)}, this);
        addKey = _.bind(function(key, module) {this.__controllers.add(key, module)}, this);
      }
      else if (section == "services") {
        hasKey = _.bind(beehive.hasService, beehive);
        removeKey = _.bind(beehive.removeService, beehive);
        addKey = _.bind(beehive.addService, beehive);
      }
      else if (section == 'objects') {
        hasKey = _.bind(beehive.hasObject, beehive);
        removeKey = _.bind(beehive.removeObject, beehive);
        addKey = _.bind(beehive.addObject, beehive);
      }
      else if (section == 'modules') {
        createInstance = function(key, module) {return module};
        hasKey = _.bind(this.hasModule, this);
        removeKey = _.bind(function(key) {this.__modules.remove(key)}, this);
        addKey = _.bind(function(key, module) {this.__modules.add(key, module)}, this);
      }
      else if (section == 'widgets') {
        hasKey = _.bind(this.hasWidget, this);
        removeKey = _.bind(function(key) {this.__widgets.remove(key)}, this);
        addKey = _.bind(function(key, module) {this.__widgets.add(key, module)}, this);
        createInstance = function(key, module) {return module};
      }
      else if (section == 'plugins') {
        hasKey = _.bind(this.hasPlugin, this);
        removeKey = _.bind(function(key) {this.__plugins.remove(key)}, this);
        addKey = _.bind(function(key, module) {this.__plugins.add(key, module)}, this);
        createInstance = function(key, module) {return module};
      }
      else {
        throw new Error("Unknown section: " + section);
      }

      _.each(_.pairs(modules), function(m) {
        key = m[0], module = m[1];
        if (hasKey(key)) {
          console.warn("Removing (existing) object into [" + section + "]: " + key);
          removeKey(key);
        }
        var inst = createInstance(key, module);
        if (!inst) {
          console.warn('Removing ' + key + '(because it is null!)');
          return;
        }
        addKey(key, inst);
      })
    },

    _checkPrescription: function(modulePrescription) {
      // basic checking
      _.each(_.pairs(modulePrescription), function(module, idx, list) {
        var symbolicName = module[0];
        var impl = module[1];

        if (!_.isString(symbolicName) || !_.isString(impl))
          throw new Error("You are kidding me, the key/implementation must be string values");

      });
    },

    /**
     * Loads modules *asynchronously* from the following structure
     *
     * {
     *  'Api': 'js/services/api',
     *  'PubSub': 'js/services/pubsub'
     * },
     *
     * Returns Deferred - once that deferred object is resolved
     * all modules have been loaded.
     *
     * @param modulePrescription
     * @private
     */
    _loadModules: function(sectionName, modulePrescription, ignoreErrors) {

      var self = this;
      this._checkPrescription(modulePrescription);

      if (this.debug) {
        console.log('application: loading ' + sectionName, modulePrescription);
      }

      var ret = {};

      // create the promise object - load the modules asynchronously
      var implNames = _.keys(modulePrescription);
      var impls = _.values(modulePrescription);
      var defer = $.Deferred();

      var callback = function () {
        console.timeEnd("startLoading"+sectionName)
        var modules = arguments;
        _.each(implNames, function (name, idx, implList) {
          ret[name] = modules[idx];
        });
        defer.resolve(sectionName, ret);
        if (self.debug) {
          console.log('Loaded: type=' + sectionName + ' state=' + defer.state(), ret);
        }
      };

      var errback = function (err) {
        var symbolicName = err.requireModules && err.requireModules[0];
        console.warn("Error loading impl=" + symbolicName, err.requireMap);
        if (ignoreErrors) {
          console.warn("Ignoring error");
          return;
        }
        defer.reject(err);
      };

      console.time("startLoading"+sectionName)

      // start loading the modules
      //console.log('loading', implNames, impls)
      require(impls, callback, errback);

      return this._setTimeout(defer).promise();
    },


    _setTimeout: function(deferred) {
      setTimeout(function () {
        if (deferred.state() != 'resolved') {
          deferred.reject('Timeout, application is loading too long');
        }
      }, this.timeout || 30000);
      return deferred;
    },


    destroy : function() {
      this.getBeeHive().destroy();
    },


    activate: function(options) {
      var beehive = this.getBeeHive();
      var self = this;

      // services are activated by beehive itself
      if (self.debug) {console.log('application: beehive.activate()')};
      beehive.activate(beehive);

      // controllers receive application itself and elevated beehive object
      // all of them must succeed; we don't catch errors
      _.each(this.getAllControllers(), function(el) {
        if (self.debug) {console.log('application: controllers: ' + el[0] + '.activate(beehive, app)')};
        var plugin = el[1];
        if ('activate' in plugin) {
          plugin.activate(beehive, self);
        }
      });

      // modules receive elevated beehive object
      _.each(this.getAllModules(), function(el) {
        try {
          if (self.debug) {
            console.log('application: modules: ' + el[0] + '.activate(beehive)');
          }
          var plugin = el[1];
          if ('activate' in plugin) {
            plugin.activate(beehive);
          }
        }
        catch (e) {
          console.error('Error activating:' +el[0]);
          console.error(e);
        }
      });

      this.__activated = true;
    },



    isActivated: function() {
      return this.__activated || false;
    },

    hasService: function(name) {
      return this.getBeeHive().hasService(name);
    },
    getService: function(name) {
      return this.getBeeHive().getService(name);
    },

    hasObject: function(name) {
      return this.getBeeHive().hasObject(name);
    },
    getObject: function(name) {
      return this.getBeeHive().getObject(name);
    },

    hasController: function(name) {
      return this.__controllers.has(name);
    },

    getController: function(name) {
      return this.__controllers.get(name);
    },

    hasModule: function(name) {
      return this.__modules.has(name);
    },

    getModule: function(name) {
      return this.__modules.get(name);
    },

    hasWidget: function(name) {
      return this.__widgets.has(name);
    },

    getWidgetRefCount: function(name, prefix) {
      var ds = this.__barbarianInstances[(prefix || 'widget:') + name];
      if (ds) {
        return ds.counter;
      }
      else {
        return -1;
      }
    },

    getWidget: function(name) {
      var defer = $.Deferred();
      var self = this;

      var w = {};
      if (arguments.length > 1) {
        w = {};
        _.each(arguments, function(x) {
          if (!x) return;
          try {
            w[x] = self._getWidget(x);
          }
          catch (er) {
            console.error('Error loading: ' + x);
            _.each(w, function(val, key) {
              self.returnWidget(key);
              delete w[key];
            });
            throw er;
          }
        })
      }
      else if (name) {
        w = this._getWidget(name);
      }

      // this happens right after the callback
      setTimeout(function() {
        defer.done(function(widget) {
          if (_.isArray(name)) {
            _.each(name, function(x) {
              self.returnWidget(x);
            })
          }
          else {
            self.returnWidget(name);
          }
        });
      }, 1);

      defer.resolve(w);
      return defer.promise();
    },

    _getWidget: function(name) {
      var w = this._getOrCreateBarbarian('widget', name);
      this.__barbarianInstances['widget:' + name].counter++;
      return w;
    },

    returnWidget: function(name) {
      var ds = this.__barbarianInstances['widget:' + name];
      if (ds) {
        ds.counter--;
        this._killBarbarian('widget:' + name);
        return ds.counter;
      }
      return -1;
    },

    hasPlugin: function(name) {
      return this.__plugins.has(name);
    },

    /**
     * Increase the plugin counter and return the instance
     * (already activated, with proper beehive in place)
     *
     * @param name
     * @return {*}
     */
    getPlugin: function(name) {
      var defer = $.Deferred();
      var self = this;

      var w = {};
      if (arguments.length > 1) {
        w = {};
        _.each(arguments, function(x) {
          if (!x) return;
          try {
            w[x] = self._getPlugin(x);
          }
          catch (er) {
            console.error('Error loading: ' + x);
            _.each(w, function(val, key) {
              self.returnPlugin(key);
              delete w[key];
            });
            throw er;
          }
        })
      }
      else if (name) {
        w = this._getPlugin(name);
      }

      setTimeout(function() {
        defer.done(function(widget) {
          if (_.isArray(name)) {
            _.each(name, function(x) {
              self.returnPlugin(x);
            })
          }
          else {
            self.returnPlugin(name);
          }
        });
      }, 1);

      defer.resolve(w);
      return defer.promise();
    },

    getPluginRefCount: function(name) {
      return this.getWidgetRefCount(name, 'plugin:');
    },

    _getPlugin: function(name) {
      var w = this._getOrCreateBarbarian('plugin', name);
      this.__barbarianInstances['plugin:' + name].counter++;
      return w;
    },

    /**
     * Decrease the instance counter; when we reach zero
     * the plugin will be destroyed automatically
     *
     * @param name
     */
    returnPlugin: function(name) {
      var ds = this.__barbarianInstances['plugin:' + name];
      if (ds) {
        ds.counter--;
        this._killBarbarian('plugin:' + name);
        return ds.counter;
      }
      return -1;
    },

    /**
     * Given the pubsub key, it finds the name of the widget
     * (provided the widget is registered with the application)
     * Returns undefined for other components, such as controllers
     * objects etc (it searches only plugins and widgets)
     *
     * @param psk
     * @returns {*}
     */
    getPluginOrWidgetName: function(psk) {
      if (!_.isString(psk))
        throw Error('The psk argument must be a string');
      var k;
      if (this.__barbarianRegistry[psk]) {
        k = this.__barbarianRegistry[psk];
      }
      else {
        return undefined;
      }
      return k;
    },


    getPluginOrWidgetByPubSubKey: function(psk) {
      var k = this.getPluginOrWidgetName(psk);
      if (k === undefined) return undefined;

      if (this._isBarbarianAlive(k))
        return this._getBarbarian(k);

      throw new Error('Eeeek, thisis unexpectEED bEhAvjor! Cant find barbarian with ID: ' + psk);
    },

    getPskOfPluginOrWidget: function(symbolicName) {
      var parts = symbolicName.split(':');
      var psk;
      if (this._isBarbarianAlive(symbolicName)) {
        var b = this._getBarbarian(symbolicName);
        if (b.getPubSub && b.getPubSub().getCurrentPubSubKey)
          return b.getPubSub().getCurrentPubSubKey().getId();
      }
      return psk;
    },

    /**
     * I think the analogy is getting over-stretched; it is true that the author of this application
     * loves history, and you could find many analogies...but let me hope that I would never treat
     * humans in the same way I name variable names and methods :_)
     *
     * @param category
     * @param name
     * @private
     */
    _getOrCreateBarbarian: function(cat, name) {

      var symbolicName = cat + ':' + name;

      if ((cat == 'plugin' && !this.hasPlugin(name)) || (cat == 'widget' && !this.hasWidget(name))) {
        throw new Error('We cannot give you ' + symbolicName + ' (cause there is no constructor for it)');
      }

      if (this._isBarbarianAlive(symbolicName))
        return this._getBarbarian(symbolicName);

      var constructor = (cat == 'plugin') ? this.__plugins.get(name) : this.__widgets.get(name);
      var instance = new constructor();
      var hardenedBee = this.getBeeHive().getHardenedInstance(), children;


      // we'll monitor all new pubsub instances (created by the widget) - we don't want to rely
      // on widgets to do the right thing (and tells us what children they made)

      var pubsub = this.getService('PubSub');
      var existingSubscribers = _.keys(pubsub._issuedKeys);

      if ('activate' in instance) {
        if (this.debug) {console.log('application: ' + symbolicName + '.activate(beehive)')}
        children = instance.activate(hardenedBee);
      }

      var newSubscribers = _.without(_.keys(pubsub._issuedKeys), _.keys(pubsub._issuedKeys));
      this._registerBarbarian(symbolicName, instance, children, hardenedBee, newSubscribers);
      return instance;
    },

    _isBarbarianAlive: function(symbolicName) {
      return !!this.__barbarianInstances[symbolicName];
    },

    _getBarbarian: function(symbolicName) {
      return this.__barbarianInstances[symbolicName].parent;
    },

    _registerBarbarian: function(symbolicName, instance, children, hardenedBee, illegitimateChildren) {
      this._killBarbarian(symbolicName);

      if ('getBeeHive' in instance) {
        this.__barbarianRegistry[instance.getBeeHive().getService('PubSub').getCurrentPubSubKey().getId()] = symbolicName;
      }
      else {
        this.__barbarianRegistry[hardenedBee.getService('PubSub').getCurrentPubSubKey().getId()] = symbolicName;
      }

      var childNames = [];
      if (children) {
        childNames = this._registerBarbarianChildren(symbolicName, children);
      }

      if (illegitimateChildren){
        _.each(illegitimateChildren, function(childKey) {
          if(this.__barbarianRegistry[childKey]) // already declared
            delete illegitimateChildren[childKey]
        }, this)
      }

      this.__barbarianInstances[symbolicName] = {
        parent: instance,
        children: childNames,
        beehive: hardenedBee,
        counter: 0,
        psk: hardenedBee.getService('PubSub').getCurrentPubSubKey(),
        bastards: illegitimateChildren // no, i'm not mean, i'm French
      }
    },

    /**
     *
     * @param prefix
     *  (String) the name of the father
     * @param children
     *  (Object) where keys are the 'strings' (names) and values are
     *  instances (of the widgets)
     * @return {Array}
     * @private
     */
    _registerBarbarianChildren: function(prefix, children) {
      var childrenNames = [];
      _.each(children, function(child, key) {
        var name = prefix + '-' + (child.name || key);
        if (this.debug)
          console.log('adding child object to registry: ' + name);


        if (this._isBarbarianAlive(name)) {
          throw new Error('Contract breach, there already exists instance with a name: ' + name);
        }

        if (('getBeeHive' in child)) {
          var childPubKey = child.getBeeHive().getService('PubSub').getCurrentPubSubKey().getId();

          if (this.__barbarianRegistry[childPubKey])
            throw new Error('Contract breach, the child of ' + prefix + 'is using the same pub-sub-key');

          this.__barbarianRegistry[childPubKey] = name;
        }

        childrenNames.unshift(name);
      }, this);
      return childrenNames;
    },


    /**
     * Remove/destroy the instance - but only if the counter reaches zero (or if the
     * force parameter is true) - that means that the children are exterminated together
     * with their parents. this is to avoid polluting the memory, because every child
     * has a name of the parent. So if the parent is not used by anyone, then the
     * counter is zero
     *
     * @param symbolicName
     * @param force
     * @private
     */
    _killBarbarian: function(symbolicName, force) {
      var b = this.__barbarianInstances[symbolicName];

      if (!b) return;

      if (b.counter > 0 && force !== true) // keep it alive, it is referenced somewhere else
        return;

      if (b.children) {
        _.each(b.children, function(childName) {
          this._killBarbarian(childName, true);
        }, this)
      }

      _.each(this.__barbarianRegistry, function(value, key) {
        if (value == symbolicName)
          delete this.__barbarianRegistry[key];
      }, this);

      // unsubscribe this widget from pubsub (don't rely on the widget
      // doing the right thing)
      var pubsub = this.getService('PubSub');
      if (b.psk) {
        pubsub.unsubscribe(b.psk);
      }

      // painstaikingly discover undeclared children and unsubscribe them
      if (b.bastards && false) { // deactivate, it causes problems
        var kmap = {};
        _.each(b.bastards, function(psk) {
          kmap[psk] = 1;
        }, this);

        _.each(pubsub._events, function(val, evName) {
          _.each(val, function(v) {
            if (v.ctx.getId && kmap[v.ctx.getId()]) {
              pubsub.unsubscribe(v.ctx);
            }
          }, this);
        }, this);
      }

      b.parent.destroy();

      delete this.__barbarianInstances[symbolicName];
      if ('setBeeHive' in b.parent)
        b.parent.setBeeHive({fake: 'one'});

      delete b;

      if (this.debug)
        console.log('Destroyed: ' + symbolicName);
    },


    getAllControllers: function() {
      return _.pairs(this.__controllers.container);
    },

    getAllModules: function() {
      return _.pairs(this.__modules.container);
    },

    getAllPlugins: function(key) {
      key = key || 'plugin:';
      var defer = $.Deferred();
      var w = [];
      _.each(this.__barbarianInstances, function(val, k) {
        if (k.indexOf(key) > -1)
          w.unshift(k.replace(key, ''));
      });

      var getter = key.indexOf('plugin:') > -1 ? this.getPlugin : this.getWidget;
      getter.apply(this, w).
        done(function(widget) {
          var out = [];
          if (w.length > 1) {
            out = _.pairs(widget);
          }
          else if (w.length == 1) {
            out = [[w[0], widget]];
          }
          defer.resolve(out);
        });
      return defer.promise();
    },

    getAllWidgets: function() {
      return this.getAllPlugins('widget:');
    },

    getAllServices: function() {
      return this.getBeeHive().getAllServices();
    },

    getAllObjects: function() {
      return this.getBeeHive().getAllObjects();
    },


    /**
     * Helper method to invoke a 'function' on all objects
     * that are inside the application
     *
     * @param funcName
     * @param options
     */
    triggerMethodOnAll: function(funcName, options) {
      this.triggerMethod(this.getAllControllers(), 'controllers', funcName, options);
      this.triggerMethod(this.getAllModules(), 'modules', funcName, options);
      var self = this;
      this.getAllPlugins().done(function(plugins) {
        if (plugins.length)
          self.triggerMethod(plugins, 'plugins', funcName, options);
      });
      this.getAllWidgets().done(function(widgets) {
        if (widgets.length)
          self.triggerMethod(widgets, 'widgets', funcName, options);
      });
      this.triggerMethod(this.getBeeHive().getAllServices(), 'BeeHive:services', funcName, options);
      this.triggerMethod(this.getBeeHive().getAllObjects(), 'BeeHive:objects', funcName, options);
    },

    triggerMethod: function(objects, msg, funcName, options) {
      var self = this;
      var rets = _.map(objects, function(el) {
        var obj = el[1];
        if (funcName in obj) {
          if (self.debug) {console.log('application.triggerMethod: ' + msg + ": " + el[0] + '.' + funcName + '()')};
          obj[funcName].call(obj, options);
        }
        else if (_.isFunction(funcName)) {
          if (self.debug) {console.log('application.triggerMethod: ' + msg + ": " + el[0] + ' customCallback()')};
          funcName.call(obj, msg + ":" + el[0], options);
        }
      });
      return rets;
    }
  });


  // give it subclassing functionality
  Application.extend = Backbone.Model.extend;
  return Application.extend(ApiAccess);

});
