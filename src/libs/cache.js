(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dsjslib = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
(function () {
    "use strict";
    /**
     * @class Cache
     * @classdesc In-Memory LRU Cache. For feature overview see
     * [wiki](https://github.com/monmohan/dsjslib/wiki/LRU-Cache-Feature-and-usage-overview)
     * @param cachespec {Object} See wiki for details
     */
    function Cache(cachespec) {
        var that = this;

        function configure(inSpec) {
            var maxWeight = inSpec.maximumWeight,
                weighFn = inSpec.weigherFunction,
                maxSize = inSpec.maximumSize,
                isMaxW = typeof maxWeight === 'number' && maxWeight > -1,
                isWFn = typeof weighFn === 'function';

            if ((!isMaxW && isWFn) || (isMaxW && !isWFn)) {
                throw new Error("Maximum weight or weight function has illegal values");
            }
            if (isMaxW && isWFn && typeof maxSize === 'number' && maxSize > -1) {
                throw new Error('Both max weight and size can\'t be configured');
            }

            that._spec = {
                'loaderFn' : (typeof inSpec.loaderFunction === 'function') && inSpec.loaderFunction,
                'expiresAfterWrite'/*miliseconds*/ : (typeof inSpec.expiresAfterWrite === 'number') ? inSpec.expiresAfterWrite * 1000 :
                    null,
                'recordStats' : inSpec.recordStats,
                'maxSize' : maxSize,
                'maxWeight' : maxWeight,
                'weighFn' : weighFn,
                "onRemove" : typeof inSpec.onRemove === 'function' && inSpec.onRemove //listener for entry removal
            };
        }

        configure(cachespec);
        _init.apply(this);

    }

    Cache.prototype._REMOVAL_CAUSE_I = 'explicit';
    Cache.prototype._REMOVAL_CAUSE_C = 'capacity';
    Cache.prototype._REMOVAL_CAUSE_E = 'expired';



    var _init = function () {
        this._accessQueue = new Queue('A');
        this._writeQueue = this._spec.expiresAfterWrite ? (new Queue('W')) : null;
        var accessCleanup = cleanupQ(this._REMOVAL_CAUSE_C, this._canReap, this._accessQueue, this),
            writeCleanup = cleanupQ(this._REMOVAL_CAUSE_E, this.isExpired, this._writeQueue, this);

        this._cleanup = function (condition) {
            accessCleanup(condition);
            writeCleanup(this._writeQueue);

        };
        this.size = 0;
        this.weight = 0;
        this._cache = Object.create(null);
        Object.defineProperty(this, 'stats', {
            value : {'hitCount' : 0, 'missCount' : 0, 'requestCount' : 0},
            configurable : true});

        function cleanupQ(cause, cleanupFn, queue, cache) {
            if (queue) {
                return (function (prefnarg) {
                    if (prefnarg) {
                        var lruEntry = queue.tail.prev(queue),
                            next = null;

                        while (lruEntry && cleanupFn.apply(cache, [lruEntry])) {
                            if (lruEntry) {
                                next = lruEntry.prev(queue);
                                cache._rmEntry(lruEntry, cause);
                                lruEntry = next;
                            }
                        }
                    }

                }).bind(queue);
            } else {
                return function () {
                };
            }

        }


    };

    function Queue(type) {
        this.tail = this.head = Object.create(Entry.prototype);
        this.type = type;
    }

    function Entry(key, value, loading, onLoadCb) {
        this.key = key;
        this.loading = loading;
        if (!loading) {
            this.setValue(value);
        }
        this.onLoad = onLoadCb ? [onLoadCb] : [];
        this.writeTime = Date.now();
    }

    Entry.prototype.setValue = function (v) {
        //we can allow falsey values except undefined and null
        if (v === undefined || v === null) {
            throw new Error('Illegal value for key ' + v);
        }
        this.value = v;
        this.writeTime = Date.now();

    };

    Entry.prototype.moveToHead = function (queues) {
        var entry = this;
        queues.forEach(function (queue) {
            if (queue) {
                var head = queue.head;
                entry.next(queue, head);
                head.prev(queue, entry);
                queue.head = entry;
            }
        });

    };

    Entry.prototype.next = function (queue, e) {
        var next = 'next' + queue.type;
        if (typeof e !== 'undefined') {
            this[next] = e;
        }
        return this[next];
    };

    Entry.prototype.prev = function (queue, e) {
        var prev = 'prev' + queue.type;
        if (typeof e !== 'undefined') {
            this[prev] = e;
        }
        return this[prev];
    };


    Entry.prototype.remove = function (queue) {
        if (queue) {
            var ePrev = this.prev(queue),
                eNext = this.next(queue);
            if (ePrev) {
                ePrev.next(queue, eNext);
                eNext.prev(queue, ePrev);
            } else/*removing head*/{
                eNext.prev(queue, null);
                queue.head = eNext;
            }
            if (!eNext.next(queue)) {
                //move tail
                queue.tail = eNext;
            }
            this.next(queue, null);
            this.prev(queue, null);
        }

    };

    Entry.prototype.promote = function () {
        var entry = this;
        var queues = Array.prototype.slice.call(arguments);
        queues.forEach(function (queue) {
            if (queue && entry.prev(queue)/*is not head entry already*/) {
                entry.remove(queue);
                entry.moveToHead([queue]);
            }
        });
    };


    Entry.prototype.forEach = function (traversalFn, queue) {
        var entry = this;
        while (entry) {
            traversalFn.call(this, entry);
            entry = entry.next(queue);
        }
    };

    /**
     * @memberOf  Cache.prototype
     * @param key {*} Although using other than String or Number may not be meaningful since underlying object
     * used as backing cache will do a toString() on the key
     * @param value {*} Null and undefined are not allowed
     */
    Cache.prototype.put = function (key, value) {
        var exists = this._cache[key];
        if (!exists) {
            this._createEntry(key, value);
        } else {
            exists.setValue(value);
            exists.writeTime = Date.now();
            exists.promote(this._accessQueue, this._writeQueue);
            this._cleanup(false);
        }


    };

    Cache.prototype._createEntry = function (key, value, loading, calback) {
        var entry = new Entry(key, value, loading, calback);
        this._cleanup(true);
        this._cache[key] = entry;
        this._updateCacheSize(entry, true);
        entry.moveToHead([this._accessQueue, this._writeQueue]);
        return entry;
    };


    Cache.prototype.isExpired = function (entry) {
        var exp = this._spec.expiresAfterWrite,
            now = Date.now();
        return !entry.loading &&
            (exp && exp > 0) &&
            ((now - entry.writeTime) > exp);

    };


    Cache.prototype._updateCacheSize = function (entry, incr) {
        var w, s;
        if (this._spec.maxWeight) {
            w = this._spec.weighFn.apply(this, [entry.key, entry.value]);
            this.weight += incr ? w : -w;
        }
        this.size += incr ? 1 : -1;

    };

    /**
     * Get value for key, NOTE: ** This is ASYNCHRONOUS and result is available from callback function**
     * Automatically load the value if not present and an auto loader function is configured.
     * Callback is called with two arguments (error,result) . Error contains any error reported by auto loader,
     * or any error while creating the entry in cache, otherwise its null. Result contains the result
     * from the cache, which in turn may have been received from the autoloader, if the entry had expired
     * or was not present. If no autoloader is configured or the entry was present in cache, the callback is called
     * with the result in cache. In conformance to async laws, the callback is still asynchronous and
     * not called immediately. For synchronous get, see {@link Cache#getSync}
     * @memberOf Cache.prototype
     * @param key {String}
     * @param callback {Function}
     */
    Cache.prototype.get = function (key, callback) {
        callback = callback || function () {
        };
        this.stats.requestCount++;
        var cache = this;
        process.nextTick(function () {
            _asyncGet.call(cache, key, callback);
        });

    };

    var _asyncLoad = function (cache, onLoad, key) {
        var loaderFn = cache._spec.loaderFn,
            err;
        if (loaderFn) {
            loaderFn.apply(null, [key, function (error, result) {
                onLoad(cache, error, result);

            }]);

        }
    };

    var _onLoad = function (cache, err, result) {
        if (!err) {
            try {
                this.setValue(result);
                this.promote(cache._accessQueue, cache._writeQueue);
                this.onLoad.forEach(function (callback) {
                    callback.apply(null, [err, result]);
                });
                this.onLoad = [];
                this.loading = false;
            } catch (e) {
                err = e;
            }
        }
        if (err) {
            this.onLoad.forEach(function (callback) {
                callback.apply(null, [err, result]);
            });
            cache._rmEntry(this);
        }

    };


    function _asyncGet(key, callback) {
        /*jshint validthis:true */
        var cache = this,
            entry = this._cache[key];
        if (entry) {
            if (entry.loading) {
                //record miss, register callback and return
                cache.stats.missCount++;
                entry.onLoad.push(callback);
                return;
            }
            if (!this.isExpired(entry)) {
                entry.promote(this._accessQueue);
                cache.stats.hitCount++;
                callback.apply(null, [null, entry.value]);

            } else {
                cache.stats.missCount++;
                cache._notify(entry, cache._REMOVAL_CAUSE_E);
                entry.loading = true;
                entry.onLoad.push(callback);
                _asyncLoad(cache, _onLoad.bind(entry), key);

            }
        } else {
            cache.stats.missCount++;
            entry = cache._createEntry(key, null, true, callback);
            _asyncLoad(cache, _onLoad.bind(entry), key);
        }
    }

    function _syncLoad(cache, onLoad, key) {
        var err,
            result = null,
            loaderFn = cache._spec.loaderFn;
        if (loaderFn) {
            loaderFn.apply(null, [key, function (e, r) {
                err = e;
                result = r;
            }]);
            onLoad(err, result);
        }
        return result;
    }


    /**
     * Get value for key, NOTE: ** This is SYNChronous and result is returned by the function itself**
     * Automatically load the value if not present and an auto loader function is configured.
     * In this case, we assume that autoloader will also be calling the cache callback synchronously
     * Returns result contains the result from the cache, which in turn may have been
     * received from the autoloader, if the entry had expired or was not present
     * @memberOf Cache.prototype
     * @instance
     * @param key {String}
     * @returns {*} Value associated with the key in cache
     */
    Cache.prototype.getSync = function (key) {
        var suppressLoad = arguments.length > 2 && arguments[2];
        this.stats.requestCount++;
        var entry = this._cache[key],
            ret,
            cache = this;
        if (entry) {
            if (!this.isExpired(entry)) {
                entry.promote(this._accessQueue);
                ret = entry.value;
                this.stats.hitCount++;
            } else {
                this.stats.missCount++;
                if (!suppressLoad) {
                    ret = _syncLoad(cache, function (err, result) {
                        if (err)throw err;
                        cache._notify(entry, cache._REMOVAL_CAUSE_E);
                        entry.setValue(result);
                        entry.promote(cache._accessQueue, cache._writeQueue);

                    }, key);
                } else {
                    this._rmEntry(entry, this._REMOVAL_CAUSE_E);

                }

            }
        } else {
            this.stats.missCount++;
            if (!suppressLoad) {
                ret = _syncLoad(cache, function (err, result) {
                    if (err)throw err;
                    cache._createEntry(key, result);

                }, key);

            }

        }

        return ret;
    };

    /**
     * Get value for key as present in cache, No attempt to load the key will be done
     * even if a loader is configured
     * @memberOf Cache.prototype
     * @instance
     * @param key {String}
     * @return {*} value if present, null otherwise
     */
    Cache.prototype.getIfPresent = function (key) {
        return this.getSync(key, null, true);

    };

    /**
     * Invalidate value associated with the key
     * the given key(and associated value pair) is removed from cache.
     * If a removal listener is configured, it will be invoked with key value pair
     //and removal cause as 'explicit'
     * @memberOf Cache.prototype
     * @instance
     * @param key
     */
    Cache.prototype.invalidate = function (key) {
        var entry = this._cache[key];
        this._rmEntry(entry, this._REMOVAL_CAUSE_I);

    };

    Cache.prototype._notify = function (entry, cause) {
        if (this._spec.onRemove) {
            this._spec.onRemove.apply(null, [entry.key, entry.value, cause]);
        }

    };

    /**
     * Remove a cache entry
     * @param entry
     * @private
     */
    Cache.prototype._rmEntry = function (entry, cause) {
        entry.remove(this._accessQueue);
        entry.remove(this._writeQueue);
        this._updateCacheSize(entry, false);
        delete this._cache[entry.key];
        if (cause) {
            this._notify(entry, cause);
        }


    };

    /**
     * Invalidate all entries
     * Doesn't clean the stats
     */
    Cache.prototype.invalidateAll = function () {
        var cache=this;
        Object.keys(this._cache).forEach(function(key){
            cache.invalidate(key);
        });

    };


    /**
     * Can we remove entries
     * @return {*}
     * @private
     */
    Cache.prototype._canReap = function () {
        return (this._spec.maxSize && this.size >= this._spec.maxSize) ||
            (this._spec.maxWeight && this.weight > this._spec.maxWeight);
    };


    module.exports = Cache;

    /**
     * @name stats
     * @memberOf Cache.prototype
     * @instance
     * @type {Object}
     * @desc {'hitCount':{Number}, 'missCount':{Number}, 'reqeustCount':{Number}}
     */
}());





}).call(this,require('_process'))
},{"_process":1}]},{},[2])(2)
});
