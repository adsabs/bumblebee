(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = global || self, factory(global.manifest = {}, global.React));
}(this, (function (exports, React) { 'use strict';

  var React__default = 'default' in React ? React['default'] : React;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var _this = undefined;

  /* istanbul ignore file */

  /**
   * Universal global scope object. In the browser this is `self`, in Node.js and React Native it's `global`.
   * This file is excluded from coverage reporting because these globals are environment-specific so we can't test them all.
   */
  var globalScope = function () {
    _newArrowCheck(this, _this);

    if ((typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self.self === self) return self;
    if ((typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" && global.global === global) return global;
    if ((typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" && global.GLOBAL === global) return global;
    return {}; // fallback that relies on imported modules to be singletons
  }.bind(undefined)();
  /**
   * Globally available object used to connect the DevTools to all React Async instances.
   */


  globalScope.__REACT_ASYNC__ = globalScope.__REACT_ASYNC__ || {};
  var noop = function noop() {
    _newArrowCheck(this, _this);
  }.bind(undefined);
  var MockAbortController = function MockAbortController() {
    _classCallCheck(this, MockAbortController);

    this.abort = noop;
    this.signal = {};
  };

  var PropTypes;

  try {
    PropTypes = require("prop-types");
  } catch (e) {}

  var childrenFn = PropTypes && PropTypes.oneOfType([PropTypes.node, PropTypes.func]);
  var stateObject = PropTypes && PropTypes.shape({
    initialValue: PropTypes.any,
    data: PropTypes.any,
    error: PropTypes.instanceOf(Error),
    value: PropTypes.any,
    startedAt: PropTypes.instanceOf(Date),
    finishedAt: PropTypes.instanceOf(Date),
    status: PropTypes.oneOf(["initial", "pending", "fulfilled", "rejected"]),
    isInitial: PropTypes.bool,
    isPending: PropTypes.bool,
    isLoading: PropTypes.bool,
    isFulfilled: PropTypes.bool,
    isResolved: PropTypes.bool,
    isRejected: PropTypes.bool,
    isSettled: PropTypes.bool,
    counter: PropTypes.number,
    promise: PropTypes.instanceOf(Promise),
    run: PropTypes.func,
    reload: PropTypes.func,
    cancel: PropTypes.func,
    setData: PropTypes.func,
    setError: PropTypes.func
  });
  var propTypes = PropTypes && {
    Async: {
      children: childrenFn,
      promise: PropTypes.instanceOf(Promise),
      promiseFn: PropTypes.func,
      deferFn: PropTypes.func,
      watch: PropTypes.any,
      watchFn: PropTypes.func,
      initialValue: PropTypes.any,
      onResolve: PropTypes.func,
      onReject: PropTypes.func,
      reducer: PropTypes.func,
      dispatcher: PropTypes.func,
      debugLabel: PropTypes.string,
      suspense: PropTypes.bool
    },
    Initial: {
      children: childrenFn,
      state: stateObject.isRequired,
      persist: PropTypes.bool
    },
    Pending: {
      children: childrenFn,
      state: stateObject.isRequired,
      initial: PropTypes.bool
    },
    Fulfilled: {
      children: childrenFn,
      state: stateObject.isRequired,
      persist: PropTypes.bool
    },
    Rejected: {
      children: childrenFn,
      state: stateObject.isRequired,
      persist: PropTypes.bool
    },
    Settled: {
      children: childrenFn,
      state: stateObject.isRequired,
      persist: PropTypes.bool
    }
  };

  var _this$1 = undefined;

  var renderFn = function renderFn(children) {
    _newArrowCheck(this, _this$1);

    if (typeof children === "function") {
      var render = children;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return render.apply(void 0, args);
    }

    return children;
  }.bind(undefined);
  /**
   * Renders only when no promise has started or completed yet.
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {Object} state React Async state object
   * @prop {boolean} persist Show until we have data, even while pending (loading) or when an error occurred
   */


  var IfInitial = function IfInitial(_ref) {
    var children = _ref.children,
        persist = _ref.persist,
        _ref$state = _ref.state,
        state = _ref$state === void 0 ? {} : _ref$state;

    _newArrowCheck(this, _this$1);

    return React__default.createElement(React__default.Fragment, null, state.isInitial || persist && !state.data ? renderFn(children, state) : null);
  }.bind(undefined);
  /**
   * Renders only while pending (promise is loading).
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {Object} state React Async state object
   * @prop {boolean} initial Show only on initial load (data is undefined)
   */

  var IfPending = function IfPending(_ref2) {
    var children = _ref2.children,
        initial = _ref2.initial,
        _ref2$state = _ref2.state,
        state = _ref2$state === void 0 ? {} : _ref2$state;

    _newArrowCheck(this, _this$1);

    return React__default.createElement(React__default.Fragment, null, state.isPending && (!initial || !state.value) ? renderFn(children, state) : null);
  }.bind(undefined);
  /**
   * Renders only when promise is resolved.
   *
   * @prop {Function|Node} children Function (passing data and state) or React node
   * @prop {Object} state React Async state object
   * @prop {boolean} persist Show old data while pending (promise is loading)
   */

  var IfFulfilled = function IfFulfilled(_ref3) {
    var children = _ref3.children,
        persist = _ref3.persist,
        _ref3$state = _ref3.state,
        state = _ref3$state === void 0 ? {} : _ref3$state;

    _newArrowCheck(this, _this$1);

    return React__default.createElement(React__default.Fragment, null, state.isFulfilled || persist && state.data ? renderFn(children, state.data, state) : null);
  }.bind(undefined);
  /**
   * Renders only when promise is rejected.
   *
   * @prop {Function|Node} children Function (passing error and state) or React node
   * @prop {Object} state React Async state object
   * @prop {boolean} persist Show old error while pending (promise is loading)
   */

  var IfRejected = function IfRejected(_ref4) {
    var children = _ref4.children,
        persist = _ref4.persist,
        _ref4$state = _ref4.state,
        state = _ref4$state === void 0 ? {} : _ref4$state;

    _newArrowCheck(this, _this$1);

    return React__default.createElement(React__default.Fragment, null, state.isRejected || persist && state.error ? renderFn(children, state.error, state) : null);
  }.bind(undefined);
  /**
   * Renders only when promise is fulfilled or rejected.
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {Object} state React Async state object
   * @prop {boolean} persist Show old data or error while pending (promise is loading)
   */

  var IfSettled = function IfSettled(_ref5) {
    var children = _ref5.children,
        persist = _ref5.persist,
        _ref5$state = _ref5.state,
        state = _ref5$state === void 0 ? {} : _ref5$state;

    _newArrowCheck(this, _this$1);

    return React__default.createElement(React__default.Fragment, null, state.isSettled || persist && state.value ? renderFn(children, state) : null);
  }.bind(undefined);

  if (propTypes) {
    IfInitial.propTypes = propTypes.Initial;
    IfPending.propTypes = propTypes.Pending;
    IfFulfilled.propTypes = propTypes.Fulfilled;
    IfRejected.propTypes = propTypes.Rejected;
    IfSettled.propTypes = propTypes.Settled;
  }

  var _this$2 = undefined;

  (function (StatusTypes) {
    StatusTypes["initial"] = "initial";
    StatusTypes["pending"] = "pending";
    StatusTypes["fulfilled"] = "fulfilled";
    StatusTypes["rejected"] = "rejected";
  })(exports.StatusTypes || (exports.StatusTypes = {}));

  var getInitialStatus = function getInitialStatus(value, promise) {
    _newArrowCheck(this, _this$2);

    if (value instanceof Error) return exports.StatusTypes.rejected;
    if (value !== undefined) return exports.StatusTypes.fulfilled;
    if (promise) return exports.StatusTypes.pending;
    return exports.StatusTypes.initial;
  }.bind(undefined);
  var getIdleStatus = function getIdleStatus(value) {
    _newArrowCheck(this, _this$2);

    if (value instanceof Error) return exports.StatusTypes.rejected;
    if (value !== undefined) return exports.StatusTypes.fulfilled;
    return exports.StatusTypes.initial;
  }.bind(undefined);
  var getStatusProps = function getStatusProps(status) {
    _newArrowCheck(this, _this$2);

    return {
      status: status,
      isInitial: status === exports.StatusTypes.initial,
      isPending: status === exports.StatusTypes.pending,
      isLoading: status === exports.StatusTypes.pending,
      isFulfilled: status === exports.StatusTypes.fulfilled,
      isResolved: status === exports.StatusTypes.fulfilled,
      isRejected: status === exports.StatusTypes.rejected,
      isSettled: status === exports.StatusTypes.fulfilled || status === exports.StatusTypes.rejected
    };
  }.bind(undefined);

  var _this$3 = undefined;
  // The way NeverSettle extends from Promise is complicated, but can't be done differently because Babel doesn't support
  // extending built-in classes. See https://babeljs.io/docs/en/caveats/#classes

  var NeverSettle = function NeverSettle() {};
  /* istanbul ignore next */


  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(NeverSettle, Promise);
  } else {
    NeverSettle.__proto__ = Promise;
  }

  NeverSettle.prototype = Object.assign(Object.create(Promise.prototype), {
    finally: function _finally() {
      return this;
    },
    catch: function _catch() {
      return this;
    },
    then: function then() {
      return this;
    }
  });
  var neverSettle = new NeverSettle();

  (function (ActionTypes) {
    ActionTypes["start"] = "start";
    ActionTypes["cancel"] = "cancel";
    ActionTypes["fulfill"] = "fulfill";
    ActionTypes["reject"] = "reject";
  })(exports.ActionTypes || (exports.ActionTypes = {}));

  var init = function init(_ref) {
    var initialValue = _ref.initialValue,
        promise = _ref.promise,
        promiseFn = _ref.promiseFn;

    _newArrowCheck(this, _this$3);

    return _objectSpread2({
      initialValue: initialValue,
      data: initialValue instanceof Error ? undefined : initialValue,
      error: initialValue instanceof Error ? initialValue : undefined,
      value: initialValue,
      startedAt: promise || promiseFn ? new Date() : undefined,
      finishedAt: initialValue ? new Date() : undefined
    }, getStatusProps(getInitialStatus(initialValue, promise || promiseFn)), {
      counter: 0,
      promise: neverSettle
    });
  }.bind(undefined);
  var reducer = function reducer(state, action) {
    _newArrowCheck(this, _this$3);

    switch (action.type) {
      case exports.ActionTypes.start:
        return _objectSpread2({}, state, {
          startedAt: new Date(),
          finishedAt: undefined
        }, getStatusProps(exports.StatusTypes.pending), {
          counter: action.meta.counter,
          promise: action.meta.promise
        });

      case exports.ActionTypes.cancel:
        return _objectSpread2({}, state, {
          startedAt: undefined,
          finishedAt: undefined
        }, getStatusProps(getIdleStatus(state.error || state.data)), {
          counter: action.meta.counter,
          promise: action.meta.promise
        });

      case exports.ActionTypes.fulfill:
        return _objectSpread2({}, state, {
          data: action.payload,
          value: action.payload,
          error: undefined,
          finishedAt: new Date()
        }, getStatusProps(exports.StatusTypes.fulfilled), {
          promise: action.meta.promise
        });

      case exports.ActionTypes.reject:
        return _objectSpread2({}, state, {
          error: action.payload,
          value: action.payload,
          finishedAt: new Date()
        }, getStatusProps(exports.StatusTypes.rejected), {
          promise: action.meta.promise
        });

      default:
        return state;
    }
  }.bind(undefined);
  var dispatchMiddleware = function dispatchMiddleware(dispatch) {
    var _this2 = this;

    _newArrowCheck(this, _this$3);

    return function (action) {
      _newArrowCheck(this, _this2);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      dispatch.apply(void 0, [action].concat(args));

      if (action.type === exports.ActionTypes.start && typeof action.payload === "function") {
        action.payload();
      }
    }.bind(this);
  }.bind(undefined);

  var Async =
  /*#__PURE__*/
  function (_React$Component) {
    _inherits(Async, _React$Component);

    function Async() {
      _classCallCheck(this, Async);

      return _possibleConstructorReturn(this, _getPrototypeOf(Async).apply(this, arguments));
    }

    return Async;
  }(React__default.Component);
  /**
   * createInstance allows you to create instances of Async that are bound to a specific promise.
   * A unique instance also uses its own React context for better nesting capability.
   */


  function createInstance() {
    var _this14 = this;

    var defaultOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var displayName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Async";

    var _React$createContext = React__default.createContext(undefined),
        UnguardedConsumer = _React$createContext.Consumer,
        Provider = _React$createContext.Provider;

    function Consumer(_ref) {
      var _this = this;

      var children = _ref.children;
      return React__default.createElement(UnguardedConsumer, null, function (value) {
        _newArrowCheck(this, _this);

        if (!value) {
          throw new Error("this component should only be used within an associated <Async> component!");
        }

        return children(value);
      }.bind(this));
    }

    var Async =
    /*#__PURE__*/
    function (_React$Component2) {
      _inherits(Async, _React$Component2);

      function Async(props) {
        var _this3 = this;

        var _this2;

        _classCallCheck(this, Async);

        _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Async).call(this, props));
        _this2.mounted = false;
        _this2.counter = 0;
        _this2.args = [];
        _this2.promise = neverSettle;
        _this2.abortController = new MockAbortController();
        _this2.start = _this2.start.bind(_assertThisInitialized(_this2));
        _this2.load = _this2.load.bind(_assertThisInitialized(_this2));
        _this2.run = _this2.run.bind(_assertThisInitialized(_this2));
        _this2.cancel = _this2.cancel.bind(_assertThisInitialized(_this2));
        _this2.onResolve = _this2.onResolve.bind(_assertThisInitialized(_this2));
        _this2.onReject = _this2.onReject.bind(_assertThisInitialized(_this2));
        _this2.setData = _this2.setData.bind(_assertThisInitialized(_this2));
        _this2.setError = _this2.setError.bind(_assertThisInitialized(_this2));
        var promise = props.promise;
        var promiseFn = props.promiseFn || defaultOptions.promiseFn;
        var initialValue = props.initialValue || defaultOptions.initialValue;
        _this2.state = _objectSpread2({}, init({
          initialValue: initialValue,
          promise: promise,
          promiseFn: promiseFn
        }), {
          cancel: _this2.cancel,
          run: _this2.run,
          reload: function reload() {
            var _this4;

            _newArrowCheck(this, _this3);

            _this2.load();

            (_this4 = _this2).run.apply(_this4, _toConsumableArray(_this2.args));
          }.bind(this),
          setData: _this2.setData,
          setError: _this2.setError
        });
        _this2.debugLabel = props.debugLabel || defaultOptions.debugLabel;
        var devToolsDispatcher = globalScope.__REACT_ASYNC__.devToolsDispatcher;

        var _reducer = props.reducer || defaultOptions.reducer;

        var _dispatcher = props.dispatcher || defaultOptions.dispatcher || devToolsDispatcher;

        var reducer$1 = _reducer ? function (state, action) {
          _newArrowCheck(this, _this3);

          return _reducer(state, action, reducer);
        }.bind(this) : reducer;
        var dispatch = dispatchMiddleware(function (action, callback) {
          var _this5 = this;

          _newArrowCheck(this, _this3);

          _this2.setState(function (state) {
            _newArrowCheck(this, _this5);

            return reducer$1(state, action);
          }.bind(this), callback);
        }.bind(this));
        _this2.dispatch = _dispatcher ? function (action) {
          _newArrowCheck(this, _this3);

          return _dispatcher(action, dispatch, props);
        }.bind(this) : dispatch;
        return _this2;
      }

      _createClass(Async, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          this.mounted = true;

          if (this.props.promise || !this.state.initialValue) {
            this.load();
          }
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps) {
          var _this$props = this.props,
              watch = _this$props.watch,
              _this$props$watchFn = _this$props.watchFn,
              watchFn = _this$props$watchFn === void 0 ? defaultOptions.watchFn : _this$props$watchFn,
              promise = _this$props.promise,
              promiseFn = _this$props.promiseFn;

          if (watch !== prevProps.watch) {
            if (this.counter) this.cancel();
            return this.load();
          }

          if (watchFn && watchFn(_objectSpread2({}, defaultOptions, {}, this.props), _objectSpread2({}, defaultOptions, {}, prevProps))) {
            if (this.counter) this.cancel();
            return this.load();
          }

          if (promise !== prevProps.promise) {
            if (this.counter) this.cancel();
            if (promise) return this.load();
          }

          if (promiseFn !== prevProps.promiseFn) {
            if (this.counter) this.cancel();
            if (promiseFn) return this.load();
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.cancel();
          this.mounted = false;
        }
      }, {
        key: "getMeta",
        value: function getMeta(meta) {
          return _objectSpread2({
            counter: this.counter,
            promise: this.promise,
            debugLabel: this.debugLabel
          }, meta);
        }
      }, {
        key: "start",
        value: function start(promiseFn) {
          var _this6 = this;

          if ("AbortController" in globalScope) {
            this.abortController.abort();
            this.abortController = new globalScope.AbortController();
          }

          this.counter++;
          return this.promise = new Promise(function (resolve, reject) {
            var _this7 = this;

            _newArrowCheck(this, _this6);

            if (!this.mounted) return;

            var executor = function executor() {
              _newArrowCheck(this, _this7);

              return promiseFn().then(resolve, reject);
            }.bind(this);

            this.dispatch({
              type: exports.ActionTypes.start,
              payload: executor,
              meta: this.getMeta()
            });
          }.bind(this));
        }
      }, {
        key: "load",
        value: function load() {
          var _this8 = this;

          var promise = this.props.promise;
          var promiseFn = this.props.promiseFn || defaultOptions.promiseFn;

          if (promise) {
            this.start(function () {
              _newArrowCheck(this, _this8);

              return promise;
            }.bind(this)).then(this.onResolve(this.counter)).catch(this.onReject(this.counter));
          } else if (promiseFn) {
            var props = _objectSpread2({}, defaultOptions, {}, this.props);

            this.start(function () {
              _newArrowCheck(this, _this8);

              return promiseFn(props, this.abortController);
            }.bind(this)).then(this.onResolve(this.counter)).catch(this.onReject(this.counter));
          }
        }
      }, {
        key: "run",
        value: function run() {
          var _this9 = this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var deferFn = this.props.deferFn || defaultOptions.deferFn;

          if (deferFn) {
            this.args = args;

            var props = _objectSpread2({}, defaultOptions, {}, this.props);

            return this.start(function () {
              _newArrowCheck(this, _this9);

              return deferFn(args, props, this.abortController);
            }.bind(this)).then(this.onResolve(this.counter), this.onReject(this.counter));
          }
        }
      }, {
        key: "cancel",
        value: function cancel() {
          var onCancel = this.props.onCancel || defaultOptions.onCancel;
          onCancel && onCancel();
          this.counter++;
          this.abortController.abort();
          this.mounted && this.dispatch({
            type: exports.ActionTypes.cancel,
            meta: this.getMeta()
          });
        }
      }, {
        key: "onResolve",
        value: function onResolve(counter) {
          var _this10 = this;

          return function (data) {
            var _this11 = this;

            _newArrowCheck(this, _this10);

            if (this.counter === counter) {
              var onResolve = this.props.onResolve || defaultOptions.onResolve;
              this.setData(data, function () {
                _newArrowCheck(this, _this11);

                return onResolve && onResolve(data);
              }.bind(this));
            }

            return data;
          }.bind(this);
        }
      }, {
        key: "onReject",
        value: function onReject(counter) {
          var _this12 = this;

          return function (error) {
            var _this13 = this;

            _newArrowCheck(this, _this12);

            if (this.counter === counter) {
              var onReject = this.props.onReject || defaultOptions.onReject;
              this.setError(error, function () {
                _newArrowCheck(this, _this13);

                return onReject && onReject(error);
              }.bind(this));
            }

            return error;
          }.bind(this);
        }
      }, {
        key: "setData",
        value: function setData(data, callback) {
          this.mounted && this.dispatch({
            type: exports.ActionTypes.fulfill,
            payload: data,
            meta: this.getMeta()
          }, callback);
          return data;
        }
      }, {
        key: "setError",
        value: function setError(error, callback) {
          this.mounted && this.dispatch({
            type: exports.ActionTypes.reject,
            payload: error,
            error: true,
            meta: this.getMeta()
          }, callback);
          return error;
        }
      }, {
        key: "render",
        value: function render() {
          var _this$props2 = this.props,
              children = _this$props2.children,
              suspense = _this$props2.suspense;

          if (suspense && this.state.isPending && this.promise !== neverSettle) {
            // Rely on Suspense to handle the loading state
            throw this.promise;
          }

          if (typeof children === "function") {
            var render = children;
            return React__default.createElement(Provider, {
              value: this.state
            }, render(this.state));
          }

          if (children !== undefined && children !== null) {
            return React__default.createElement(Provider, {
              value: this.state
            }, children);
          }

          return null;
        }
      }]);

      return Async;
    }(React__default.Component);

    if (propTypes) Async.propTypes = propTypes.Async;

    var AsyncInitial = function AsyncInitial(props) {
      var _this15 = this;

      _newArrowCheck(this, _this14);

      return React__default.createElement(Consumer, null, function (st) {
        _newArrowCheck(this, _this15);

        return React__default.createElement(IfInitial, Object.assign({}, props, {
          state: st
        }));
      }.bind(this));
    }.bind(this);

    var AsyncPending = function AsyncPending(props) {
      var _this16 = this;

      _newArrowCheck(this, _this14);

      return React__default.createElement(Consumer, null, function (st) {
        _newArrowCheck(this, _this16);

        return React__default.createElement(IfPending, Object.assign({}, props, {
          state: st
        }));
      }.bind(this));
    }.bind(this);

    var AsyncFulfilled = function AsyncFulfilled(props) {
      var _this17 = this;

      _newArrowCheck(this, _this14);

      return React__default.createElement(Consumer, null, function (st) {
        _newArrowCheck(this, _this17);

        return React__default.createElement(IfFulfilled, Object.assign({}, props, {
          state: st
        }));
      }.bind(this));
    }.bind(this);

    var AsyncRejected = function AsyncRejected(props) {
      var _this18 = this;

      _newArrowCheck(this, _this14);

      return React__default.createElement(Consumer, null, function (st) {
        _newArrowCheck(this, _this18);

        return React__default.createElement(IfRejected, Object.assign({}, props, {
          state: st
        }));
      }.bind(this));
    }.bind(this);

    var AsyncSettled = function AsyncSettled(props) {
      var _this19 = this;

      _newArrowCheck(this, _this14);

      return React__default.createElement(Consumer, null, function (st) {
        _newArrowCheck(this, _this19);

        return React__default.createElement(IfSettled, Object.assign({}, props, {
          state: st
        }));
      }.bind(this));
    }.bind(this);

    AsyncInitial.displayName = "".concat(displayName, ".Initial");
    AsyncPending.displayName = "".concat(displayName, ".Pending");
    AsyncFulfilled.displayName = "".concat(displayName, ".Fulfilled");
    AsyncRejected.displayName = "".concat(displayName, ".Rejected");
    AsyncSettled.displayName = "".concat(displayName, ".Settled");
    return Object.assign(Async, {
      displayName: displayName,
      Initial: AsyncInitial,
      Pending: AsyncPending,
      Loading: AsyncPending,
      Fulfilled: AsyncFulfilled,
      Resolved: AsyncFulfilled,
      Rejected: AsyncRejected,
      Settled: AsyncSettled
    });
  }
  var Async$1 = createInstance();

  var _this13 = undefined;

  function useAsync(arg1, arg2) {
    var _this = this;

    var options = typeof arg1 === "function" ? _objectSpread2({}, arg2, {
      promiseFn: arg1
    }) : arg1;
    var counter = React.useRef(0);
    var isMounted = React.useRef(true);
    var lastArgs = React.useRef(undefined);
    var lastOptions = React.useRef(options);
    var lastPromise = React.useRef(neverSettle);
    var abortController = React.useRef(new MockAbortController());
    var devToolsDispatcher = globalScope.__REACT_ASYNC__.devToolsDispatcher;
    var reducer$1 = options.reducer,
        _options$dispatcher = options.dispatcher,
        dispatcher = _options$dispatcher === void 0 ? devToolsDispatcher : _options$dispatcher;

    var _useReducer = React.useReducer(reducer$1 ? function (state, action) {
      _newArrowCheck(this, _this);

      return reducer$1(state, action, reducer);
    }.bind(this) : reducer, options, init),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        state = _useReducer2[0],
        _dispatch = _useReducer2[1];

    var dispatch = React.useCallback(dispatcher ? function (action) {
      _newArrowCheck(this, _this);

      return dispatcher(action, dispatchMiddleware(_dispatch), lastOptions.current);
    }.bind(this) : dispatchMiddleware(_dispatch), [dispatcher]);
    var debugLabel = options.debugLabel;
    var getMeta = React.useCallback(function (meta) {
      _newArrowCheck(this, _this);

      return _objectSpread2({
        counter: counter.current,
        promise: lastPromise.current,
        debugLabel: debugLabel
      }, meta);
    }.bind(this), [debugLabel]);
    var setData = React.useCallback(function (data) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

      _newArrowCheck(this, _this);

      if (isMounted.current) {
        dispatch({
          type: exports.ActionTypes.fulfill,
          payload: data,
          meta: getMeta()
        });
        callback();
      }

      return data;
    }.bind(this), [dispatch, getMeta]);
    var setError = React.useCallback(function (error) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

      _newArrowCheck(this, _this);

      if (isMounted.current) {
        dispatch({
          type: exports.ActionTypes.reject,
          payload: error,
          error: true,
          meta: getMeta()
        });
        callback();
      }

      return error;
    }.bind(this), [dispatch, getMeta]);
    var onResolve = options.onResolve,
        onReject = options.onReject;
    var handleResolve = React.useCallback(function (count) {
      var _this2 = this;

      _newArrowCheck(this, _this);

      return function (data) {
        var _this3 = this;

        _newArrowCheck(this, _this2);

        return count === counter.current && setData(data, function () {
          _newArrowCheck(this, _this3);

          return onResolve && onResolve(data);
        }.bind(this));
      }.bind(this);
    }.bind(this), [setData, onResolve]);
    var handleReject = React.useCallback(function (count) {
      var _this4 = this;

      _newArrowCheck(this, _this);

      return function (err) {
        var _this5 = this;

        _newArrowCheck(this, _this4);

        return count === counter.current && setError(err, function () {
          _newArrowCheck(this, _this5);

          return onReject && onReject(err);
        }.bind(this));
      }.bind(this);
    }.bind(this), [setError, onReject]);
    var start = React.useCallback(function (promiseFn) {
      var _this6 = this;

      _newArrowCheck(this, _this);

      if ("AbortController" in globalScope) {
        abortController.current.abort();
        abortController.current = new globalScope.AbortController();
      }

      counter.current++;
      return lastPromise.current = new Promise(function (resolve, reject) {
        var _this7 = this;

        _newArrowCheck(this, _this6);

        if (!isMounted.current) return;

        var executor = function executor() {
          _newArrowCheck(this, _this7);

          return promiseFn().then(resolve, reject);
        }.bind(this);

        dispatch({
          type: exports.ActionTypes.start,
          payload: executor,
          meta: getMeta()
        });
      }.bind(this));
    }.bind(this), [dispatch, getMeta]);
    var promise = options.promise,
        promiseFn = options.promiseFn,
        initialValue = options.initialValue;
    var load = React.useCallback(function () {
      var _this8 = this;

      _newArrowCheck(this, _this);

      var isPreInitialized = initialValue && counter.current === 0;

      if (promise) {
        start(function () {
          _newArrowCheck(this, _this8);

          return promise;
        }.bind(this)).then(handleResolve(counter.current)).catch(handleReject(counter.current));
      } else if (promiseFn && !isPreInitialized) {
        start(function () {
          _newArrowCheck(this, _this8);

          return promiseFn(lastOptions.current, abortController.current);
        }.bind(this)).then(handleResolve(counter.current)).catch(handleReject(counter.current));
      }
    }.bind(this), [start, promise, promiseFn, initialValue, handleResolve, handleReject]);
    var deferFn = options.deferFn;
    var run = React.useCallback(function () {
      var _this9 = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _newArrowCheck(this, _this);

      if (deferFn) {
        lastArgs.current = args;
        start(function () {
          _newArrowCheck(this, _this9);

          return deferFn(args, lastOptions.current, abortController.current);
        }.bind(this)).then(handleResolve(counter.current)).catch(handleReject(counter.current));
      }
    }.bind(this), [start, deferFn, handleResolve, handleReject]);
    var reload = React.useCallback(function () {
      _newArrowCheck(this, _this);

      lastArgs.current ? run.apply(void 0, _toConsumableArray(lastArgs.current)) : load();
    }.bind(this), [run, load]);
    var onCancel = options.onCancel;
    var cancel = React.useCallback(function () {
      _newArrowCheck(this, _this);

      onCancel && onCancel();
      counter.current++;
      abortController.current.abort();
      isMounted.current && dispatch({
        type: exports.ActionTypes.cancel,
        meta: getMeta()
      });
    }.bind(this), [onCancel, dispatch, getMeta]);
    /* These effects should only be triggered on changes to specific props */

    /* eslint-disable react-hooks/exhaustive-deps */

    var watch = options.watch,
        watchFn = options.watchFn;
    React.useEffect(function () {
      _newArrowCheck(this, _this);

      if (watchFn && lastOptions.current && watchFn(options, lastOptions.current)) {
        lastOptions.current = options;
        load();
      }
    }.bind(this));
    React.useEffect(function () {
      _newArrowCheck(this, _this);

      lastOptions.current = options;
    }.bind(this), [options]);
    React.useEffect(function () {
      _newArrowCheck(this, _this);

      if (counter.current) cancel();
      if (promise || promiseFn) load();
    }.bind(this), [promise, promiseFn, watch]);
    React.useEffect(function () {
      var _this10 = this;

      _newArrowCheck(this, _this);

      return function () {
        _newArrowCheck(this, _this10);

        isMounted.current = false;
      }.bind(this);
    }.bind(this), []);
    React.useEffect(function () {
      var _this11 = this;

      _newArrowCheck(this, _this);

      return function () {
        _newArrowCheck(this, _this11);

        return cancel();
      }.bind(this);
    }.bind(this), []);
    /* eslint-enable react-hooks/exhaustive-deps */

    React.useDebugValue(state, function (_ref) {
      var status = _ref.status;

      _newArrowCheck(this, _this);

      return "[".concat(counter.current, "] ").concat(status);
    }.bind(this));

    if (options.suspense && state.isPending && lastPromise.current !== neverSettle) {
      // Rely on Suspense to handle the loading state
      throw lastPromise.current;
    }

    return React.useMemo(function () {
      _newArrowCheck(this, _this);

      return _objectSpread2({}, state, {
        run: run,
        reload: reload,
        cancel: cancel,
        setData: setData,
        setError: setError
      });
    }.bind(this), [state, run, reload, cancel, setData, setError]);
  }

  var FetchError =
  /*#__PURE__*/
  function (_Error) {
    _inherits(FetchError, _Error);

    function FetchError(response) {
      var _this12;

      _classCallCheck(this, FetchError);

      _this12 = _possibleConstructorReturn(this, _getPrototypeOf(FetchError).call(this, "".concat(response.status, " ").concat(response.statusText)));
      _this12.response = response;
      /* istanbul ignore next */

      if (Object.setPrototypeOf) {
        // Not available in IE 10, but can be polyfilled
        Object.setPrototypeOf(_assertThisInitialized(_this12), FetchError.prototype);
      }

      return _this12;
    }

    return FetchError;
  }(_wrapNativeSuper(Error));

  var parseResponse = function parseResponse(accept, json) {
    var _this14 = this;

    _newArrowCheck(this, _this13);

    return function (res) {
      _newArrowCheck(this, _this14);

      if (!res.ok) return Promise.reject(new FetchError(res));
      if (typeof json === "boolean") return json ? res.json() : res;
      return accept === "application/json" ? res.json() : res;
    }.bind(this);
  }.bind(undefined);

  function isEvent(e) {
    return _typeof(e) === "object" && "preventDefault" in e;
  }
  /**
   *
   * @param {RequestInfo} resource
   * @param {RequestInit} init
   * @param {FetchOptions} options
   * @returns {AsyncState<T, FetchRun<T>>}
   */


  function useAsyncFetch(resource, init) {
    var _this15 = this;

    var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        defer = _ref2.defer,
        json = _ref2.json,
        options = _objectWithoutProperties(_ref2, ["defer", "json"]);

    var method = resource.method || init && init.method;
    var headers = resource.headers || init && init.headers || {};
    var accept = headers["Accept"] || headers["accept"] || headers.get && headers.get("accept");

    var doFetch = function doFetch(input, init) {
      _newArrowCheck(this, _this15);

      return globalScope.fetch(input, init).then(parseResponse(accept, json));
    }.bind(this);

    var isDefer = typeof defer === "boolean" ? defer : ["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1;
    var fn = isDefer ? "deferFn" : "promiseFn";
    var identity = JSON.stringify({
      resource: resource,
      init: init,
      isDefer: isDefer
    });
    var promiseFn = React.useCallback(function (_, _ref3) {
      var signal = _ref3.signal;

      _newArrowCheck(this, _this15);

      return doFetch(resource, _objectSpread2({
        signal: signal
      }, init));
    }.bind(this), [identity] // eslint-disable-line react-hooks/exhaustive-deps
    );
    var deferFn = React.useCallback(function (_ref4, _, _ref5) {
      var _ref6 = _slicedToArray(_ref4, 1),
          override = _ref6[0];

      var signal = _ref5.signal;

      if (!override || isEvent(override)) {
        return doFetch(resource, _objectSpread2({
          signal: signal
        }, init));
      }

      if (typeof override === "function") {
        var _override = override(_objectSpread2({
          resource: resource,
          signal: signal
        }, init)),
            _runResource = _override.resource,
            _runInit = _objectWithoutProperties(_override, ["resource"]);

        return doFetch(_runResource || resource, _objectSpread2({
          signal: signal
        }, _runInit));
      }

      var runResource = override.resource,
          runInit = _objectWithoutProperties(override, ["resource"]);

      return doFetch(runResource || resource, _objectSpread2({
        signal: signal
      }, init, {}, runInit));
    }, [identity] // eslint-disable-line react-hooks/exhaustive-deps
    );
    var state = useAsync(_objectSpread2({}, options, _defineProperty({}, fn, isDefer ? deferFn : promiseFn)));
    React.useDebugValue(state, function (_ref7) {
      var counter = _ref7.counter,
          status = _ref7.status;

      _newArrowCheck(this, _this15);

      return "[".concat(counter, "] ").concat(status);
    }.bind(this));
    return state;
  }

  var unsupported = function unsupported() {
    _newArrowCheck(this, _this13);

    throw new Error("useAsync requires React v16.8 or up. Upgrade your React version or use the <Async> component instead.");
  }.bind(undefined);

  var useAsync$1 = React.useEffect ? useAsync : unsupported;
  var useFetch = React.useEffect ? useAsyncFetch : unsupported;

  exports.Async = Async$1;
  exports.FetchError = FetchError;
  exports.IfFulfilled = IfFulfilled;
  exports.IfInitial = IfInitial;
  exports.IfPending = IfPending;
  exports.IfRejected = IfRejected;
  exports.IfSettled = IfSettled;
  exports.createInstance = createInstance;
  exports.default = Async$1;
  exports.dispatchMiddleware = dispatchMiddleware;
  exports.globalScope = globalScope;
  exports.init = init;
  exports.neverSettle = neverSettle;
  exports.reducer = reducer;
  exports.useAsync = useAsync$1;
  exports.useFetch = useFetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
